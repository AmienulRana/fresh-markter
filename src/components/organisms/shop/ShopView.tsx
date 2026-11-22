import { useStore } from '@nanostores/react'
import { PackageOpen, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import type { Paginated } from '@/types/api'
import type { Category, Product } from '@/types/catalog'
import { Button } from '@/components/atoms/Button'
import { Select } from '@/components/atoms/Select'
import { Breadcrumb } from '@/components/molecules/Breadcrumb'
import { EmptyState } from '@/components/molecules/EmptyState'
import { Drawer } from '@/components/molecules/Modal'
import { Pagination } from '@/components/molecules/Pagination'
import { ProductGrid } from '@/components/organisms/product/ProductGrid'
import { withQuery } from '@/lib/queries/client'
import { useHomeCategories, useShopProducts } from '@/lib/queries/catalog'
import { PAGE_SIZES, SHOP_SORT_OPTIONS } from '@/lib/constants'
import { formatRupiah } from '@/lib/utils'
import {
  $shopFilters,
  initShopFilters,
  resetShopFilters,
  serializeShopFilters,
  toShopParams,
  updateShopFilters,
  type ShopFilters,
} from '@/stores/shop-filters'
import { ShopFilterPanel } from './ShopFilterPanel'

let hydrated = false

function ShopViewBase({
  initialFilters,
  initialData,
  initialCategories,
}: {
  initialFilters: ShopFilters
  initialData?: Paginated<Product> | null
  initialCategories?: Category[]
}) {
  if (typeof window !== 'undefined' && !hydrated) {
    initShopFilters(initialFilters)
    hydrated = true
  }
  const storeFilters = useStore($shopFilters)
  const filters = typeof window === 'undefined' ? initialFilters : storeFilters
  const isInitial = serializeShopFilters(filters) === serializeShopFilters(initialFilters)
  const { data, isPending, isFetching, isError } = useShopProducts(
    toShopParams(filters),
    isInitial ? initialData : undefined,
  )
  const { data: categories = initialCategories ?? [] } = useHomeCategories(initialCategories)
  const [filterOpen, setFilterOpen] = useState(false)

  const activeCategory = categories.find((category) => category.slug === filters.category)
  const chips: { key: string; label: string; clear: Partial<ShopFilters> }[] = []
  if (filters.search) chips.push({ key: 'search', label: `“${filters.search}”`, clear: { search: '' } })
  if (activeCategory) chips.push({ key: 'category', label: activeCategory.name, clear: { category: '' } })
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    chips.push({
      key: 'price',
      label: `${formatRupiah(filters.minPrice ?? 0)} – ${formatRupiah(filters.maxPrice ?? 0)}`,
      clear: { minPrice: null, maxPrice: null },
    })
  }

  function changePage(page: number) {
    updateShopFilters({ page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const title = activeCategory?.name ?? (filters.search ? `Hasil pencarian “${filters.search}”` : 'Semua produk')

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Belanja', href: activeCategory ? '/shop' : undefined },
          ...(activeCategory ? [{ label: activeCategory.name }] : []),
        ]}
      />
      <div className="mt-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-40">
            <ShopFilterPanel
              categories={categories}
              filters={filters}
              onChange={updateShopFilters}
              onReset={resetShopFilters}
            />
          </div>
        </aside>

        <section aria-labelledby="shop-title">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 id="shop-title" className="font-display text-3xl font-semibold">
                {title}
              </h1>
              <p className="mt-1 text-sm text-ink-500" aria-live="polite">
                {data ? `${data.pagination.totalCount} produk ditemukan` : 'Memuat produk…'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFilterOpen(true)}>
                <SlidersHorizontal className="h-4 w-4" /> Filter
              </Button>
              <label className="sr-only" htmlFor="shop-sort">
                Urutkan
              </label>
              <Select
                id="shop-sort"
                className="w-52"
                value={filters.orderBy}
                onChange={(event) => updateShopFilters({ orderBy: event.target.value })}
                options={SHOP_SORT_OPTIONS}
              />
              <label className="sr-only" htmlFor="shop-limit">
                Jumlah per halaman
              </label>
              <Select
                id="shop-limit"
                className="w-28"
                value={filters.limit}
                onChange={(event) => updateShopFilters({ limit: Number(event.target.value) })}
                options={PAGE_SIZES.map((size) => ({ value: size, label: `${size} / hal` }))}
              />
            </div>
          </div>

          {chips.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {chips.map((chip) => (
                <li key={chip.key}>
                  <button
                    type="button"
                    onClick={() => updateShopFilters(chip.clear)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-leaf-50 px-3 py-1.5 text-xs font-semibold text-leaf-700 hover:bg-leaf-100"
                  >
                    {chip.label}
                    <X className="h-3.5 w-3.5" aria-label="Hapus filter" />
                  </button>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={resetShopFilters}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold text-ink-500 hover:text-ink-900"
                >
                  Hapus semua
                </button>
              </li>
            </ul>
          ) : null}

          <div className={isFetching && !isPending ? 'mt-6 opacity-60 transition-opacity' : 'mt-6'}>
            {isError ? (
              <EmptyState
                icon={<PackageOpen />}
                title="Gagal memuat produk"
                description="Periksa koneksi kamu lalu coba lagi."
                className="rounded-card border border-dashed border-cream-200 bg-white"
              />
            ) : !isPending && !data?.items.length ? (
              <EmptyState
                icon={<PackageOpen />}
                title="Produk tidak ditemukan"
                description="Coba ubah kata kunci atau filter yang kamu gunakan."
                action={<Button variant="soft" onClick={resetShopFilters}>Reset filter</Button>}
                className="rounded-card border border-dashed border-cream-200 bg-white"
              />
            ) : (
              <ProductGrid
                products={data?.items ?? []}
                loading={isPending}
                className="md:grid-cols-3 xl:grid-cols-4"
                skeletonCount={8}
              />
            )}
          </div>

          {data ? (
            <Pagination
              className="mt-8"
              pagination={data.pagination}
              itemCount={data.items.length}
              onPageChange={changePage}
            />
          ) : null}
        </section>
      </div>

      <Drawer open={filterOpen} onClose={() => setFilterOpen(false)} title="Filter produk" side="left">
        <div className="p-5">
          <ShopFilterPanel
            categories={categories}
            filters={filters}
            onChange={(patch) => {
              updateShopFilters(patch)
              setFilterOpen(false)
            }}
            onReset={() => {
              resetShopFilters()
              setFilterOpen(false)
            }}
          />
        </div>
      </Drawer>
    </div>
  )
}

export const ShopView = withQuery(ShopViewBase)
