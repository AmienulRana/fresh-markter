import { ArrowRight, Sprout } from 'lucide-react'
import type { Product } from '@/types/catalog'
import { EmptyState } from '@/components/molecules/EmptyState'
import { ProductGrid } from '@/components/organisms/product/ProductGrid'
import { withQuery } from '@/lib/queries/client'
import { useHomeProducts } from '@/lib/queries/catalog'

function NewProductsBase({ initialData }: { initialData?: Product[] }) {
  const { data, isPending, isError } = useHomeProducts(initialData)

  return (
    <section className="container-page mt-14" aria-labelledby="home-products">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="home-products" className="font-display text-2xl font-semibold sm:text-3xl">
            Baru di pasar
          </h2>
          <p className="mt-1 text-sm text-ink-500">Produk segar yang baru saja masuk hari ini.</p>
        </div>
        <a href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-leaf-700 hover:underline">
          Lihat semua <ArrowRight className="h-4 w-4" />
        </a>
      </div>
      {isError || (!isPending && !data?.length) ? (
        <EmptyState
          icon={<Sprout />}
          title="Belum ada produk"
          description="Produk segar akan segera hadir. Coba muat ulang halaman sebentar lagi."
          className="rounded-card border border-dashed border-cream-200 bg-white"
        />
      ) : (
        <ProductGrid products={data ?? []} loading={isPending} />
      )}
    </section>
  )
}

export const NewProducts = withQuery(NewProductsBase)
