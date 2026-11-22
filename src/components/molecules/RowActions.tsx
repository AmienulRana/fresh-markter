import { Eye, Pencil, Trash } from 'lucide-react'

const base = 'flex h-8 w-8 items-center justify-center rounded-full transition-colors'

export function RowActions({
  viewHref,
  editHref,
  onDelete,
  label,
}: {
  viewHref?: string
  editHref?: string
  onDelete?: () => void
  label: string
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {viewHref ? (
        <a href={viewHref} aria-label={`Lihat ${label}`} className={`${base} text-ink-500 hover:bg-cream-100 hover:text-ink-900`}>
          <Eye className="h-4 w-4" />
        </a>
      ) : null}
      {editHref ? (
        <a href={editHref} aria-label={`Ubah ${label}`} className={`${base} text-ink-500 hover:bg-leaf-50 hover:text-leaf-700`}>
          <Pencil className="h-4 w-4" />
        </a>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Hapus ${label}`}
          className={`${base} text-ink-500 hover:bg-danger-50 hover:text-danger-600`}
        >
          <Trash className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  )
}
