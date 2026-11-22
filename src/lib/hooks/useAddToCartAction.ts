import { useStore } from '@nanostores/react'
import { useAddToCart } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { $isAuthenticated } from '@/stores/session'
import { openAuthModal, openCartDrawer } from '@/stores/ui'
import { toast } from '@/stores/feedback'

export function useAddToCartAction() {
  const authenticated = useStore($isAuthenticated)
  const mutation = useAddToCart()

  async function addToCart(productId: number, quantity = 1, options: { openDrawer?: boolean } = {}) {
    if (!authenticated) {
      openAuthModal({ pendingAction: { type: 'add-to-cart', productId, quantity } })
      return false
    }
    try {
      await mutation.mutateAsync({ productId, quantity })
      toast.success('Ditambahkan ke keranjang')
      if (options.openDrawer) openCartDrawer()
      return true
    } catch (error) {
      toast.error('Gagal menambahkan ke keranjang', getErrorMessage(error))
      return false
    }
  }

  return { addToCart, isPending: mutation.isPending, pendingId: mutation.variables?.productId }
}
