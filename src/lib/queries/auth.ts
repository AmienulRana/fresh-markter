import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProfilePayload, ResetPasswordPayload, SessionUser, SignInPayload, SignUpPayload } from '@/types/user'
import { api } from '@/lib/services'
import { parseResponse } from '@/lib/api/request'
import { setSession } from '@/stores/session'
import { queryKeys } from './keys'

async function postSession<T>(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return parseResponse<T>(response)
}

export function useSignIn() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: SignInPayload) => postSession<SessionUser>('/api/auth/signin', payload),
    onSuccess: (res) => {
      setSession(res.data)
      client.invalidateQueries({ queryKey: queryKeys.cart.all })
      client.invalidateQueries({ queryKey: queryKeys.profile })
    },
  })
}

export function useSignOut() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => postSession<null>('/api/auth/signout'),
    onSettled: () => {
      setSession(null)
      client.clear()
    },
  })
}

export async function refreshSession() {
  const res = await postSession<SessionUser>('/api/auth/refresh')
  setSession(res.data)
  return res.data
}

export function useSignUp() {
  return useMutation({ mutationFn: (payload: SignUpPayload) => api.auth.signUp(payload) })
}

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => api.auth.forgotPassword(email) })
}

export function useResetPassword() {
  return useMutation({ mutationFn: (payload: ResetPasswordPayload) => api.auth.resetPassword(payload) })
}

export function useVerifyAccount(token: string) {
  return useQuery({
    queryKey: ['verify-account', token],
    queryFn: () => api.auth.verifyAccount(token),
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  })
}

export function useProfile(enabled = true) {
  return useQuery({ queryKey: queryKeys.profile, queryFn: api.auth.profile, enabled })
}

export function useUpdateProfile() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: (payload: ProfilePayload) => api.auth.updateProfile(payload),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.profile })
      await refreshSession().catch(() => null)
    },
  })
}

export function useUploadProfilePhoto() {
  return useMutation({ mutationFn: (file: File) => api.uploads.profilePhoto(file) })
}

export function useUploadProductImage() {
  return useMutation({ mutationFn: (file: File) => api.uploads.productImage(file) })
}
