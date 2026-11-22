import { Badge, type BadgeTone } from '@/components/atoms/Badge'

const STATUS_MAP: Record<string, { tone: BadgeTone; label: string }> = {
  pending: { tone: 'warning', label: 'Menunggu' },
  processing: { tone: 'warning', label: 'Diproses' },
  process: { tone: 'info', label: 'Diproses' },
  confirmed: { tone: 'info', label: 'Dikonfirmasi' },
  sending: { tone: 'info', label: 'Dikirim' },
  done: { tone: 'success', label: 'Selesai' },
  completed: { tone: 'success', label: 'Selesai' },
  cancel: { tone: 'danger', label: 'Dibatalkan' },
  cancelled: { tone: 'danger', label: 'Dibatalkan' },
  active: { tone: 'success', label: 'Aktif' },
  inactive: { tone: 'danger', label: 'Nonaktif' },
  deactive: { tone: 'danger', label: 'Nonaktif' },
  draft: { tone: 'neutral', label: 'Draft' },
  success: { tone: 'success', label: 'Berhasil' },
  settlement: { tone: 'success', label: 'Berhasil' },
  failed: { tone: 'danger', label: 'Gagal' },
  expire: { tone: 'danger', label: 'Kedaluwarsa' },
  sent: { tone: 'info', label: 'Terkirim' },
  published: { tone: 'success', label: 'Tayang' },
  unpublished: { tone: 'neutral', label: 'Tidak tayang' },
}

export function StatusBadge({ status }: { status?: string | null }) {
  if (!status) return <Badge>-</Badge>
  const match = STATUS_MAP[status.toLowerCase()]
  return <Badge tone={match?.tone ?? 'neutral'}>{match?.label ?? status}</Badge>
}
