import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/atoms/Button'
import { Card } from '@/components/atoms/Card'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Select } from '@/components/atoms/Select'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Textarea } from '@/components/atoms/Textarea'
import { FormField } from '@/components/molecules/FormField'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { withQuery } from '@/lib/queries/client'
import { useAdminOrder, useUpdateOrderStatus } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { ORDER_STATUS_OPTIONS } from '@/lib/constants'
import { formatDate, formatRupiah, formatWeight, paymentLabel, redirectTo } from '@/lib/utils'
import { orderStatusSchema, type OrderStatusValues } from '@/lib/validation'
import { toast } from '@/stores/feedback'

function matchStatus(value?: string) {
  const found = ORDER_STATUS_OPTIONS.find((option) => option.value.toLowerCase() === (value ?? '').toLowerCase())
  return found?.value ?? ''
}

function OrderDetailPanelBase({ orderId }: { orderId: string }) {
  const { data: order, isPending, isError, error } = useAdminOrder(orderId)
  const update = useUpdateOrderStatus(orderId)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrderStatusValues>({ resolver: zodResolver(orderStatusSchema), defaultValues: { status: '', remarks: '' } })

  useEffect(() => {
    if (order) reset({ status: matchStatus(order.order_status), remarks: '' })
  }, [order])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await update.mutateAsync(values)
      toast.success('Status pesanan diperbarui')
      redirectTo('/dashboard/orders')
    } catch (updateError) {
      toast.error('Gagal memperbarui status', getErrorMessage(updateError))
    }
  })

  if (isPending) {
    return (
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Skeleton className="h-96 w-full rounded-card" />
        <Skeleton className="h-72 w-full rounded-card" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <Card className="p-6 text-sm text-danger-600" role="alert">
        {getErrorMessage(error, 'Pesanan tidak ditemukan.')}
      </Card>
    )
  }

  const items = order.order_detail ?? []
  const subtotal = items.reduce((total, item) => total + Number(item.product_price) * Number(item.quantity), 0)
  const shipping = Number(order.shipping_fee ?? 0)

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-ink-500">Kode pesanan</p>
              <p className="text-xl font-bold">{order.order_code}</p>
              <p className="mt-1 text-sm text-ink-500">{formatDate(order.order_datetime, true)}</p>
            </div>
            <StatusBadge status={order.order_status} />
          </div>
          <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-ink-500">Pembayaran</dt>
              <dd className="font-semibold">{paymentLabel(order.payment_method)}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Pengiriman</dt>
              <dd className="font-semibold">{order.shipping_type ?? '-'}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Total</dt>
              <dd className="font-semibold tabular-nums">{formatRupiah(order.total_amount)}</dd>
            </div>
          </dl>
          {order.remarks ? (
            <p className="mt-4 rounded-xl bg-cream-50 px-4 py-3 text-sm text-ink-700">
              <span className="font-semibold">Catatan: </span>
              {order.remarks}
            </p>
          ) : null}
        </Card>

        <Card className="overflow-hidden">
          <h2 className="border-b border-cream-200 px-6 py-4 text-base font-bold">Produk dipesan</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-cream-50 text-xs tracking-wide text-ink-500 uppercase">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Produk</th>
                  <th className="px-4 py-3 text-right font-semibold">Harga</th>
                  <th className="px-4 py-3 text-right font-semibold">Jumlah</th>
                  <th className="px-6 py-3 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {items.map((item, index) => (
                  <tr key={`${item.product_name}-${index}`}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={item.product_image} alt="" className="h-11 w-11 rounded-xl" />
                        <div>
                          <p className="font-semibold">{item.product_name}</p>
                          {item.weight ? <p className="text-xs text-ink-500">{formatWeight(item.weight, item.unit)}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatRupiah(item.product_price)}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums">
                      {formatRupiah(item.product_price * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <dl className="ml-auto flex max-w-xs flex-col gap-2 px-6 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subtotal</dt>
              <dd className="tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Ongkos kirim</dt>
              <dd className="tabular-nums">{formatRupiah(shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-cream-200 pt-2">
              <dt className="font-bold">Total</dt>
              <dd className="font-bold tabular-nums">{formatRupiah(subtotal + shipping)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="p-6">
          <h2 className="text-base font-bold">Pelanggan</h2>
          <ul className="mt-4 flex flex-col gap-3 text-sm">
            <li className="flex items-start gap-3">
              <UserRound className="mt-0.5 h-4 w-4 text-ink-500" />
              {order.customer?.customer_name ?? '-'}
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 h-4 w-4 text-ink-500" />
              <span className="break-all">{order.customer?.customer_email ?? '-'}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 h-4 w-4 text-ink-500" />
              {order.customer?.customer_phone ?? '-'}
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 text-ink-500" />
              {order.customer?.customer_address ?? '-'}
            </li>
          </ul>
        </Card>
        <Card className="p-6">
          <h2 className="text-base font-bold">Perbarui status</h2>
          <form method="post" onSubmit={onSubmit} noValidate className="mt-4 flex flex-col gap-4">
            <FormField label="Status" htmlFor="order-status" error={errors.status?.message} required>
              <Select
                id="order-status"
                placeholder="Pilih status"
                options={ORDER_STATUS_OPTIONS}
                invalid={Boolean(errors.status)}
                {...register('status')}
              />
            </FormField>
            <FormField label="Catatan" htmlFor="order-remarks" error={errors.remarks?.message}>
              <Textarea id="order-remarks" rows={3} placeholder="Opsional" {...register('remarks')} />
            </FormField>
            <Button type="submit" loading={update.isPending}>
              Simpan status
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}

export const OrderDetailPanel = withQuery(OrderDetailPanelBase)
