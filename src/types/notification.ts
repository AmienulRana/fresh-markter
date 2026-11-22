import type { ListParams } from './api'

export interface NotificationListItem {
  id: number
  subject: string
  status: string
  sent_at?: string
}

export interface NotificationDetail extends NotificationListItem {
  message: string
  read_at?: string
  notification_type?: string
}

export interface NotificationParams extends ListParams {
  status?: string
  isRead?: boolean
}
