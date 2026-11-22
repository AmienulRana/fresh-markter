import { z } from 'zod'

const email = z.string().trim().min(1, 'Email wajib diisi.').pipe(z.email('Format email tidak valid.'))
const password = z.string().min(8, 'Password minimal 8 karakter.')
const requiredText = (label: string) => z.string().trim().min(1, `${label} wajib diisi.`)

function matchPasswords<T extends z.ZodType<{ password?: string; password_confirmation?: string }>>(schema: T) {
  return schema.refine((data) => (data.password ?? '') === (data.password_confirmation ?? ''), {
    message: 'Konfirmasi password tidak sama.',
    path: ['password_confirmation'],
  })
}

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Password wajib diisi.'),
})

export const signUpSchema = matchPasswords(
  z.object({
    name: requiredText('Nama'),
    email,
    password,
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  }),
)

export const forgotPasswordSchema = z.object({ email })

export const resetPasswordSchema = z
  .object({
    password_new: password,
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((data) => data.password_new === data.password_confirmation, {
    message: 'Konfirmasi password tidak sama.',
    path: ['password_confirmation'],
  })

const coordinate = z
  .string()
  .trim()
  .refine((value) => value === '' || Number.isFinite(Number(value)), 'Koordinat harus berupa angka.')

export const profileSchema = z.object({
  name: requiredText('Nama'),
  email,
  phone: requiredText('Nomor telepon'),
  address: requiredText('Alamat'),
  lat: coordinate,
  lng: coordinate,
})

export const customerSchema = matchPasswords(
  z.object({
    name: requiredText('Nama'),
    email,
    phone: requiredText('Nomor telepon'),
    address: requiredText('Alamat'),
    lat: coordinate,
    lng: coordinate,
    password: z.string(),
    password_confirmation: z.string(),
  }),
)

export const categorySchema = z.object({
  name: requiredText('Nama kategori'),
  description: z.string().trim(),
  status: z.enum(['Published', 'Unpublished']),
})

export const productSchema = z.object({
  name: requiredText('Nama produk'),
  category_slug: requiredText('Kategori'),
  unit: z.enum(['gram', 'kilo']),
  description: requiredText('Deskripsi'),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']),
})

export const variantSchema = z
  .object({
    stock: z.number({ error: 'Stok wajib diisi.' }).int('Stok harus bilangan bulat.').min(0, 'Stok tidak boleh negatif.'),
    weight: z.number({ error: 'Berat wajib diisi.' }).positive('Berat harus lebih dari 0.'),
    reguler_price: z.number({ error: 'Harga wajib diisi.' }).positive('Harga harus lebih dari 0.'),
    sale_price: z.number({ error: 'Harga jual wajib diisi.' }).min(0, 'Harga jual tidak boleh negatif.'),
  })
  .refine((data) => data.sale_price <= data.reguler_price, {
    message: 'Harga jual tidak boleh melebihi harga reguler.',
    path: ['sale_price'],
  })

export const roleSchema = z.object({ name: requiredText('Nama role') })

export const orderStatusSchema = z.object({
  status: requiredText('Status'),
  remarks: z.string().trim(),
})

export const trackOrderSchema = z.object({ code: requiredText('Kode pesanan') })

export type SignInValues = z.infer<typeof signInSchema>
export type SignUpValues = z.infer<typeof signUpSchema>
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
export type ProfileValues = z.infer<typeof profileSchema>
export type CustomerValues = z.infer<typeof customerSchema>
export type CategoryValues = z.infer<typeof categorySchema>
export type ProductValues = z.infer<typeof productSchema>
export type VariantValues = z.infer<typeof variantSchema>
export type RoleValues = z.infer<typeof roleSchema>
export type OrderStatusValues = z.infer<typeof orderStatusSchema>
export type TrackOrderValues = z.infer<typeof trackOrderSchema>
