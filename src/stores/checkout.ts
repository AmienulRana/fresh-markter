import { persistentMap } from '@nanostores/persistent'

export type CheckoutStep = 'address' | 'shipping' | 'payment'

export const CHECKOUT_STEPS: CheckoutStep[] = ['address', 'shipping', 'payment']

export const $checkoutDraft = persistentMap<{
  step: CheckoutStep
  shippingType: string
  paymentMethod: string
  remarks: string
}>('fm-checkout:', {
  step: 'address',
  shippingType: '',
  paymentMethod: '',
  remarks: '',
})

export function setCheckoutField<K extends 'step' | 'shippingType' | 'paymentMethod' | 'remarks'>(
  key: K,
  value: K extends 'step' ? CheckoutStep : string,
) {
  $checkoutDraft.setKey(key, value as never)
}

export function resetCheckoutDraft() {
  $checkoutDraft.set({ step: 'address', shippingType: '', paymentMethod: '', remarks: '' })
}
