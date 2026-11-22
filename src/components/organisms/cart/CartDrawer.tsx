import { useStore } from '@nanostores/react'
import { ShoppingBasket } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Skeleton } from '@/components/atoms/Skeleton'
import { Drawer } from '@/components/molecules/Modal'
import { EmptyState } from '@/components/molecules/EmptyState'
import { useCart } from '@/lib/queries/commerce'
import { cartSubtotal, useCartActions } from '@/lib/hooks/useCartActions'
import { formatRupiah } from '@/lib/utils'
import { $cartDrawerOpen, closeCartDrawer } from '@/stores/ui'
import { CartLine } from './CartLine'

export function CartDrawer() {
  const open = useStore($cartDrawerOpen)
  const { data: items, isPending } = useCart()
  const { changeQuantity, removeItem, busyId } = useCartActions()
  const subtotal = cartSubtotal(items)
  const hasItems = Boolean(items?.length)

  return (
    <Drawer
      open={open}
      onClose={closeCartDrawer}
      title={`Keranjang${items?.length ? ` (${items.length})` : ''}`}
      footer={
        hasItems ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-500">Subtotal</span>
              <span className="text-lg font-bold tabular-nums">{formatRupiah(subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button href="/shop/cart" variant="outline">
                Lihat keranjang
              </Button>
              <Button href="/shop/checkout">Checkout</Button>
            </div>
          </div>
        ) : undefined
      }
    >
      {isPending ? (
        <div className="flex flex-col gap-4 p-5">
          {[0, 1, 2].map((key) => (
            <div key={key} className="flex gap-4">
              <Skeleton className="h-16 w-16" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : hasItems ? (
        <ul className="divide-y divide-cream-200 px-5">
          {items?.map((item) => (
            <CartLine
              key={item.id}
              item={item}
              compact
              busy={busyId === item.id}
              onQuantityChange={(quantity) => changeQuantity(item, quantity)}
              onRemove={() => removeItem(item)}
            />
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={<ShoppingBasket />}
          title="Keranjangmu masih kosong"
          description="Yuk, isi dengan sayur dan buah segar pilihanmu."
          action={
            <Button href="/shop" onClick={closeCartDrawer}>
              Mulai belanja
            </Button>
          }
        />
      )}
    </Drawer>
  )
}
