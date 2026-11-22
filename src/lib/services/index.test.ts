import { describe, expect, it } from 'vitest'
import type { Requester, RequestOptions } from '@/lib/api/request'
import { toQueryString } from '@/lib/api/request'
import { createApi } from './index'

interface Call {
  method: string
  url: string
  body?: unknown
  formData?: FormData
}

function recorder() {
  const calls: Call[] = []
  const request = (async (path: string, options: RequestOptions = {}) => {
    calls.push({
      method: options.method ?? 'GET',
      url: `${path}${toQueryString(options.query)}`,
      body: options.body,
      formData: options.formData,
    })
    return { data: null, pagination: undefined }
  }) as Requester
  return { api: createApi(request), calls }
}

async function single(run: (api: ReturnType<typeof createApi>) => Promise<unknown>) {
  const { api, calls } = recorder()
  await run(api)
  expect(calls).toHaveLength(1)
  return calls[0]
}

const file = new File(['x'], 'a.png', { type: 'image/png' })

const cases: [string, string, string, (api: ReturnType<typeof createApi>) => Promise<unknown>][] = [
  ['Gateway Health', 'GET', '/health', (a) => a.system.health()],
  ['API Check', 'GET', '/api/check', (a) => a.system.userServiceCheck()],
  ['Admin Check', 'GET', '/admin/check', (a) => a.system.adminCheck()],
  ['Sign Up', 'POST', '/signup', (a) =>
    a.auth.signUp({ name: 'n', email: 'e', password: 'p', password_confirmation: 'p' })],
  ['Forgot Password', 'POST', '/forgot-password', (a) => a.auth.forgotPassword('e')],
  ['Verify Account', 'GET', '/verify-account?token=t', (a) => a.auth.verifyAccount('t')],
  ['Update Password', 'PUT', '/update-password?token=t', (a) =>
    a.auth.resetPassword({ token: 't', password_new: 'p', password_confirmation: 'p' })],
  ['Get Profile', 'GET', '/auth/profile', (a) => a.auth.profile()],
  ['Update Profile', 'PUT', '/auth/profile', (a) =>
    a.auth.updateProfile({ name: '', email: '', phone: '', address: '', lat: '', lng: '', photo: '' })],
  ['Upload Profile Image', 'POST', '/auth/profile/image-upload', (a) => a.uploads.profilePhoto(file)],
  ['Get All Customers', 'GET', '/admin/customers?search=jo&order_by=name&order_type=asc&page=2&limit=20', (a) =>
    a.customers.list({ search: 'jo', orderBy: 'name', orderType: 'asc', page: 2, limit: 20 })],
  ['Get Customer By ID', 'GET', '/admin/customers/1', (a) => a.customers.detail(1)],
  ['Delete Customer', 'DELETE', '/admin/customers/1', (a) => a.customers.remove(1)],
  ['Get All Roles', 'GET', '/admin/roles?search=staff', (a) => a.roles.list('staff')],
  ['Get Role By ID', 'GET', '/admin/roles/1', (a) => a.roles.detail(1)],
  ['Create Role', 'POST', '/admin/roles', (a) => a.roles.create('Staff')],
  ['Update Role', 'PUT', '/admin/roles/1', (a) => a.roles.update(1, 'Staff')],
  ['Delete Role', 'DELETE', '/admin/roles/1', (a) => a.roles.remove(1)],
  ['Products Home', 'GET', '/products/home', (a) => a.products.home()],
  ['Products Shop', 'GET', '/products/shop?search=b&category=sayur&price=0+-+5000&orderBy=newest&page=1&limit=10', (a) =>
    a.products.shop({ search: 'b', category: 'sayur', price: '0 - 5000', orderBy: 'newest', page: 1, limit: 10 })],
  ['Product Detail', 'GET', '/products/home/1', (a) => a.products.detail(1)],
  ['Categories Home', 'GET', '/categories/home', (a) => a.categories.home()],
  ['Categories Shop', 'GET', '/categories/shop', (a) => a.categories.shop()],
  ['Add To Cart', 'POST', '/auth/cart', (a) => a.cart.add(1, 2)],
  ['Get Cart', 'GET', '/auth/cart', (a) => a.cart.list()],
  ['Remove From Cart', 'DELETE', '/auth/cart?product_id=1', (a) => a.cart.remove(1)],
  ['Remove All Cart', 'DELETE', '/auth/cart/all', (a) => a.cart.clear()],
  ['Admin Products', 'GET',
    '/admin/products?search=b&categorySlug=sayur&startPrice=100&endPrice=900&status=Active&orderBy=name&orderType=desc&page=1&limit=10',
    (a) => a.products.adminList({
      search: 'b', category: 'sayur', startPrice: 100, endPrice: 900, status: 'Active',
      orderBy: 'name', orderType: 'desc', page: 1, limit: 10,
    })],
  ['Admin Product By ID', 'GET', '/admin/products/1', (a) => a.products.adminDetail(1)],
  ['Delete Product', 'DELETE', '/admin/products/1', (a) => a.products.remove(1)],
  ['Upload Product Image', 'POST', '/admin/image-upload', (a) => a.uploads.productImage(file)],
  ['Admin Categories', 'GET', '/admin/categories?search=s&orderBy=name&orderType=asc&page=1&perPage=100', (a) =>
    a.categories.adminList({ search: 's', orderBy: 'name', orderType: 'asc', page: 1, limit: 100 })],
  ['Category By ID', 'GET', '/admin/categories/1', (a) => a.categories.adminDetail(1)],
  ['Category By Slug', 'GET', '/admin/categories/sayuran/slug', (a) => a.categories.adminDetailBySlug('sayuran')],
  ['Delete Category', 'DELETE', '/admin/categories/1', (a) => a.categories.remove(1)],
  ['Public Order By Code', 'GET', '/public/orders/ORD-1/code', (a) => a.orders.publicByCode('ORD-1')],
  ['My Orders', 'GET', '/auth/orders?search=ORD&status=PENDING&page=2&perPage=10', (a) =>
    a.orders.mine({ search: 'ORD', status: 'PENDING', page: 2, limit: 10 })],
  ['My Order By ID', 'GET', '/auth/orders/1', (a) => a.orders.mineDetail(1)],
  ['My Order By Code', 'GET', '/auth/orders/ORD-1/code', (a) => a.orders.mineByCode('ORD-1')],
  ['Admin Orders', 'GET', '/admin/orders?search=ORD&status=PENDING&page=1&perPage=5', (a) =>
    a.orders.adminList({ search: 'ORD', status: 'PENDING', page: 1, limit: 5 })],
  ['Admin Order By ID', 'GET', '/admin/orders/1', (a) => a.orders.adminDetail(1)],
  ['Update Order Status', 'PUT', '/admin/orders/1/status', (a) =>
    a.orders.updateStatus(1, { status: 'Confirmed', remarks: '' })],
  ['My Payments', 'GET', '/auth/payments?search=ORD&orderBy=id&orderType=asc&page=1&perPage=10&status=Success', (a) =>
    a.payments.mine({ search: 'ORD', orderBy: 'id', orderType: 'asc', page: 1, limit: 10, status: 'Success' })],
  ['My Payment Detail', 'GET', '/auth/payments/1', (a) => a.payments.mineDetail(1)],
  ['Admin Payments', 'GET', '/admin/payments?search=cod&orderBy=id&orderType=desc&page=1&perPage=10&status=Pending', (a) =>
    a.payments.adminList({ search: 'cod', orderBy: 'id', orderType: 'desc', page: 1, limit: 10, status: 'Pending' })],
  ['Admin Payment Detail', 'GET', '/admin/payments/1', (a) => a.payments.adminDetail(1)],
  ['My Notifications', 'GET',
    '/auth/notifications?search=promo&orderBy=sent_at&orderType=desc&page=1&perPage=50&status=SENT&isRead=true',
    (a) => a.notifications.list({
      search: 'promo', orderBy: 'sent_at', orderType: 'desc', page: 1, limit: 50, status: 'SENT', isRead: true,
    })],
  ['Notification By ID', 'GET', '/auth/notifications/1', (a) => a.notifications.detail(1)],
  ['Mark Notification As Read', 'PUT', '/auth/notifications/1', (a) => a.notifications.markAsRead(1)],
]

describe('api service mengikuti koleksi Postman micro-sayur', () => {
  it.each(cases)('%s', async (_name, method, url, run) => {
    const call = await single(run)
    expect(call).toMatchObject({ method, url })
  })

  it('mengirim body sesuai kontrak untuk create order dan payment', async () => {
    const order = await single((a) =>
      a.orders.create(
        {
          buyer_id: 1,
          order_date: '2026-11-20',
          order_time: '10:00',
          total_amount: 15000,
          shipping_type: 'Delivery',
          payment_type: 'cod',
          remarks: '',
          order_details: [{ product_id: 1, quantity: 3 }],
        },
        '-6.2',
        '106.8',
      ),
    )
    expect(order).toMatchObject({ method: 'POST', url: '/auth/orders?lat=-6.2&lng=106.8' })

    const payment = await single((a) =>
      a.payments.create({ order_id: 1, payment_method: 'midtrans', gross_amount: 15000, user_id: 1, remarks: '' }),
    )
    expect(payment).toMatchObject({ method: 'POST', url: '/auth/payments' })
    expect(payment.body).toEqual({ order_id: 1, payment_method: 'midtrans', gross_amount: 15000, user_id: 1, remarks: '' })
  })

  it('mengirim file upload dengan nama field yang benar', async () => {
    const product = await single((a) => a.uploads.productImage(file))
    expect(product.formData?.get('image')).toBeInstanceOf(File)
    const profile = await single((a) => a.uploads.profilePhoto(file))
    expect(profile.formData?.get('photo')).toBeInstanceOf(File)
  })

  it('meng-encode segmen path dinamis', async () => {
    const call = await single((a) => a.orders.mineByCode('ORD 1/../x'))
    expect(call.url).toBe('/auth/orders/ORD%201%2F..%2Fx/code')
  })
})
