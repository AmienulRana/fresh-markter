import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { Category } from '@/types/catalog'
import { ProductImage } from '@/components/atoms/ProductImage'
import { Skeleton } from '@/components/atoms/Skeleton'
import { withQuery } from '@/lib/queries/client'
import { useHomeCategories } from '@/lib/queries/catalog'

function CategoryCarouselBase({ initialData }: { initialData?: Category[] }) {
  const { data, isPending } = useHomeCategories(initialData)
  const trackRef = useRef<HTMLUListElement>(null)
  const categories = data ?? []

  function scroll(direction: 1 | -1) {
    const track = trackRef.current
    if (track) track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' })
  }

  if (!isPending && !categories.length) return null

  return (
    <section className="container-page mt-14" aria-labelledby="home-categories">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="home-categories" className="font-display text-2xl font-semibold sm:text-3xl">
            Belanja per kategori
          </h2>
          <p className="mt-1 text-sm text-ink-500">Temukan kebutuhan dapurmu lebih cepat.</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label="Geser ke kiri"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-white hover:bg-cream-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label="Geser ke kanan"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-cream-200 bg-white hover:bg-cream-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul ref={trackRef} className="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-none">
        {isPending
          ? Array.from({ length: 6 }, (_, index) => (
              <li key={index} className="w-36 shrink-0">
                <Skeleton className="aspect-square w-full rounded-3xl" />
                <Skeleton className="mx-auto mt-3 h-4 w-20" />
              </li>
            ))
          : categories.map((category) => (
              <li key={category.id} className="w-36 shrink-0 snap-start">
                <a
                  href={`/shop?category=${encodeURIComponent(category.slug)}`}
                  className="group flex flex-col items-center gap-3 rounded-3xl border border-cream-200 bg-white p-4 text-center transition-all hover:-translate-y-0.5 hover:border-leaf-300 hover:shadow-card"
                >
                  <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-leaf-50">
                    <ProductImage src={category.icon} alt="" className="h-full w-full" />
                  </span>
                  <span className="line-clamp-2 text-sm font-semibold group-hover:text-leaf-700">{category.name}</span>
                </a>
              </li>
            ))}
      </ul>
    </section>
  )
}

export const CategoryCarousel = withQuery(CategoryCarouselBase)
