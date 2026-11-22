import { useStore } from '@nanostores/react'
import { Banknote, Check, CreditCard, MapPin, ShoppingBasket, Store, Truck } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Textarea } from '@/components/atoms/Textarea'
import { EmptyState } from '@/components/molecules/EmptyState'
import { FormField } from '@/components/molecules/FormField'
import { OptionCard } from '@/components/molecules/OptionCard'
import { withQuery } from '@/lib/queries/client'
import { useProfile } from '@/lib/queries/auth'
import { useCart, useClearCart, useCreateOrder, useCreatePayment } from '@/lib/queries/commerce'
import { cartSubtotal } from '@/lib/hooks/useCartActions'
import { getErrorMessage } from '@/lib/api/errors'
import { paySnap } from '@/lib/payments/midtrans'
import { PAYMENT_OPTIONS, SHIPPING_FEE, SHIPPING_OPTIONS } from '@/lib/constants'
import { buildMapsLink, cn, formatRupiah, formatWeight, redirectTo } from '@/lib/utils'
import { $session } from '@/stores/session'
import { $checkoutDraft, CHECKOUT_STEPS, resetCheckoutDraft, setCheckoutField, type CheckoutStep } from '@/stores/checkout'
import { toast } from '@/stores/feedback'

const STEP_LABELS: Record<CheckoutStep, string> = {
  address: 'Alamat pengiriman',
  shipping: 'Metode pengiriman',
  payment: 'Pembayaran',
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function nowParts() {
  const now = new Date()
  return {
    date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
    time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
  }
}

function StepSection({
  step,
  index,
  active,
  done,
  summary,
  onEdit,
  children,
}: {
  step: CheckoutStep
  index: number
  active: boolean
  done: boolean
  summary?: ReactNode
  onEdit: () => void
  children: ReactNode
}) {
  return (
    <Card className={cn('p-5 sm:p-6', active && 'ring-2 ring-leaf-200')}>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
            done ? 'bg-leaf-600 text-white' : active ? 'bg-leaf-50 text-leaf-700' : 'bg-cream-100 text-ink-500',
          )}
        >
          {done ? <Check className="h-4 w-4" /> : index + 1}
        </span>
        <h2 className="flex-1 text-base font-bold">{STEP_LABELS[step]}</h2>
        {!active && done ? (
          <button type="button" onClick={onEdit} className="text-sm font-semibold text-leaf-700 hover:underline">
            Ubah
          </button>
        ) : null}
      </div>
      {active ? <div className="mt-5">{children}</div> : summary ? <div className="mt-3 pl-11 text-sm text-ink-700">{summary}</div> : null}
    </Card>
  )
}

function CheckoutViewBase() {
  const draft = useStore($checkoutDraft)
  const profile = useProfile()
  const cart = useCart()
  const createOrder = useCreateOrder()
  const createPayment = useCreatePayment()
  const clearCart = useClearCart()
  const [submitting, setSubmitting] = useState(false)

  const items = cart.data ?? []
  const subtotal = cartSubtotal(items)
  const shippingFee = draft.shippingType === 'Delivery' ? SHIPPING_FEE : 0
  const total = subtotal + shippingFee
  const user = profile.data
  const stepIndex = CHECKOUT_STEPS.indexOf(draft.step)

  if (profile.isPending || cart.isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-40 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
          <Skeleton className="h-20 w-full rounded-card" />
        </div>
        <Skeleton className="h-80 w-full rounded-card" />
      </div>
    )
  }

  if (profile.isError || cart.isError) {
    return (
      <EmptyState
        icon={<ShoppingBasket />}
        title="Gagal memuat data checkout"
        description={getErrorMessage(profile.error ?? cart.error)}
        action={<Button onClick={() => window.location.reload()}>Coba lagi</Button>}
      />
    )
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={<ShoppingBasket />}
        title="Keranjangmu kosong"
        description="Tambahkan produk ke keranjang sebelum checkout."
        action={<Button href="/shop">Mulai belanja</Button>}
        className="rounded-card border border-dashed border-cream-200 bg-white"
      />
    )
  }

  if (!user?.address) {
    return (
      <EmptyState
        icon={<MapPin />}
        title="Lengkapi alamat pengiriman"
        description="Kami butuh alamat dan nomor teleponmu agar pesanan bisa diantar."
        action={<Button href="/account/setting?redirect=/shop/checkout">Lengkapi profil</Button>}
        className="rounded-card border border-dashed border-cream-200 bg-white"
      />
    )
  }

  const mapsLink = buildMapsLink(user.lat, user.lng)

  function goTo(step: CheckoutStep) {
    setCheckoutField('step', step)
  }

  async function placeOrder() {
    if (!draft.shippingType) {
      toast.error('Pilih metode pengiriman terlebih dahulu')
      goTo('shipping')
      return
    }
    if (!draft.paymentMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu')
      return
    }
    const buyerId = $session.get()?.id || user?.id
    if (!buyerId) {
      toast.error('Sesi tidak valid, silakan masuk kembali')
      return
    }
    setSubmitting(true)
    try {
      const { date, time } = nowParts()
      const order = await createOrder.mutateAsync({
        payload: {
          buyer_id: buyerId,
          order_date: date,
          order_time: time,
          total_amount: total,
          shipping_type: draft.shippingType,
          payment_type: draft.paymentMethod,
          remarks: draft.remarks,
          order_details: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
        },
        lat: user?.lat ?? null,
        lng: user?.lng ?? null,
      })
      const payment = await createPayment.mutateAsync({
        order_id: order.order_id,
        remarks: draft.remarks,
        payment_method: draft.paymentMethod,
        gross_amount: total,
        user_id: buyerId,
      })

      let outcome: 'success' | 'pending' | 'error' | 'closed' = 'success'
      if (payment?.payment_token) outcome = await paySnap(payment.payment_token)

      if (outcome === 'success' || outcome === 'pending') {
        await clearCart.mutateAsync().catch(() => null)
        resetCheckoutDraft()
        const params = new URLSearchParams()
        if (order?.order_id) params.set('order', String(order.order_id))
        if (outcome === 'pending') params.set('status', 'pending')
        const query = params.toString()
        redirectTo(`/shop/success-payment${query ? `?${query}` : ''}`)
        return
      }
      if (outcome === 'error') toast.error('Pembayaran gagal', 'Silakan coba lagi atau pilih metode lain.')
      if (outcome === 'closed') toast.info('Pembayaran belum selesai', 'Kamu menutup jendela pembayaran.')
    } catch (error) {
      toast.error('Gagal membuat pesanan', getErrorMessage(error))
    } finally {
      setSubmitting(false)
    }
  }

  const shippingLabel = SHIPPING_OPTIONS.find((option) => option.value === draft.shippingType)?.label
  const paymentLabel = PAYMENT_OPTIONS.find((option) => option.value === draft.paymentMethod)?.label

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-4">
        <StepSection
          step="address"
          index={0}
          active={draft.step === 'address'}
          done={stepIndex > 0}
          onEdit={() => goTo('address')}
          summary={`${user.name} · ${user.address}`}
        >
          <div className="rounded-2xl border border-leaf-200 bg-leaf-50/60 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" />
              <div className="text-sm">
                <p className="font-bold">{user.name}</p>
                <p className="text-ink-700">{user.phone}</p>
                <p className="mt-1 text-ink-700">{user.address}</p>
                {mapsLink ? (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block font-semibold text-leaf-700 hover:underline"
                  >
                    Lihat titik di Google Maps
                  </a>
                ) : null}
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Button href="/account/setting?redirect=/shop/checkout" variant="ghost" size="sm">
              Ubah alamat
            </Button>
            <Button onClick={() => goTo('shipping')}>Lanjut</Button>
          </div>
        </StepSection>

        <StepSection
          step="shipping"
          index={1}
          active={draft.step === 'shipping'}
          done={stepIndex > 1}
          onEdit={() => goTo('shipping')}
          summary={shippingLabel}
        >
          <div className="grid gap-3">
            {SHIPPING_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                name="shipping"
                value={option.value}
                checked={draft.shippingType === option.value}
                onChange={(value) => setCheckoutField('shippingType', value)}
                title={option.label}
                description={option.description}
                icon={option.value === 'Delivery' ? <Truck className="h-5 w-5" /> : <Store className="h-5 w-5" />}
                aside={option.value === 'Delivery' ? formatRupiah(SHIPPING_FEE) : 'Gratis'}
              />
            ))}
          </div>
          <FormField label="Catatan untuk kurir (opsional)" htmlFor="checkout-remarks" className="mt-5">
            <Textarea
              id="checkout-remarks"
              rows={3}
              placeholder="Contoh: titip di pos satpam, rumah pagar hijau."
              value={draft.remarks}
              onChange={(event) => setCheckoutField('remarks', event.target.value)}
            />
          </FormField>
          <div className="mt-4 flex justify-between gap-2">
            <Button variant="ghost" onClick={() => goTo('address')}>
              Kembali
            </Button>
            <Button
              onClick={() => (draft.shippingType ? goTo('payment') : toast.error('Pilih metode pengiriman terlebih dahulu'))}
            >
              Lanjut
            </Button>
          </div>
        </StepSection>

        <StepSection
          step="payment"
          index={2}
          active={draft.step === 'payment'}
          done={false}
          onEdit={() => goTo('payment')}
          summary={paymentLabel}
        >
          <div className="grid gap-3">
            {PAYMENT_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                name="payment"
                value={option.value}
                checked={draft.paymentMethod === option.value}
                onChange={(value) => setCheckoutField('paymentMethod', value)}
                title={option.label}
                description={option.description}
                icon={option.value === 'cod' ? <Banknote className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
              />
            ))}
          </div>
          <div className="mt-4 flex justify-between gap-2">
            <Button variant="ghost" onClick={() => goTo('shipping')}>
              Kembali
            </Button>
          </div>
        </StepSection>
      </div>

      <Card className="h-fit p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Ringkasan pesanan</h2>
        <ul className="mt-4 flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-3">
              <ProductImage src={item.product_image} alt={item.product_name} className="h-12 w-12 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.product_name}</p>
                <p className="text-xs text-ink-500">
                  {item.quantity} × {formatRupiah(item.sale_price)}
                  {item.weight ? ` · ${formatWeight(item.weight, item.unit)}` : ''}
                </p>
              </div>
              <p className="text-sm font-semibold tabular-nums">{formatRupiah(item.sale_price * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 flex flex-col gap-2 border-t border-cream-200 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Subtotal</dt>
            <dd className="tabular-nums">{formatRupiah(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-ink-500">Ongkos kirim</dt>
            <dd className="tabular-nums">
              {draft.shippingType ? (shippingFee ? formatRupiah(shippingFee) : 'Gratis') : '-'}
            </dd>
          </div>
          <div className="flex justify-between border-t border-cream-200 pt-3">
            <dt className="font-bold">Total</dt>
            <dd className="text-xl font-bold tabular-nums">{formatRupiah(total)}</dd>
          </div>
        </dl>
        <Button
          size="lg"
          block
          className="mt-6"
          onClick={placeOrder}
          loading={submitting}
          disabled={draft.step !== 'payment' || !draft.paymentMethod}
        >
          Buat pesanan
        </Button>
        {draft.step !== 'payment' ? (
          <p className="mt-2 text-center text-xs text-ink-500">Selesaikan semua langkah untuk membuat pesanan.</p>
        ) : null}
      </Card>
    </div>
  )
}

export const CheckoutView = withQuery(CheckoutViewBase)
