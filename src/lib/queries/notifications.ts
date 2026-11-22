import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { NotificationParams } from '@/types/notification'
import { api } from '@/lib/services'
import { queryKeys } from './keys'

const READ_SAMPLE_SIZE = 50
const POLL_INTERVAL = 60_000

export function useNotifications(params: NotificationParams, enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => api.notifications.list(params),
    enabled,
    placeholderData: keepPreviousData,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  })
}

export function useUnreadNotifications(enabled = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: async () => {
      const [all, read] = await Promise.all([
        api.notifications.list({ page: 1, limit: 1 }),
        api.notifications.list({ page: 1, limit: READ_SAMPLE_SIZE, isRead: true }),
      ])
      return {
        count: Math.max(0, all.pagination.totalCount - read.pagination.totalCount),
        readIds: new Set(read.items.map((item) => item.id)),
      }
    },
    enabled,
    refetchInterval: enabled ? POLL_INTERVAL : false,
  })
}

export function useNotification(id: number | null) {
  const client = useQueryClient()
  return useQuery({
    queryKey: queryKeys.notifications.detail(id ?? ''),
    queryFn: async () => {
      await api.notifications.markAsRead(id as number)
      client.invalidateQueries({ queryKey: queryKeys.notifications.unread() })
      return api.notifications.detail(id as number)
    },
    enabled: id !== null,
    staleTime: Infinity,
  })
}

export function useMarkNotificationRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.notifications.markAsRead(id),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.notifications.all }),
  })
}
