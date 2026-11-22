import { ArrowLeft, ShoppingBasket, Trash } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { Skeleton } from '@/components/atoms/Skeleton'
import { EmptyState } from '@/components/molecules/EmptyState'
import { withQuery } from '@/lib/queries/client'
import { useCart, useClearCart } from '@/lib/queries/commerce'
import { cartSubtotal, useCartActions } from '@/lib/hooks/useCartActions'
import { getErrorMessage } from '@/lib/api/errors'
import { formatRupiah } from '@/lib/utils'
import { confirmAction, toast } from '@/stores/feedback'
import { CartLine } from './CartLine'

function CartViewBase() {
  const { data: items, isPending, isError, error } = useCart()
  const { changeQuantity, removeItem, busyId } = useCartActions()
  const clearCart = useClearCart()
  const subtotal = cartSubtotal(items)

  async function handleClear() {
    const ok = await confirmAction({
      title: 'Kosongkan keranjang?',
      description: 'Semua produk di keranjang akan dihapus.',
      confirmLabel: 'Kosongkan',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await clearCart.mutateAsync()
      toast.success('Keranjang dikosongkan')
    } catch (clearError) {
      toast.error('Gagal mengosongkan keranjang', getErrorMessage(clearError))
    }
  }

  if (isPending) {
    return (
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <Card className="flex flex-col gap-4 p-6">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex gap-4">
              <Skeleton className="h-20 w-20" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </Card>
        <Skeleton className="h-56 w-full rounded-card" />
      </div>
    )
  }

  if (isError) {
    return (
      <EmptyState
        icon={<ShoppingBasket />}
        title="Gagal memuat keranjang"
        description={getErrorMessage(error)}
        className="rounded-card border border-dashed border-cream-200 bg-white"
      />
    )
  }

  if (!items?.length) {
    return (
      <EmptyState
        icon={<ShoppingBasket />}
        title="Keranjangmu masih kosong"
        description="Yuk, isi dengan sayur dan buah segar pilihanmu."
        action={<Button href="/shop">Mulai belanja</Button>}
        className="rounded-card border border-dashed border-cream-200 bg-white"
      />
    )
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <Card className="px-6 py-2">
        <ul className="divide-y divide-cream-200">
          {items.map((item) => (
            <CartLine
              key={item.id}
              item={item}
              busy={busyId === item.id}
              onQuantityChange={(quantity) => changeQuantity(item, quantity)}
              onRemove={() => removeItem(item)}
            />
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cream-200 py-4">
          <Button href="/shop" variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" /> Lanjut belanja
          </Button>
          <Button variant="danger-soft" size="sm" onClick={handleClear} loading={clearCart.isPending}>
            <Trash className="h-4 w-4" /> Kosongkan keranjang
          </Button>
        </div>
      </Card>
      <Card className="h-fit p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Ringkasan belanja</h2>
        <dl className="mt-4 flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-500">Total produk</dt>
            <dd className="font-semibold">{items.reduce((total, item) => total + item.quantity, 0)} item</dd>
          </div>
          <div className="flex justify-between border-t border-cream-200 pt-3">
            <dt className="font-semibold">Subtotal</dt>
            <dd className="text-lg font-bold tabular-nums">{formatRupiah(subtotal)}</dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-ink-500">Ongkos kirim dihitung saat checkout.</p>
        <Button href="/shop/checkout" size="lg" block className="mt-6">
          Lanjut ke checkout
        </Button>
      </Card>
    </div>
  )
}

export const CartView = withQuery(CartViewBase)
