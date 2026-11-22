import { useStore } from '@nanostores/react'
import type { SessionUser } from '@/types/user'
import { Modal } from '@/components/molecules/Modal'
import { useAddToCart } from '@/lib/queries/commerce'
import { getErrorMessage } from '@/lib/api/errors'
import { redirectTo, safeRedirectPath } from '@/lib/utils'
import { $authModal, closeAuthModal, openCartDrawer } from '@/stores/ui'
import { toast } from '@/stores/feedback'
import { SignInForm } from './SignInForm'

export function AuthModal() {
  const state = useStore($authModal)
  const addToCart = useAddToCart()

  async function handleSuccess(user: SessionUser) {
    const { pendingAction, redirectTo: target } = $authModal.get()
    closeAuthModal()
    toast.success(`Selamat datang, ${user.name || 'pelanggan'}!`)
    if (pendingAction?.type === 'add-to-cart') {
      try {
        await addToCart.mutateAsync({ productId: pendingAction.productId, quantity: pendingAction.quantity })
        toast.success('Ditambahkan ke keranjang')
        openCartDrawer()
      } catch (error) {
        toast.error('Gagal menambahkan ke keranjang', getErrorMessage(error))
      }
    }
    if (target) redirectTo(safeRedirectPath(target))
  }

  return (
    <Modal
      open={state.open}
      onClose={closeAuthModal}
      size="sm"
      title="Masuk ke Fresh Market"
      description={state.pendingAction ? 'Masuk dulu untuk menambahkan produk ke keranjang.' : undefined}
    >
      <SignInForm onSuccess={handleSuccess} />
      <p className="mt-5 text-center text-sm text-ink-500">
        Belum punya akun?{' '}
        <a href="/auth/signup" className="font-semibold text-leaf-700 hover:underline">
          Daftar gratis
        </a>
      </p>
    </Modal>
  )
}
