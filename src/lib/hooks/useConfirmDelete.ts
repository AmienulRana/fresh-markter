import { getErrorMessage } from '@/lib/api/errors'
import { confirmAction, toast } from '@/stores/feedback'

export function useConfirmDelete<T>(remove: (id: T) => Promise<unknown>, entity: string) {
  return async function confirmDelete(id: T, name: string) {
    const ok = await confirmAction({
      title: `Hapus ${entity}?`,
      description: `“${name}” akan dihapus permanen dan tidak bisa dikembalikan.`,
      confirmLabel: 'Hapus',
      tone: 'danger',
    })
    if (!ok) return
    try {
      await remove(id)
      toast.success(`${entity.charAt(0).toUpperCase()}${entity.slice(1)} berhasil dihapus`)
    } catch (error) {
      toast.error(`Gagal menghapus ${entity}`, getErrorMessage(error))
    }
  }
}
