import axios from "axios"
import { useAuthStore } from "../hooks/useAuthStore"

const BASE_URL = process.env.PLASMO_PUBLIC_API_URL

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" }
})

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().authToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Auth API calls ─────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string, source?: string) =>
  apiClient.post("/auth/login", { email, password, ...(source && { source }) }),

 register: (body: {
  firstName: string
  lastName: string
  email: string
  mobileNumber: string
  password: string
  role?: string
  source?: string  
}) => apiClient.post("/auth/register", { ...body, role: "CLIENT" }),

  verifyOtp: (
    email: string,
    otp: string,
    extra?: Record<string, string>,
    token?: string
  ) =>
    apiClient.post(
      "/auth/verify-otp",
      { email, otp, ...extra },
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    ),

  resendOtp: (email: string) =>
    apiClient.post("/auth/resend-otp", { email }),

  forgotPassword: (email: string) =>
    apiClient.post("/auth/forgot-password", { email }),

  verifyForgotOtp: (email: string, otp: string) =>
    apiClient.post("/auth/verify-forgot-password-otp", { email, otp }),

  resetPassword: (
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string
  ) =>
    apiClient.post("/auth/reset-password", {
      email,
      otp,
      newPassword,
      confirmPassword
    })
}