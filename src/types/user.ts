export interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  lat?: string | number | null
  lng?: string | number | null
  photo?: string
  role?: string
  role_id?: number
}

export interface SessionUser {
  id: number
  name: string
  email: string
  role: string
  photo?: string
}

export interface SignInPayload {
  email: string
  password: string
}

export interface SignUpPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ResetPasswordPayload {
  password_new: string
  password_confirmation: string
  token: string
}

export interface ProfilePayload {
  name: string
  email: string
  phone: string
  address: string
  lat: string
  lng: string
  photo: string
}

export interface CustomerPayload {
  name: string
  email: string
  phone: string
  photo: string
  address: string
  lat: number
  lng: number
  role_id: number
  password?: string
  password_confirmation?: string
}

export interface Role {
  id: number
  name: string
}
