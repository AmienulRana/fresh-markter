import { useStore } from '@nanostores/react'
import { CircleCheck, CircleX, Info, X } from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Modal } from '@/components/molecules/Modal'
import { cn } from '@/lib/utils'
import { $confirm, $toasts, dismissToast, settleConfirm } from '@/stores/feedback'

const ICONS = {
  success: <CircleCheck className="h-5 w-5 text-leaf-600" />,
  error: <CircleX className="h-5 w-5 text-danger-500" />,
  info: <Info className="h-5 w-5 text-info-500" />,
}

export function GlobalOverlays() {
  const toasts = useStore($toasts)
  const confirm = useStore($confirm)

  return (
    <>
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:top-4 sm:right-4 sm:bottom-auto sm:left-auto sm:items-end"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            role={item.tone === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-pop-in items-start gap-3 rounded-2xl border bg-white p-4 shadow-pop',
              item.tone === 'error' ? 'border-danger-500/20' : 'border-cream-200',
            )}
          >
            {ICONS[item.tone]}
            <div className="flex-1">
              <p className="text-sm font-bold">{item.title}</p>
              {item.description ? <p className="mt-0.5 text-sm text-ink-500">{item.description}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              aria-label="Tutup notifikasi"
              className="text-ink-500 hover:text-ink-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Modal
        open={Boolean(confirm)}
        onClose={() => settleConfirm(false)}
        title={confirm?.title}
        description={confirm?.description}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => settleConfirm(false)}>
              Batal
            </Button>
            <Button variant={confirm?.tone === 'danger' ? 'danger' : 'primary'} onClick={() => settleConfirm(true)}>
              {confirm?.confirmLabel ?? 'Ya, lanjutkan'}
            </Button>
          </>
        }
      />
    </>
  )
}
