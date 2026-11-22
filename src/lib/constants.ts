export const ADMIN_ROLE = 'Super Admin'
export const CUSTOMER_ROLE_ID = 2

export const SHIPPING_FEE = 5000
export const MAX_ITEM_QUANTITY = 10
export const MAX_UPLOAD_SIZE = 1024 * 1024
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

export const PRICE_RANGE = { min: 0, max: 2_000_000, step: 5_000, defaultMax: 100_000 }

export const PAGE_SIZES = [10, 20, 30]

export const SHOP_SORT_OPTIONS = [
  { value: '', label: 'Unggulan' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'price_asc', label: 'Harga: Rendah ke Tinggi' },
  { value: 'price_desc', label: 'Harga: Tinggi ke Rendah' },
]

export const PRODUCT_UNITS = [
  { value: 'gram', label: 'Gram (gr)' },
  { value: 'kilo', label: 'Kilogram (kg)' },
]

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'INACTIVE', label: 'Nonaktif' },
  { value: 'DRAFT', label: 'Draft' },
]

export const PRODUCT_FILTER_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'Active', label: 'Aktif' },
  { value: 'Deactive', label: 'Nonaktif' },
  { value: 'Draft', label: 'Draft' },
]

export const CATEGORY_STATUS_OPTIONS = [
  { value: 'Published', label: 'Tayang' },
  { value: 'Unpublished', label: 'Tidak tayang' },
]

export const ORDER_FILTER_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'PENDING', label: 'Menunggu' },
  { value: 'CONFIRMED', label: 'Dikonfirmasi' },
  { value: 'SENDING', label: 'Dikirim' },
  { value: 'DONE', label: 'Selesai' },
  { value: 'CANCEL', label: 'Dibatalkan' },
]

export const ORDER_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Menunggu' },
  { value: 'Confirmed', label: 'Dikonfirmasi' },
  { value: 'Process', label: 'Diproses' },
  { value: 'Sending', label: 'Dikirim' },
  { value: 'Done', label: 'Selesai' },
  { value: 'Cancel', label: 'Dibatalkan' },
]

export const PAYMENT_FILTER_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: 'Pending', label: 'Menunggu' },
  { value: 'Success', label: 'Berhasil' },
  { value: 'Failed', label: 'Gagal' },
]

export const NOTIFICATION_FILTER_OPTIONS = [
  { value: '', label: 'Semua notifikasi' },
  { value: 'read', label: 'Sudah dibaca' },
]

export const SHIPPING_OPTIONS = [
  { value: 'Delivery', label: 'Antar ke alamat', description: 'Kurir kami mengantar pesanan ke alamatmu.' },
  { value: 'Pickup', label: 'Ambil sendiri', description: 'Ambil pesanan langsung di toko, tanpa ongkir.' },
]

export const PAYMENT_OPTIONS = [
  { value: 'cod', label: 'Bayar di tempat (COD)', description: 'Bayar tunai saat pesanan diterima.' },
  {
    value: 'midtrans',
    label: 'Bayar online (Midtrans)',
    description: 'Transfer bank, e-wallet, atau kartu melalui Midtrans.',
  },
]
