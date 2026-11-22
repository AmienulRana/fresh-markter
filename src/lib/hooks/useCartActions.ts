import type { CartItem } from '@/types/order'
import { useRemoveFromCart, useSetCartQuantity } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { confirmAction, toast } from '@/stores/feedback'

export function useCartActions() {
  const setQuantity = useSetCartQuantity()
  const remove = useRemoveFromCart()

  async function changeQuantity(item: CartItem, quantity: number) {
    if (quantity === item.quantity) return
    try {
      await setQuantity.mutateAsync({ item, quantity })
    } catch (error) {
      toast.error('Gagal mengubah jumlah', getErrorMessage(error))
    }
  }

  async function removeItem(item: CartItem) {
    const ok = await confirmAction({
      title: 'Hapus dari keranjang?',
      description: `${item.product_name} akan dihapus dari keranjangmu.`,
      confirmLabel: 'Hapus',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await remove.mutateAsync(item.id)
      toast.success('Produk dihapus dari keranjang')
    } catch (error) {
      toast.error('Gagal menghapus produk', getErrorMessage(error))
    }
  }

  const busyId = setQuantity.isPending
    ? setQuantity.variables?.item.id
    : remove.isPending
      ? remove.variables
      : undefined

  return { changeQuantity, removeItem, busyId }
}

export function cartSubtotal(items: CartItem[] | undefined) {
  return (items ?? []).reduce((total, item) => total + Number(item.sale_price) * Number(item.quantity), 0)
}
