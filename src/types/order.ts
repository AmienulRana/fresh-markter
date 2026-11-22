import type { ListParams } from './api'

export interface CartItem {
  id: number
  product_name: string
  product_image?: string
  sale_price: number
  reguler_price?: number
  quantity: number
  weight?: number
  unit?: string
}

export interface OrderListItem {
  id: number
  order_code: string
  order_datetime?: string
  status: string
  total_amount: number
  payment_method?: string
  customer_name?: string
  product_image?: string
  quantity?: number
  weight?: number
  unit?: string
}

export interface OrderDetailItem {
  product_name: string
  product_image?: string
  product_price: number
  quantity: number
  weight?: number
  unit?: string
}

export interface OrderDetail {
  id: number
  order_code: string
  order_datetime?: string
  order_status: string
  total_amount: number
  shipping_fee: number
  shipping_type?: string
  payment_method?: string
  remarks?: string
  customer?: {
    customer_id?: number
    customer_name?: string
    customer_email?: string
    customer_phone?: string
    customer_address?: string
  }
  order_detail?: OrderDetailItem[]
}

export interface OrderParams extends ListParams {
  status?: string
}

export interface CreateOrderPayload {
  buyer_id: number
  order_date: string
  order_time: string
  total_amount: number
  shipping_type: string
  payment_type: string
  remarks: string
  order_details: { product_id: number; quantity: number }[]
}

export interface CreatePaymentPayload {
  order_id: number
  remarks: string
  payment_method: string
  gross_amount: number
  user_id: number
}

export interface PaymentResult {
  payment_token?: string
}

export interface PublicOrderLookup {
  orderID: number
}

export interface PaymentListItem {
  id: number
  order_code: string
  payment_status: string
  payment_method: string
  gross_amount: number
  shipping_type?: string
}

export interface PaymentDetail extends PaymentListItem {
  payment_at?: string
  order_at?: string
  order_remarks?: string
  customer_name?: string
  customer_address?: string
}

export interface PaymentParams extends ListParams {
  status?: string
}
