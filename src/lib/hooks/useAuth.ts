import { useMutation } from "@tanstack/react-query"
import { authApi } from "../api/authapi"
import { useAuthStore } from "./useAuthStore"

// ── Login ──────────────────────────────────────────────────────
export const useLogin = () => {
  const { setUser, setAuthToken } = useAuthStore()

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),

    onSuccess: (res) => {
      const { user, token } = res.data.data
      setAuthToken(token)
      setUser(user)
      if (user.role === "THERAPIST") {
        localStorage.setItem("therapistAuthToken", token)
        localStorage.setItem("therapistUserId", user.id)
        localStorage.setItem(
          "isTherapistProfileFilled",
          String(user.isTherapistProfileFilled || false)
        )
      }
    }
  })
}

// ── Register ───────────────────────────────────────────────────
export const useRegister = () => {
  const { setAuthToken } = useAuthStore()

  return useMutation({
    mutationFn: (body: {
      firstName: string
      lastName: string
      email: string
      mobileNumber: string
      password: string
    }) => authApi.register(body),

    onSuccess: (res) => {
      const token = res.data.data?.signupToken || res.data.data?.token
      if (token) setAuthToken(token)
    }
  })
}

// ── Verify OTP (signup) ────────────────────────────────────────
export const useVerifyOtp = () => {
  const { setUser, setAuthToken } = useAuthStore()

  return useMutation({
    mutationFn: ({
      email,
      otp,
      extra,
      token
    }: {
      email: string
      otp: string
      extra?: Record<string, string>
      token?: string
    }) => authApi.verifyOtp(email, otp, extra, token),

    onSuccess: (res) => {
      const newToken = res.data.data?.token || res.data.data?.accessToken
      const userInfo = res.data.data?.user || res.data.data?.userInfo
      if (newToken) setAuthToken(newToken)
      if (userInfo) setUser(userInfo)
    }
  })
}

// ── Resend OTP ─────────────────────────────────────────────────
export const useResendOtp = () =>
  useMutation({
    mutationFn: (email: string) => authApi.resendOtp(email)
  })

// ── Forgot Password – Send OTP ─────────────────────────────────
export const useForgotPassword = () =>
  useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email)
  })

// ── Forgot Password – Verify OTP ──────────────────────────────
export const useVerifyForgotOtp = () =>
  useMutation({
    mutationFn: ({ email, otp }: { email: string; otp: string }) =>
      authApi.verifyForgotOtp(email, otp)
  })

// ── Reset Password ─────────────────────────────────────────────
export const useResetPassword = () =>
  useMutation({
    mutationFn: ({
      email,
      otp,
      newPassword,
      confirmPassword
    }: {
      email: string
      otp: string
      newPassword: string
      confirmPassword: string
    }) => authApi.resetPassword(email, otp, newPassword, confirmPassword)
  })