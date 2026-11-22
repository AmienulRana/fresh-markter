import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const rupiah = new Intl.NumberFormat('id-ID')

export function formatRupiah(value: number | string | null | undefined) {
  const amount = Number(value ?? 0)
  return `Rp ${rupiah.format(Number.isFinite(amount) ? amount : 0)}`
}

const MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return '-'
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(value)
  let date: Date
  if (match) {
    const [, y, m, d, hh = '0', mm = '0'] = match
    date = new Date(Number(y), Number(m) - 1, Number(d), Number(hh), Number(mm))
  } else {
    date = new Date(value)
  }
  if (Number.isNaN(date.getTime())) return value
  const day = String(date.getDate()).padStart(2, '0')
  const base = `${day} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
  if (!withTime || !match?.[4]) return base
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  return `${base}, ${time}`
}

export function formatWeight(weight: number | string | null | undefined, unit: string | null | undefined) {
  if (weight === null || weight === undefined || weight === '') return ''
  const short = unit === 'kilo' ? 'kg' : unit === 'gram' ? 'gr' : (unit ?? '')
  return `${weight} ${short}`.trim()
}

export function paymentLabel(method?: string | null) {
  if (!method) return '-'
  const value = method.toLowerCase()
  if (value === 'midtrans') return 'Transfer (Midtrans)'
  if (value === 'cod') return 'COD'
  return method
}

export function buildMapsLink(lat: string | number | null | undefined, lng: string | number | null | undefined) {
  if (lat === null || lat === undefined || lng === null || lng === undefined || lat === '' || lng === '') return ''
  if (String(lat) === 'null' || String(lng) === 'null') return ''
  return `https://www.google.com/maps?q=${lat},${lng}`
}

export function discountPercent(regular: number, sale: number) {
  if (!regular || !sale || sale >= regular) return 0
  return Math.round(((regular - sale) / regular) * 100)
}

export function effectivePrice(item: { sale_price?: number; reguler_price?: number }) {
  return Number(item.sale_price || item.reguler_price || 0)
}

export function initials(name: string | null | undefined) {
  if (!name) return '?'
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function redirectTo(path: string) {
  window.location.assign(path)
}

export function safeRedirectPath(value: string | null | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}

export function validateImageFile(file: File, maxSize: number, types: string[]) {
  if (!types.includes(file.type)) return 'Format file harus JPG, PNG, atau GIF.'
  if (file.size > maxSize) return `Ukuran file maksimal ${Math.round(maxSize / 1024 / 1024)}MB.`
  return null
}

const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g')
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g')

export function serializeJson(value: unknown) {
  return JSON.stringify(value ?? null)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029')
}
