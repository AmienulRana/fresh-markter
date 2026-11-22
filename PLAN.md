# Plan Rewrite: micro-sayur-nuxt → Fresh Market (Astro)

Dokumen ini adalah rencana kerja untuk menulis ulang aplikasi e-commerce sayur `micro-sayur-nuxt-main` (Nuxt 3 + Pinia + template FreshCart/Bootstrap) menjadi **Fresh Market** di folder `fresh-market/`, dengan stack:

| Kebutuhan | Pilihan |
|---|---|
| Framework | Astro (SSR, adapter Node) |
| UI island | React + TypeScript (lihat [Keputusan](#11-keputusan-yang-perlu-dikonfirmasi)) |
| Data fetching | TanStack Query v5 (`@tanstack/react-query`) |
| State global | Nano Stores (`nanostores`, `@nanostores/react`, `@nanostores/persistent`) |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Struktur komponen | Atomic Design (atoms → molecules → organisms → templates → pages) |
| Branding | UI, logo, warna, tipografi baru — tidak ada sisa FreshCart |

---

## 1. Hasil Scan Repo Lama

### 1.1 Ringkasan

- **Nuxt 3** dengan modul yang sebagian besar tidak terpakai (`@nuxt/content`, `@nuxt/ui`, `@nuxt/image`, quill, dropzone, tiny-slider, bootstrap).
- **Styling campuran**: `assets/css/theme.min.css` (template FreshCart berbasis Bootstrap) + kelas Tailwind + script vendor jQuery-style dari `/js/vendors/*`.
- **8 Pinia store** yang berisi langsung pemanggilan `fetch` ke 5 microservice. Tidak ada lapisan API, tidak ada cache, setiap halaman fetch ulang di `onMounted`.
- **27 halaman**, **21 komponen**, **3 layout**, **2 middleware**. Total ±11.000 baris (6.600 baris di pages).
- Auth berbasis cookie `token` + cookie `user` (berisi role) yang bisa dibaca/diubah dari client.
- Pembayaran via **Midtrans Snap** (sandbox) + opsi **COD**.
- Geolokasi browser dipakai untuk `lat/lng` alamat pengiriman.

### 1.2 Microservice & Environment

| Env lama | Env baru (Astro) | Service |
|---|---|---|
| `NUXT_USER_API_BASE_URL` | `USER_API_BASE_URL` | auth, profil, customer, role |
| `NUXT_PRODUCT_API_BASE_URL` | `PRODUCT_API_BASE_URL` | produk, kategori, cart, upload gambar |
| `NUXT_ORDER_API_BASE_URL` | `ORDER_API_BASE_URL` | order |
| `NUXT_PAYMENT_API_BASE_URL` | `PAYMENT_API_BASE_URL` | payment |
| `NUXT_NOTIFICATION_API_BASE_URL` | `NOTIFICATION_API_BASE_URL` | notifikasi (belum dipakai di repo lama) |
| `MIDTRANS_CLIENT_KEY` (tidak ada di `.env`) | `PUBLIC_MIDTRANS_CLIENT_KEY`, `PUBLIC_MIDTRANS_SNAP_URL` | Midtrans Snap |

URL service **tidak** diberi prefix `PUBLIC_` karena hanya dipakai di server (lihat BFF proxy di §5.2).

### 1.3 Inventaris Endpoint

Envelope response yang dipakai: `{ data, message, pagination?: { page, total_count, per_page, total_pages } }`.

**User service**

| Method | Path | Auth | Dipakai di |
|---|---|---|---|
| POST | `/signin` | – | signin |
| POST | `/signup` | – | signup |
| POST | `/forgot-password` | – | forgot-password |
| GET | `/verify-account?token=` | – | verify-account |
| PUT | `/update-password?token=` | – | update-password |
| GET / PUT | `/auth/profile` | user | account/setting, checkout |
| POST | `/auth/profile/image-upload` (field `photo`) | user | customer create/edit |
| GET / POST | `/admin/customers?search&page&limit&orderBy` | admin | dashboard/customers |
| GET / PUT / DELETE | `/admin/customers/:id` | admin | dashboard/customers |
| GET / POST | `/admin/roles` | admin | dashboard/role |
| GET | `/admin/roles/:id` | admin | (belum dipakai) |

**Product service**

| Method | Path | Auth | Dipakai di |
|---|---|---|---|
| GET | `/categories/home` | – | header, home, shop |
| GET | `/categories/shop` | – | (belum dipakai) |
| GET / POST | `/admin/categories?search&page&limit&orderBy` | admin | dashboard/categories |
| GET / PUT / DELETE | `/admin/categories/:id` | admin | dashboard/categories |
| POST | `/admin/image-upload` (field `image`) | admin | kategori & produk |
| GET | `/products/home` | – | home |
| GET | `/products/shop?search&page&limit&price&orderBy&category` | – | shop |
| GET | `/products/home/:id` | – | detail produk |
| GET / POST | `/admin/products?search&page&limit&status&orderBy&category` | admin | dashboard/products |
| GET / PUT / DELETE | `/admin/products/:id` | admin | dashboard/products |
| GET / POST | `/auth/cart` (`{ product_id, quantity }`) | user | cart, product card |
| DELETE | `/auth/cart?product_id=` | user | cart |
| DELETE | `/auth/cart/all` | user | checkout |

**Order service**

| Method | Path | Auth | Dipakai di |
|---|---|---|---|
| GET | `/auth/orders?search&page&limit&status` | user | account |
| POST | `/auth/orders?lat=&lng=` | user | checkout |
| GET | `/auth/orders/:id` | user | (belum dipakai) |
| GET | `/admin/orders?search&page&limit&status` | admin | dashboard/orders |
| GET | `/admin/orders/:id` | admin | dashboard/orders/show |
| PUT | `/admin/orders/:id/status` (`{ status, remarks }`) | admin | dashboard/orders/show |

**Payment service**

| Method | Path | Auth | Dipakai di |
|---|---|---|---|
| POST | `/auth/payments` (`{ order_id, remarks, payment_method, gross_amount, user_id }`) | user | checkout → `payment_token` untuk Snap |

### 1.4 Model Data (dari pemakaian di template)

- **User**: `id, name, email, phone, address, lat, lng, photo, role, access_token`
- **Category**: `id, name, slug, icon, description, status (Published|Unpublished), parent_id, childs[]`
- **Product**: `id, product_name, category_name, category_slug, unit (gram|kilo), weight, stock, reguler_price, sale_price, product_image, product_description, product_status, child[]` (child = varian dengan field yang sama)
- **CartItem**: `id, product_name, product_image, sale_price, quantity, weight, unit`
- **Order**: `id, order_code, order_datetime, status/order_status, total_amount, shipping_fee, shipping_type (Delivery|Pickup), payment_method (cod|midtrans), customer { customer_name, customer_email, customer_phone, customer_address }, order_detail[] { product_image, product_name, product_price, quantity, weight, unit }`
- **Role**: `id, name` (yang dipakai untuk guard: `"Super Admin"`)

### 1.5 Peta Route

| Route | File Nuxt lama | Akses | Layout lama |
|---|---|---|---|
| `/` | `pages/index.vue` | publik | default |
| `/shop` | `pages/shop/index.vue` | publik | default |
| `/shop/[id]` | `pages/shop/[id]/index.vue` | publik | default |
| `/shop/cart` | `pages/shop/cart.vue` | user | default |
| `/shop/checkout` | `pages/shop/checkout.vue` | user + alamat terisi | default |
| `/shop/success-payment` | `pages/shop/success-payment.vue` | user | default |
| `/account` | `pages/account/index.vue` | user | default |
| `/account/setting` | `pages/account/setting.vue` | user | default |
| `/auth/signin`, `/auth/signup`, `/auth/forgot-password` | `pages/auth/*` | guest | auth |
| `/auth/update-password?token=`, `/auth/verify-account?token=` | `pages/auth/*` | guest | auth |
| `/dashboard` | `pages/dashboard/index.vue` | Super Admin | dashboard |
| `/dashboard/products` (+ `/create`, `/edit/[id]`) | `pages/dashboard/products/*` | Super Admin | dashboard |
| `/dashboard/categories` (+ `/create`, `/edit/[id]`) | `pages/dashboard/categories/*` | Super Admin | dashboard |
| `/dashboard/customers` (+ `/create`, `/edit/[id]`) | `pages/dashboard/customers/*` | Super Admin | dashboard |
| `/dashboard/orders` (+ `/show/[id]`) | `pages/dashboard/orders/*` | Super Admin | dashboard |
| `/dashboard/role` (+ `/create`) | `pages/dashboard/role/*` | Super Admin | dashboard |

### 1.6 Temuan Bug & Utang Teknis (diperbaiki saat rewrite)

| # | Temuan | Lokasi lama | Tindakan di rewrite |
|---|---|---|---|
| 1 | `catch (err) { throw error }` → `ReferenceError`, error asli hilang | `stores/product.js`, `category.js`, `orders.js`, `role.js`, `cart.js#fetchCarts`, `auth.js#getProfile` | Satu `apiClient` dengan `ApiError` terstandar |
| 2 | `fetchCategoriesAdmin` membangun query tapi tidak ditempel ke URL → search/paging kategori admin tidak jalan | `stores/category.js` | Service menerima params dan serialize via helper |
| 3 | Shop mengirim `sort`, store membaca `orderBy`; filter search/kategori/harga/sort saling me-reset | `pages/shop/index.vue` | Filter = satu state (`$shopFilters`) yang tersinkron ke URL dan jadi query key |
| 4 | Middleware `auth` mengecek `to.meta.requiresAuth` yang tidak pernah di-set → halaman akun tidak terlindungi; role admin dibaca dari cookie yang bisa diedit client | `middleware/auth.js`, `middleware/admin.js` | Astro middleware server-side + validasi via `GET /auth/profile` |
| 5 | Key response upload tidak konsisten (`imageUrl` vs `image_url`) | `stores/category.js` vs pages dashboard | Normalisasi di service upload |
| 6 | Foto profil di-hardcode URL Supabase; file upload diabaikan; lat/lng jadi `"null"` bila geolokasi ditolak | `pages/account/setting.vue` | Upload sungguhan + fallback input manual/peta |
| 7 | `mapsLink` memakai `formData.lat.value` dua kali | `pages/shop/checkout.vue` | Util `buildMapsLink(lat, lng)` |
| 8 | `password_new = ''` meng-assign ulang `const` → `TypeError` | `pages/auth/update-password.vue` | Form state via form library |
| 9 | Tombol +/- qty di cart hanya lokal, tidak tersimpan ke API; batas 10 hardcode | `pages/shop/cart.vue` | Mutation update qty (lihat pertanyaan backend) + optimistic update |
| 10 | Badge cart di header basi (hanya update saat halaman cart dibuka) | `components/common/Header.vue` | Badge membaca query `cart` yang sama |
| 11 | Ongkir `5000` dan total dihitung di client lalu dikirim ke backend | `pages/shop/checkout.vue` | Konstanta terpusat; konfirmasi agar backend jadi sumber kebenaran |
| 12 | Cart dikosongkan sebelum payment dibuat → jika payment gagal, cart hilang | `pages/shop/checkout.vue` | Urutan: create order → create payment → sukses → invalidate cart |
| 13 | Varian di edit produk mendapat `id: Date.now()` yang sama → hapus satu varian menghapus semua | `pages/dashboard/products/edit/[id]` | `crypto.randomUUID()` untuk id sementara |
| 14 | Reset form produk menukar `description` dan `status` | `pages/dashboard/products/create` | Reset ke `defaultValues` |
| 15 | Enum status tidak konsisten (`ACTIVE` vs `Active`, `Deactive` vs `INACTIVE`, `Pending` vs `PENDING`) | dashboard products/orders | Enum tunggal di `src/types` (konfirmasi ke backend) |
| 16 | Filter status produk admin menghilangkan search & paging | `pages/dashboard/products/index.vue` | Semua filter tabel jadi satu objek params |
| 17 | Script dari `/libs/bootstrap`, `/libs/simplebar`, `/libs/tiny-slider`, `/libs/apexcharts`, `/libs/nouislider` tidak ada di `public/libs` → 404 | `useHead` di banyak page | Hapus semua script vendor; ganti komponen React |
| 18 | Dead code: `composables/useCart.js`, `components/common/Navbar.vue`, `components/common/Sidebar.vue`, import `#build/ui` | – | Tidak dibawa |
| 19 | `alert()` / `confirm()` untuk semua feedback | seluruh app | Toast + ConfirmDialog |
| 20 | Profil admin & notifikasi dummy (hardcode "FreshCart Admin") | `components/admin/*Dropdown.vue` | Ambil dari session; notifikasi dari API atau ditunda |
| 21 | Gambar duplikat di `assets/images` dan `public/images`; branding & copy template FreshCart | – | Aset dan copy baru (lihat §3) |
| 22 | Bahasa UI campur Inggris/Indonesia | seluruh app | UI Bahasa Indonesia konsisten |

---

## 2. Arsitektur Target

### 2.1 Prinsip

1. **Astro merender halaman (SSR)**, React hanya untuk bagian interaktif (island). Konten statis (footer, hero copy, section "Mengapa Kami") tetap `.astro` tanpa JS.
2. **Server state = TanStack Query**, **client/UI state = Nano Stores**. Data dari API (produk, cart, order) tidak pernah disalin ke nanostore.
3. **BFF tipis di Astro**: browser memanggil `/api/<service>/...`, Astro meneruskan ke microservice sambil menempelkan token dari cookie `httpOnly`. Token tidak pernah terbaca oleh JavaScript client.
4. **Guard di server** lewat `src/middleware.ts`, bukan di komponen.
5. **Atomic Design ketat**: komponen hanya boleh meng-import dari level yang sama atau di bawahnya.

### 2.2 Rendering per halaman

| Halaman | Mode | Catatan |
|---|---|---|
| Home, Shop, Detail produk | SSR + hydrate | Data awal di-fetch di frontmatter `.astro` untuk SEO, dikirim sebagai `initialData` ke island |
| Cart, Checkout, Account | SSR shell + island `client:load` | Butuh session |
| Auth | SSR + island form | Redirect ke `/` jika sudah login |
| Dashboard | SSR shell + island `client:load` | Tabel, form, filter sepenuhnya di client |
| Success payment | prerender | Statis |

### 2.3 Pola TanStack Query di Astro

Setiap island Astro adalah root React terpisah, jadi `QueryClientProvider` per island akan membuat cache terpisah. Solusinya: satu `QueryClient` singleton disimpan di nanostore dan dioper sebagai argumen kedua `useQuery`/`useMutation`.

```ts
import { atom } from 'nanostores'
import { QueryClient } from '@tanstack/react-query'

export const $queryClient = atom(
  new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
    },
  }),
)
```

```ts
import { useStore } from '@nanostores/react'
import { useQuery } from '@tanstack/react-query'
import { $queryClient } from '@/stores/query-client'
import { productService } from '@/lib/services/products'
import { queryKeys } from '@/lib/queries/keys'

export function useShopProducts(params: ShopProductParams) {
  const client = useStore($queryClient)
  return useQuery(
    {
      queryKey: queryKeys.products.shop(params),
      queryFn: () => productService.shop(params),
      placeholderData: (prev) => prev,
    },
    client,
  )
}
```

Dengan pola ini badge cart di `SiteHeader` dan isi `CartDrawer` (dua island berbeda) berbagi cache yang sama, sehingga `invalidateQueries(queryKeys.cart.all)` meng-update keduanya.

### 2.4 Nano Stores yang dibuat

| Store | Tipe | Isi |
|---|---|---|
| `$queryClient` | `atom` | QueryClient singleton |
| `$session` | `atom<SessionUser \| null>` | User aktif, di-hydrate dari `Astro.locals.user` |
| `$isAdmin` | `computed` | `$session.role === 'Super Admin'` |
| `$cartDrawerOpen` | `atom<boolean>` | Drawer keranjang |
| `$authModal` | `map` | `{ open, redirectTo, pendingAction }` (ganti alert "silakan login") |
| `$mobileNavOpen`, `$adminSidebarOpen` | `atom<boolean>` | Navigasi |
| `$toasts` | `atom<Toast[]>` + action `toast.success/error` | Ganti `alert()` |
| `$confirmDialog` | `map` | Ganti `window.confirm()` |
| `$shopFilters` | `map` | `{ search, category, minPrice, maxPrice, orderBy, page, limit }`, sinkron dua arah dengan URL |
| `$checkoutDraft` | `persistentMap` | `{ step, shippingType, paymentMethod, remarks }` agar tidak hilang saat refresh |

Aturan: action/mutator diletakkan di file store yang sama (`openCartDrawer()`, `setShopFilter()`), komponen tidak memanggil `.set()` langsung.

### 2.5 Query key factory

```ts
export const queryKeys = {
  session: { profile: ['session', 'profile'] as const },
  categories: {
    all: ['categories'] as const,
    home: () => [...queryKeys.categories.all, 'home'] as const,
    admin: (p: ListParams) => [...queryKeys.categories.all, 'admin', p] as const,
    detail: (id: string) => [...queryKeys.categories.all, 'detail', id] as const,
  },
  products: {
    all: ['products'] as const,
    home: () => [...queryKeys.products.all, 'home'] as const,
    shop: (p: ShopProductParams) => [...queryKeys.products.all, 'shop', p] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    admin: (p: AdminProductParams) => [...queryKeys.products.all, 'admin', p] as const,
    adminDetail: (id: string) => [...queryKeys.products.all, 'admin-detail', id] as const,
  },
  cart: { all: ['cart'] as const },
  orders: {
    all: ['orders'] as const,
    mine: (p: OrderParams) => [...queryKeys.orders.all, 'mine', p] as const,
    admin: (p: OrderParams) => [...queryKeys.orders.all, 'admin', p] as const,
    adminDetail: (id: string) => [...queryKeys.orders.all, 'admin-detail', id] as const,
  },
  customers: { all: ['customers'] as const },
  roles: { all: ['roles'] as const },
}
```

Setiap mutation meng-invalidate key domainnya (mis. `createProduct` → `products.all`; `addToCart` → `cart.all`; `updateOrderStatus` → `orders.all`).

---

## 3. Rebranding: Fresh Market

### 3.1 Identitas

- **Nama**: Fresh Market
- **Tagline**: "Segar dari pasar, sampai di depan pintu."
- **Karakter**: hangat, bersih, "pasar tradisional yang rapi" — bukan template e-commerce generik.

### 3.2 Logo (dibuat baru, SVG)

- **Mark**: bentuk tas belanja/keranjang berujung membulat dengan **daun** sebagai pegangannya. Grid 32×32, stroke 2px, sudut membulat.
- **Wordmark**: `fresh market` huruf kecil, font display (lihat §3.4), "fresh" berwarna `leaf-600`, "market" berwarna `ink`.
- **File yang dihasilkan** (`public/brand/`): `logo.svg` (horizontal), `logo-mark.svg`, `logo-white.svg` (untuk footer gelap), `favicon.svg`, `apple-touch-icon.png`, `og-default.png` (1200×630).
- Atom `Logo.astro` dengan prop `variant: 'full' | 'mark' | 'white'`.
- Semua file `freshcart-logo*.svg` dan copy "FreshCart" tidak dibawa.

### 3.3 Palet (token Tailwind v4 di `src/styles/global.css`)

| Token | Hex | Pemakaian |
|---|---|---|
| `leaf-50` … `leaf-900` (primary) | `leaf-600` = `#2E7D4F` | CTA, link aktif, harga diskon |
| `carrot-500` (accent) | `#F0773A` | Badge promo, highlight, notifikasi |
| `sun-400` (secondary accent) | `#F5C344` | Rating, label "baru" |
| `cream-50` (surface) | `#FBF8F2` | Background halaman storefront |
| `ink-900` (teks) | `#1D2A22` | Teks utama |
| `stone-*` | skala netral hangat | Border, teks sekunder |
| `success / warning / danger / info` | turunan leaf / sun / `#D9483B` / `#2F6FB0` | Status order & toast |

```css
@import "tailwindcss";

@theme {
  --font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Fraunces", ui-serif, Georgia, serif;

  --color-leaf-50: #eef7f1;
  --color-leaf-100: #d6ecdd;
  --color-leaf-500: #3f9a64;
  --color-leaf-600: #2e7d4f;
  --color-leaf-700: #23623e;
  --color-carrot-500: #f0773a;
  --color-sun-400: #f5c344;
  --color-cream-50: #fbf8f2;
  --color-ink-900: #1d2a22;

  --radius-card: 1rem;
  --radius-pill: 9999px;
  --shadow-card: 0 1px 2px rgb(29 42 34 / 0.06), 0 4px 16px rgb(29 42 34 / 0.06);
}
```

Dark mode tidak masuk scope awal; token disusun agar bisa ditambah lewat `@variant dark`.

### 3.4 Tipografi & elemen visual

- **Body/UI**: Plus Jakarta Sans (400/500/600/700) via `@fontsource-variable/plus-jakarta-sans` (self-hosted, tanpa Google Fonts request).
- **Display/heading hero**: Fraunces (600) via `@fontsource-variable/fraunces`.
- Harga memakai `tabular-nums`, format `Rp 12.500` lewat satu util `formatRupiah`.
- Radius kartu 16px, tombol pill, shadow lembut, ilustrasi garis sederhana untuk empty state (cart kosong, belum ada order, 404).
- Ikon: **satu** set saja, `lucide-react` (mengganti campuran tabler, heroicons, iconify, dan 6 komponen `Icon*.vue`).

### 3.5 Arah redesign per area

| Area | Lama | Baru |
|---|---|---|
| Header | Logo FreshCart, search, dropdown kategori template | Top bar info pengiriman → header sticky: logo, search dengan saran kategori, ikon akun, tombol keranjang dengan badge live |
| Home | Slider template + kategori + "New Products" + "Mengapa Memilih Kami" | Hero dengan foto/ilustrasi baru dan CTA, chip kategori scroll horizontal, grid "Baru di pasar", strip value proposition (Pengiriman cepat, 100% segar, Bayar aman), banner promo |
| Shop | Sidebar kategori + noUiSlider + grid | Sidebar filter (kategori, rentang harga dual-range native, urutkan) yang jadi bottom sheet di mobile; grid responsif; pagination; filter aktif tampil sebagai chip yang bisa dihapus |
| Detail produk | Swiper galeri + info | Galeri (Embla) + pilihan varian berat sebagai segmented control, stepper qty, sticky add-to-cart di mobile |
| Cart | Tabel template | Daftar item kartu + ringkasan sticky; drawer cart dari header |
| Checkout | Accordion 3 section | Stepper 3 langkah (Alamat → Pengiriman → Pembayaran) + ringkasan pesanan; peringatan jika alamat belum diisi |
| Account | Tabel order + form profil | Layout akun dengan sidebar: Pesanan Saya (status badge berwarna), Pengaturan Profil (upload foto, alamat, pin lokasi) |
| Auth | Form template + ilustrasi template | Split layout: panel ilustrasi brand + form |
| Dashboard | Template FreshCart admin, home berisi banner "Welcome back! FreshCart" | Sidebar admin baru, topbar dengan profil dari session, home berisi ringkasan (jumlah order per status dari `/admin/orders`) + shortcut |

### 3.6 Aset gambar

- Gambar produk & kategori berasal dari API (tidak perlu dibawa).
- Aset demo template (banner, slider, avatar, about, blog, stores-logo, overview, docs) **tidak dibawa**.
- Aset baru yang perlu disiapkan: hero (1–3), banner promo (2), ilustrasi auth (1), ilustrasi empty state (3), ikon metode bayar (COD, Midtrans). Gunakan foto milik sendiri atau sumber berlisensi bebas; simpan di `src/assets/` agar dioptimasi `astro:assets`.

---

## 4. Struktur Folder (Atomic Design)

```
fresh-market/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── .env.example
├── public/
│   ├── brand/                 logo.svg, logo-mark.svg, logo-white.svg, favicon.svg, og-default.png
│   └── robots.txt
└── src/
    ├── assets/                gambar yang dioptimasi astro:assets (hero, banner, ilustrasi)
    ├── components/
    │   ├── atoms/
    │   ├── molecules/
    │   ├── organisms/
    │   └── templates/
    ├── pages/                 route Astro (tipis: template + organisms)
    │   └── api/               BFF proxy & endpoint auth
    ├── lib/
    │   ├── api/               client.ts, errors.ts, env.ts, proxy.ts
    │   ├── services/          auth, products, categories, cart, orders, payments, customers, roles, uploads
    │   ├── queries/           keys.ts + hooks per domain (useXxxQuery / useXxxMutation)
    │   ├── validation/        skema zod per form
    │   └── utils/             format.ts (rupiah, tanggal), cn.ts, url.ts, maps.ts
    ├── stores/                query-client, session, ui, toast, confirm, shop-filters, checkout
    ├── types/                 api.ts, user.ts, product.ts, category.ts, cart.ts, order.ts, enums.ts
    ├── styles/global.css
    ├── middleware.ts
    └── env.d.ts
```

### 4.1 Aturan level

| Level | Isi | Boleh import | Ekstensi | Boleh fetch / akses store? |
|---|---|---|---|---|
| **atoms** | Elemen UI terkecil, tanpa logika bisnis | – | `.astro` jika statis, `.tsx` jika dipakai di island | Tidak |
| **molecules** | Gabungan beberapa atom dengan satu fungsi | atoms | `.astro` / `.tsx` | Tidak (hanya props & callback) |
| **organisms** | Bagian halaman yang utuh; titik island | atoms, molecules, organisms lain | `.astro` / `.tsx` | **Ya** (hooks query & nanostore) |
| **templates** | Kerangka layout halaman, slot konten | semua komponen | `.astro` | Hanya `Astro.locals` |
| **pages** | Route; ambil data SSR awal, pasang template + organisms | templates, organisms | `.astro`, `.ts` (API) | Ya (server) |

Komponen yang perlu dipakai baik di `.astro` maupun di dalam island React ditulis sebagai `.tsx` (React bisa dirender statis oleh Astro tanpa `client:*`).

### 4.2 Daftar komponen

**atoms/**
`Button`, `IconButton`, `Link`, `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Label`, `Badge`, `Avatar`, `Spinner`, `Skeleton`, `Divider`, `Logo`, `Icon` (wrapper lucide), `Price`, `Heading`, `Text`, `VisuallyHidden`

**molecules/**
`FormField` (label + input + error), `PasswordField` (toggle show), `SearchBar`, `QuantityStepper`, `PriceTag` (harga normal + coret + diskon), `StatusBadge` (order/produk/kategori), `CategoryChip`, `Pagination`, `PriceRangeInput`, `SortSelect`, `PageSizeSelect`, `NavLink`, `Dropdown`, `Tabs`, `EmptyState`, `ImageUploader` (validasi tipe & ukuran + preview), `Toast`, `ConfirmDialog`, `Modal`, `Drawer`, `StatCard`, `Breadcrumb`, `AddressCard`, `PaymentOption`, `ShippingOption`, `VariantSelector`

**organisms/**

| Area | Komponen |
|---|---|
| Global | `SiteHeader`, `CategoryNav`, `MobileNav`, `SiteFooter`, `CartDrawer`, `AuthModal`, `ToastViewport`, `ConfirmDialogHost` |
| Home | `HeroBanner`, `CategoryCarousel`, `ProductGrid`, `ValueProps`, `PromoBanner` |
| Produk | `ProductCard`, `ProductGallery`, `ProductInfo`, `QuickViewModal` |
| Shop | `ShopFilterPanel`, `ShopToolbar`, `ShopProductList` |
| Cart / Checkout | `CartItemList`, `CartSummary`, `CheckoutStepper`, `CheckoutAddressStep`, `CheckoutShippingStep`, `CheckoutPaymentStep`, `OrderSummary`, `PaymentSuccess` |
| Akun | `AccountSidebar`, `OrderHistoryTable`, `ProfileForm` |
| Auth | `SignInForm`, `SignUpForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `VerifyAccountStatus` |
| Admin | `AdminSidebar`, `AdminTopbar`, `ProfileMenu`, `NotificationMenu`, `DataTable`, `TableToolbar`, `DashboardSummary`, `ProductTable`, `ProductForm`, `VariantManager`, `CategoryTable`, `CategoryForm`, `CustomerTable`, `CustomerForm`, `OrderTable`, `OrderDetailPanel`, `OrderStatusForm`, `RoleTable`, `RoleForm` |

**templates/**
`BaseLayout.astro` (html, head, SEO meta, font, global CSS, `ToastViewport`), `StorefrontLayout.astro` (header + footer + cart drawer + auth modal), `AuthLayout.astro`, `AccountLayout.astro` (storefront + sidebar akun), `DashboardLayout.astro` (admin sidebar + topbar)

---

## 5. Lapisan Data

### 5.1 `apiClient`

- Fungsi `request<T>(service, path, { method, query, body, formData, signal })` yang:
  - Di browser memanggil `/api/<service><path>`; di server memanggil URL service langsung dengan token dari cookie.
  - Serialize `query` dengan membuang nilai kosong (memperbaiki bug #2 dan #3).
  - Parse envelope `{ data, message, pagination }` → mengembalikan tipe `ApiResponse<T>` / `Paginated<T>`.
  - Melempar `ApiError { status, message, details }` jika `!response.ok`.
  - Status `401` → kosongkan `$session`, buka `$authModal` (client) atau redirect ke `/auth/signin?redirect=` (server).
- Service per domain (`src/lib/services/*.ts`) hanya berisi fungsi bertipe yang memanggil `request`, tanpa state.
- Normalisasi respon yang tidak konsisten di service (mis. upload mengembalikan `{ url }` terlepas dari `image_url`/`imageUrl`).

### 5.2 BFF & Auth

```
src/pages/api/auth/signin.ts      POST → user service /signin → set cookie httpOnly `fm_token` → return user
src/pages/api/auth/signout.ts     POST → hapus cookie
src/pages/api/[service]/[...path].ts   ALL → whitelist service → forward + header Authorization
```

- Cookie: `httpOnly`, `secure` (production), `sameSite=lax`, `path=/`, `maxAge` mengikuti masa berlaku token (konfirmasi ke backend).
- Proxy hanya menerima service yang ada di whitelist (`user`, `product`, `order`, `payment`, `notification`) dan meneruskan `multipart/form-data` apa adanya untuk upload.

### 5.3 Middleware (`src/middleware.ts`)

1. Baca cookie `fm_token`. Jika ada, panggil `GET /auth/profile` (sekali per request) → `context.locals.user`. Jika 401, hapus cookie.
2. Aturan route:
   - `/account/**`, `/shop/cart`, `/shop/checkout`, `/shop/success-payment` → wajib login, selain itu redirect ke `/auth/signin?redirect=<path>`.
   - `/dashboard/**` → wajib `role === 'Super Admin'`, selain itu redirect ke `/`.
   - `/auth/signin`, `/auth/signup` → jika sudah login, redirect ke `/dashboard` (admin) atau `/`.
3. Template mengirim `Astro.locals.user` ke island sebagai prop, island memanggil `hydrateSession(user)` sekali.

### 5.4 Pemetaan store Pinia → service + hooks

| Pinia lama | Service baru | Hooks |
|---|---|---|
| `auth` | `authService` | `useSignIn`, `useSignUp`, `useForgotPassword`, `useResetPassword`, `useVerifyAccount`, `useProfile`, `useUpdateProfile`, `useUploadAvatar`, `useSignOut` |
| `category` | `categoryService` | `useHomeCategories`, `useAdminCategories`, `useAdminCategory`, `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory` |
| `product` | `productService` | `useHomeProducts`, `useShopProducts`, `useProduct`, `useAdminProducts`, `useAdminProduct`, `useCreateProduct`, `useUpdateProduct`, `useDeleteProduct` |
| `category.uploadImage` / `customer.uploadImage` | `uploadService` | `useUploadImage(kind)` |
| `cart` | `cartService` | `useCart`, `useCartCount` (select), `useAddToCart`, `useRemoveFromCart`, `useClearCart` |
| `orders` | `orderService` | `useMyOrders`, `useAdminOrders`, `useAdminOrder`, `useCreateOrder`, `useUpdateOrderStatus` |
| `payment` | `paymentService` | `useCreatePayment` |
| `customer` | `customerService` | `useCustomers`, `useCustomer`, `useCreateCustomer`, `useUpdateCustomer`, `useDeleteCustomer` |
| `role` | `roleService` | `useRoles`, `useCreateRole` |

### 5.5 Alur penting

**Add to cart (guest)**: klik → `$session` kosong → `openAuthModal({ pendingAction: { type: 'add-to-cart', productId, quantity } })` → setelah login sukses, pending action dijalankan → toast sukses → badge ter-update lewat invalidasi `cart.all`.

**Checkout**:
1. Load `useProfile` + `useCart`. Alamat kosong → tampilkan peringatan dan link ke `/account/setting?redirect=/shop/checkout` (bukan redirect paksa).
2. Step Pengiriman: `Delivery` (ongkir dari konstanta `SHIPPING_FEE`) atau `Pickup`.
3. Step Pembayaran: `cod` atau `midtrans`.
4. Submit: `createOrder` → `createPayment` → jika `payment_token` kosong (COD) langsung ke success; jika ada → `window.snap.pay` (script Snap dimuat on-demand hanya di halaman checkout).
5. `onSuccess` → `clearCart` → invalidate `cart.all` & `orders.all` → `/shop/success-payment`. `onPending`/`onError`/`onClose` → toast, cart tetap utuh.

**Filter shop**: URL `?search&category&minPrice&maxPrice&orderBy&page&limit` ↔ `$shopFilters` ↔ `queryKeys.products.shop(filters)`. Perubahan filter apa pun me-reset `page` ke 1 dan tidak menghapus filter lain.

---

## 6. Konvensi Kode

- TypeScript `strict`, path alias `@/*` → `src/*`.
- **Tidak ada komentar di dalam kode** (baris, blok, JSDoc, maupun di test).
- Nama file komponen `PascalCase`, hooks `useXxx`, store `$xxx`.
- Tidak ada `fetch` langsung di komponen; selalu lewat hooks → service → `apiClient`.
- Tidak ada `alert`/`confirm`; gunakan `toast` dan `confirm()` dari store.
- Kelas Tailwind digabung dengan util `cn()` (`clsx` + `tailwind-merge`); varian komponen dengan `class-variance-authority` atau map objek sederhana.
- Form: skema `zod` + `@tanstack/react-form` (konsisten dengan ekosistem TanStack) atau `react-hook-form` (lihat Keputusan).
- Aksesibilitas: semua kontrol punya label, modal/drawer trap focus + `Esc`, kontras warna lolos AA.
- Format & lint: Prettier (`prettier-plugin-astro`, `prettier-plugin-tailwindcss`), ESLint flat config, `astro check` di CI.

---

## 7. Dependency

```bash
npm create astro@latest fresh-market -- --template minimal --typescript strict
npx astro add react node
npm i tailwindcss @tailwindcss/vite
npm i @tanstack/react-query @tanstack/react-query-devtools
npm i nanostores @nanostores/react @nanostores/persistent
npm i zod @tanstack/react-form
npm i embla-carousel-react lucide-react clsx tailwind-merge
npm i @fontsource-variable/plus-jakarta-sans @fontsource-variable/fraunces
npm i -D prettier prettier-plugin-astro prettier-plugin-tailwindcss eslint @astrojs/check
npm i -D vitest @testing-library/react @testing-library/user-event jsdom msw @playwright/test
```

```js
import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
})
```

Tidak dibawa dari repo lama: bootstrap, `theme.min.css/js`, `@popperjs/core`, swiper, tiny-slider, nouislider, wnumb, quill, dropzone, simplebar, `@nuxt/*`, pinia, `@tabler/*`, `@heroicons/vue`, `@iconify/vue`, dayjs (diganti `Intl`).

---

## 8. Fase Pengerjaan

Estimasi dalam hari kerja satu developer.

### Fase 0 — Setup proyek (0,5 hari)
- [ ] Scaffold Astro + React + Node adapter + Tailwind v4.
- [ ] `tsconfig` strict + alias `@/*`, Prettier, ESLint, `astro check`.
- [ ] `.env.example` sesuai tabel §1.2, validasi env di `src/lib/api/env.ts` (zod).
- [ ] Buat kerangka folder §4.

**Selesai jika**: `npm run dev`, `npm run build`, `npm run check` lolos.

### Fase 1 — Brand & design system (2 hari)
- [ ] Desain dan ekspor logo + favicon + OG image (§3.2).
- [ ] Token warna, font, radius, shadow di `global.css` (§3.3–3.4).
- [ ] Semua **atoms** dan **molecules** di §4.2.
- [ ] Halaman `/_styleguide` (hanya aktif di dev) yang menampilkan semua atom & molecule dalam semua varian/state.
- [ ] Templates: `BaseLayout`, `StorefrontLayout`, `AuthLayout`, `AccountLayout`, `DashboardLayout` (masih dengan konten placeholder).

**Selesai jika**: styleguide tampil benar di 360px, 768px, 1280px; kontras AA.

### Fase 2 — Fondasi data & auth (2 hari)
- [ ] `src/types/*` + enum status terpusat.
- [ ] `apiClient`, `ApiError`, BFF proxy, endpoint `signin`/`signout`.
- [ ] Semua service (§5.4) + `queryKeys`.
- [ ] Nano Stores (§2.4) + `$queryClient`.
- [ ] `middleware.ts` + `hydrateSession`.
- [ ] Unit test `apiClient` & service dengan MSW.

**Selesai jika**: login via `/api/auth/signin` mengisi cookie httpOnly, `Astro.locals.user` terisi, guard route bekerja untuk ketiga jenis akses.

### Fase 3 — Halaman auth (1 hari)
- [ ] Signin (redirect sesuai role & `?redirect=`), Signup (pesan sukses → signin), Forgot password, Update password (token dari query; tanpa token → signin), Verify account.
- [ ] `AuthModal` untuk login inline + pending action.

### Fase 4 — Storefront katalog (3 hari)
- [ ] `SiteHeader` (search → `/shop?search=`, kategori, badge cart live), `SiteFooter` baru, `MobileNav`.
- [ ] Home: hero, kategori, produk baru (SSR `initialData`), value props, promo.
- [ ] Shop: filter panel + toolbar + grid + pagination tersinkron URL (§5.5).
- [ ] Detail produk: galeri, varian, qty, add-to-cart, SEO meta + JSON-LD `Product`.
- [ ] `QuickViewModal`.

### Fase 5 — Cart, checkout, pembayaran (2,5 hari)
- [ ] `CartDrawer` + halaman cart (hapus item, ubah qty sesuai jawaban backend).
- [ ] Checkout 3 langkah + ringkasan + validasi alamat.
- [ ] Integrasi Midtrans Snap (script on-demand, key dari env) dan COD.
- [ ] Halaman sukses (auto-redirect 5 detik dengan tombol "Kembali belanja").

**Selesai jika**: alur COD dan Midtrans sandbox berhasil end-to-end; payment gagal/ditutup tidak mengosongkan cart.

### Fase 6 — Akun pelanggan (1 hari)
- [ ] Pesanan Saya (paging, filter status, badge status).
- [ ] Pengaturan profil: data diri, upload foto sungguhan, alamat, lat/lng dari geolokasi dengan fallback input manual + preview link Google Maps.
- [ ] Logout.

### Fase 7 — Dashboard admin (4 hari)
- [ ] `DashboardLayout`, `AdminSidebar` (Produk, Kategori, Pesanan, Pelanggan, Role), `AdminTopbar` dengan profil dari session.
- [ ] `DataTable` generik: search (debounce), filter, page size, pagination, loading skeleton, empty state.
- [ ] Produk: list + filter status/kategori, create/edit dengan `VariantManager` & upload gambar per varian, delete dengan konfirmasi.
- [ ] Kategori: list, create/edit (icon upload, status Published/Unpublished), delete.
- [ ] Pelanggan: list, create/edit (foto, password opsional saat edit, lokasi), delete.
- [ ] Pesanan: list + filter status, detail (customer, item, subtotal, ongkir, total), update status + remarks.
- [ ] Role: list, create.
- [ ] Home dashboard: `StatCard` jumlah pesanan per status + shortcut.
- [ ] `NotificationMenu`: sambungkan ke notification service jika endpoint tersedia, jika tidak sembunyikan.

### Fase 8 — QA & rilis (2 hari)
- [ ] E2E Playwright: browse → add to cart (guest → login) → checkout COD; admin: buat produk → muncul di shop; update status order.
- [ ] Lighthouse storefront: Performance ≥ 90, Accessibility ≥ 95, SEO ≥ 95 (mobile).
- [ ] Cek setiap baris tabel bug §1.6 sudah tertangani.
- [ ] `README.md` (setup, env, script), Dockerfile untuk `node ./dist/server/entry.mjs`.

**Total estimasi**: ±18 hari kerja.

---

## 9. Checklist Paritas Fitur

- [ ] Registrasi, verifikasi akun via email, login, lupa & reset password
- [ ] Redirect setelah login sesuai role
- [ ] Home: kategori unggulan, produk baru
- [ ] Shop: search, filter kategori, rentang harga, urutan (terbaru, harga naik/turun), page size 10/20/30, pagination
- [ ] Detail produk dengan varian berat & harga reguler/diskon
- [ ] Keranjang: tambah, hapus, kosongkan, jumlah item di header
- [ ] Checkout: alamat dari profil, Delivery/Pickup, catatan, COD/Midtrans
- [ ] Riwayat pesanan pelanggan
- [ ] Profil: nama, email, telepon, alamat, koordinat, foto
- [ ] Admin: CRUD produk (multi varian + gambar), CRUD kategori, CRUD pelanggan, daftar & detail & update status pesanan, daftar & tambah role

---

## 10. Pertanyaan untuk Backend

1. **Update qty cart**: apakah `POST /auth/cart` menimpa quantity atau menambah? Apakah ada endpoint `PUT`/`PATCH` untuk qty?
2. **Varian di cart**: apakah `product_id` di cart merujuk ke id varian (`child.id`) atau produk induk?
3. **Enum status** yang valid untuk produk (`ACTIVE`/`INACTIVE`/`DRAFT`?) dan order (`Pending`, `Confirmed`, `Process`, `Sending`, `Done`, `Cancel`?) beserta casing-nya.
4. **Response upload**: key final `image_url` atau `imageUrl`?
5. **Ongkir & total**: apakah backend bisa menghitung `shipping_fee` dan `total_amount` sendiri, sehingga client tidak mengirim total?
6. **Masa berlaku token** dan apakah ada refresh token.
7. **Notification service**: endpoint apa yang tersedia untuk notifikasi admin/pelanggan?
8. **Ringkasan dashboard**: apakah ada endpoint statistik, atau cukup agregasi dari `/admin/orders`?
9. **CORS**: dengan BFF proxy, browser tidak lagi memanggil service langsung — pastikan service dapat diakses dari server Astro.

---

## 11. Keputusan yang Perlu Dikonfirmasi

| Keputusan | Rekomendasi | Alternatif |
|---|---|---|
| Framework island | **React** — dukungan TanStack Query/Form, Embla, lucide, dan testing paling matang | Vue (lebih dekat dengan kode lama) atau Solid/Preact (bundle lebih kecil) |
| Penyimpanan token | **Cookie httpOnly + BFF proxy** (§5.2) | Cookie biasa dibaca client seperti repo lama (lebih cepat dikerjakan, kurang aman) |
| Library form | **`@tanstack/react-form` + zod** | `react-hook-form` + zod |
| Tabel admin | `DataTable` sendiri yang sederhana | `@tanstack/react-table` jika butuh sorting/kolom dinamis |
| Deploy | Node standalone (Docker) | Vercel/Netlify adapter |
| Nama folder | `fresh-market` (sudah ada di `D:\project\fresh-market`) | – |
