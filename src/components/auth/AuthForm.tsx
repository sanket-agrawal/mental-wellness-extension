import { useState } from "react"

import {
    Eye,
    EyeOff,
    Loader2,
    Mail,
    Lock,
    ArrowLeft,
    User,
    Phone
} from "lucide-react"
import { useAuthStore } from "~src/lib/hooks/useAuthStore"
import {
    useLogin,
    useRegister,
    useVerifyOtp,
    useResendOtp,
    useForgotPassword,
    useVerifyForgotOtp,
    useResetPassword
} from "~src/lib/hooks/useAuth"

type Mode = "login" | "signup" | "forgot-password"
type FPStep = "email" | "verify-otp" | "reset-password"
type SignupStep = "form" | "verify-otp"

interface Toast {
    id: number
    msg: string
    type: "success" | "error"
}

// ── Mini toast system ──────────────────────────────────────────
let toastId = 0
function useToast() {
    const [toasts, setToasts] = useState<Toast[]>([])
    const add = (msg: string, type: "success" | "error") => {
        const id = ++toastId
        setToasts((p) => [...p, { id, msg, type }])
        setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500)
    }
    return {
        toasts,
        success: (msg: string) => add(msg, "success"),
        error: (msg: string) => add(msg, "error")
    }
}

// ── Password strength checker ──────────────────────────────────
function checkPassword(p: string) {
    return {
        length: p.length >= 8 && p.length <= 15,
        upperLower: /[a-z]/.test(p) && /[A-Z]/.test(p),
        number: /\d/.test(p),
        special: /[!@#$%^&*]/.test(p)
    }
}

// ── Input component ────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    error?: string
    valid?: boolean
    icon?: React.ReactNode
    rightEl?: React.ReactNode
}
function Input({ label, error, valid, icon, rightEl, className = "", ...rest }: InputProps) {
    const borderClass = error
        ? "border-red-400 focus:ring-red-200"
        : valid
            ? "border-emerald-400 focus:ring-emerald-100"
            : "border-slate-200 focus:ring-cyan-100"
    return (
        <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300">
                        {icon}
                    </span>
                )}
                <input
                    className={`w-full ${icon ? "pl-9" : "pl-3"} ${rightEl ? "pr-10" : "pr-3"
                        } py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${borderClass} ${className}`}
                    {...rest}
                />
                {rightEl && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightEl}</span>
                )}
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    )
}

// ── Password input ─────────────────────────────────────────────
function PasswordInput({
    label,
    value,
    onChange,
    error,
    valid,
    placeholder = "••••••••"
}: {
    label: string
    value: string
    onChange: (v: string) => void
    error?: string
    valid?: boolean
    placeholder?: string
}) {
    const [show, setShow] = useState(false)
    return (
        <Input
            label={label}
            type={show ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            maxLength={15}
            error={error}
            valid={valid}
            icon={<Lock size={14} />}
            rightEl={
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
            }
        />
    )
}

// ── OTP Input ──────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <input
            type="text"
            value={value}
            maxLength={6}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
            className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-center tracking-[0.5em] text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 transition-all"
            placeholder="——————"
        />
    )
}

// ── Password strength bars ─────────────────────────────────────
function PasswordStrength({ checks }: { checks: ReturnType<typeof checkPassword> }) {
    const items = [
        { key: "length", label: "8–15 chars" },
        { key: "upperLower", label: "A–Z & a–z" },
        { key: "number", label: "0–9" },
        { key: "special", label: "!@#$%^&*" }
    ] as const
    const passed = Object.values(checks).filter(Boolean).length
    return (
        <div className="space-y-1.5">
            <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < passed
                            ? passed === 1
                                ? "bg-red-400"
                                : passed === 2
                                    ? "bg-orange-400"
                                    : passed === 3
                                        ? "bg-yellow-400"
                                        : "bg-emerald-400"
                            : "bg-slate-200"
                            }`}
                    />
                ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {items.map(({ key, label }) => (
                    <span
                        key={key}
                        className={`text-[10px] ${checks[key] ? "text-emerald-500" : "text-slate-400"
                            } flex items-center gap-0.5`}
                    >
                        <span>{checks[key] ? "✓" : "·"}</span> {label}
                    </span>
                ))}
            </div>
        </div>
    )
}

// ── Primary button ─────────────────────────────────────────────
function Btn({
    children,
    disabled,
    loading,
    onClick,
    type = "submit"
}: {
    children: React.ReactNode
    disabled?: boolean
    loading?: boolean
    onClick?: () => void
    type?: "submit" | "button"
}) {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className="w-full py-2.5 rounded-xl font-semibold text-sm text-white bg-[#0c3e6f]  hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md shadow-cyan-200/40"
        >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {children}
        </button>
    )
}

interface AuthFormProps {
    onSuccess?: () => void
}

// ── Main AuthForm ──────────────────────────────────────────────
export default function AuthForm({ onSuccess }: AuthFormProps) {
    const { setUser } = useAuthStore()
    const { toasts, success, error: toastError } = useToast()

    const [mode, setMode] = useState<Mode>("login")
    const [signupStep, setSignupStep] = useState<SignupStep>("form")
    const [fpStep, setFpStep] = useState<FPStep>("email")
    const [signupToken, setSignupToken] = useState("")
   const [googleLoading, setGoogleLoading] = useState(false)
    // Form fields
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [otp, setOtp] = useState("")

    // Forgot password fields
    const [fpEmail, setFpEmail] = useState("")
    const [fpOtp, setFpOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [resetConfirm, setResetConfirm] = useState("")

    // Field errors
    const [errors, setErrors] = useState<Record<string, string>>({})
    const pwChecks = checkPassword(password)
    const newPwChecks = checkPassword(newPassword)

    // Mutations
    const login = useLogin()
    const register = useRegister()
    const verifyOtp = useVerifyOtp()
    const resendOtp = useResendOtp()
    const forgotPw = useForgotPassword()
    const verifyFpOtp = useVerifyForgotOtp()
    const resetPw = useResetPassword()

    const loading =
        login.isPending ||
        register.isPending ||
        verifyOtp.isPending ||
        resendOtp.isPending ||
        forgotPw.isPending ||
        verifyFpOtp.isPending ||
        resetPw.isPending

    const handleGoogleLogin = async () => {
        setGoogleLoading(true)
        try {
            const clientId = process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID
            if (!clientId) {
                toastError("Google Client ID missing in .env")
                return
            }
 
            const redirectUri = chrome.identity.getRedirectURL()
 
            const nonce = Math.random().toString(36).substring(2)
 
            const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
            authUrl.searchParams.set("client_id", clientId)
            authUrl.searchParams.set("redirect_uri", redirectUri)
            authUrl.searchParams.set("response_type", "id_token")
            authUrl.searchParams.set("scope", "openid email profile")
            authUrl.searchParams.set("nonce", nonce)
            authUrl.searchParams.set("prompt", "select_account")
 
            // Opens Google account picker in a proper Chrome window (not blocked)
            const responseUrl = await new Promise<string>((resolve, reject) => {
                chrome.identity.launchWebAuthFlow(
                    { url: authUrl.toString(), interactive: true },
                    (callbackUrl) => {
                        if (chrome.runtime.lastError || !callbackUrl) {
                            reject(chrome.runtime.lastError?.message || "Auth flow failed")
                        } else {
                            resolve(callbackUrl)
                        }
                    }
                )
            })
 
            const hash = new URL(responseUrl).hash.substring(1)
            const params = new URLSearchParams(hash)
            const idToken = params.get("id_token")
 
            if (!idToken) {
                toastError("Failed to get ID token from Google")
                return
            }
 
            const res = await fetch(
                `${process.env.PLASMO_PUBLIC_NEW_API_URL}/api/v1/auth/google-signin`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken }) 
                }
            )
 
            const data = await res.json()
            if (!res.ok || !data.success) {
                toastError(data.message || "Google login failed")
                return
            }
 
            const { token, user } = data.data
            if (!token || !user) { toastError("Invalid server response"); return }
 
            setUser(user)
            await chrome.storage.local.set({ authToken: token, user })
            success("Google Login Successful! 🎉")
            onSuccess?.()
 
        } catch (err: any) {
            console.error("Google login error:", err)
            if (String(err).toLowerCase().includes("cancel") || String(err).toLowerCase().includes("user closed")) {
                toastError("Sign-in cancelled")
            } else {
                toastError("Google sign-in failed")
            }
        } finally {
            setGoogleLoading(false)
        }
    }

    // ── Validation helpers ──
    const validateField = (name: string, value: string) => {
        let msg = ""
        switch (name) {
            case "firstName":
            case "lastName":
                if (value.trim().length < 2) msg = "Min 2 characters"
                break
            case "email":
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) msg = "Enter valid email"
                break
            case "phone":
                if (!/^\d{10}$/.test(value)) msg = "Must be 10 digits"
                break
            case "confirmPassword":
                if (value !== password) msg = "Passwords do not match"
                break
        }
        setErrors((p) => ({ ...p, [name]: msg }))
    }

    const isSignupValid =
        firstName.trim().length >= 2 &&
        lastName.trim().length >= 2 &&
        /^\d{10}$/.test(phone) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
        Object.values(pwChecks).every(Boolean) &&
        password === confirmPassword

    // ── Switch mode – clear state ──
    const switchMode = (m: Mode) => {
        setMode(m)
        setErrors({})
        setPassword("")
        setConfirmPassword("")
        setOtp("")
    }

    // ── Login ──
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return toastError("Please fill all fields")
        try {
            const res = await login.mutateAsync({ email: email.trim().toLowerCase(), password })
            if (!res.data.success) {
                if (res.data.message === "User not found") {
                    toastError("Account not found. Please sign up.")
                    return switchMode("signup")
                }
                return toastError(res.data.message || "Login failed")
            }
            success("Welcome back! 🎉")
            onSuccess?.()
        } catch (err: any) {
            toastError(err?.response?.data?.message || "Login failed. Try again.")
        }
    }

    // ── Signup ──
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSignupValid) return toastError("Please complete all fields correctly")
        try {
            const res = await register.mutateAsync({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                mobileNumber: phone.trim(),
                password
            })
            if (!res.data.success) return toastError(res.data.message || "Signup failed")
            const token = res.data.data?.signupToken || res.data.data?.token
            if (token) setSignupToken(token)
            success("Account created! Check your email for OTP.")
            setSignupStep("verify-otp")
        } catch (err: any) {
            toastError(err?.response?.data?.message || "Signup failed. Try again.")
        }
    }

    // ── Verify signup OTP ──
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (otp.length !== 6) return toastError("Enter valid 6-digit OTP")
        try {
            const extra: Record<string, string> = {}
            if (firstName) extra.firstName = firstName.trim()
            if (lastName) extra.lastName = lastName.trim()
            if (phone) extra.mobileNumber = phone.trim()
            if (password) extra.password = password
            const res = await verifyOtp.mutateAsync({
                email: email.trim().toLowerCase(),
                otp,
                extra,
                token: signupToken
            })
            if (!res.data.success) return toastError(res.data.message || "Invalid OTP")
            success("Email verified! 🎉")
            onSuccess?.()
        } catch (err: any) {
            toastError(err?.response?.data?.message || "OTP verification failed.")
        }
    }

    // ── Resend OTP ──
    const handleResend = async () => {
        try {
            await resendOtp.mutateAsync(email.trim().toLowerCase())
            success("OTP resent to your email!")
        } catch {
            toastError("Failed to resend OTP")
        }
    }

    // ── FP: Send OTP ──
    const handleFpSendOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!fpEmail) return toastError("Enter your email")
        try {
            const res = await forgotPw.mutateAsync(fpEmail.trim().toLowerCase())
            if (!res.data.success) return toastError(res.data.message || "Failed to send OTP")
            success("OTP sent to your email!")
            setFpStep("verify-otp")
        } catch (err: any) {
            toastError(err?.response?.data?.message || "Failed to send OTP")
        }
    }

    // ── FP: Verify OTP ──
    const handleFpVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (fpOtp.length !== 6) return toastError("Enter valid 6-digit OTP")
        try {
            const res = await verifyFpOtp.mutateAsync({
                email: fpEmail.trim().toLowerCase(),
                otp: fpOtp
            })
            if (!res.data.success) return toastError(res.data.message || "Invalid OTP")
            success("OTP verified!")
            setFpStep("reset-password")
        } catch (err: any) {
            toastError(err?.response?.data?.message || "OTP verification failed")
        }
    }

    // ── FP: Reset password ──
    const handleResetPw = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || !resetConfirm) return toastError("Fill all fields")
        if (newPassword !== resetConfirm) return toastError("Passwords do not match")
        if (!Object.values(newPwChecks).every(Boolean))
            return toastError("Password does not meet requirements")
        try {
            const res = await resetPw.mutateAsync({
                email: fpEmail.trim().toLowerCase(),
                otp: fpOtp,
                newPassword,
                confirmPassword: resetConfirm
            })
            if (!res.data.success) return toastError(res.data.message || "Reset failed")
            success("Password reset! Please login.")
            setFpEmail(""); setFpOtp(""); setNewPassword(""); setResetConfirm("")
            setFpStep("email")
            switchMode("login")
        } catch (err: any) {
            toastError(err?.response?.data?.message || "Reset failed")
        }
    }

    const resetFp = () => {
        setFpEmail(""); setFpOtp(""); setNewPassword(""); setResetConfirm("")
        setFpStep("email")
        switchMode("login")
    }

    // ── Render ──
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                minHeight: "100%",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto"
            }}
            className="p-3"
        >
            {/* Brand header */}
            <div className="flex items-center gap-2 px-4 pt-5 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0c3e6f] to-[#16B7C2] flex items-center justify-center shadow">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                </div>
                <div>
                    <span className="text-sm font-bold text-[#0c3e6f]">Catalyst</span>
                    <span className="text-sm font-bold text-[#16B7C2]">Care</span>
                </div>
            </div>

            {/* Toast container */}
            <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-1.5 w-[340px] pointer-events-none">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={`px-3 py-2 rounded-xl text-xs font-medium shadow-lg text-white animate-fade-in ${t.type === "success" ? "bg-emerald-500" : "bg-red-500"}`}
                    >
                        {t.msg}
                    </div>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">

                {/* ── FORGOT PASSWORD FLOW ── */}
                {mode === "forgot-password" && (
                    <div className="space-y-4">
                        {fpStep === "email" && (
                            <form onSubmit={handleFpSendOtp} className="space-y-4">
                                <div className="text-center space-y-1">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 mx-auto flex items-center justify-center">
                                        <Mail size={22} className="text-[#16B7C2]" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-800">Forgot Password?</h2>
                                    <p className="text-xs text-slate-500">We'll send you a verification code</p>
                                </div>
                                <Input
                                    label="Email"
                                    type="email"
                                    value={fpEmail}
                                    onChange={(e) => setFpEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    icon={<Mail size={14} />}
                                    required
                                />
                                <Btn loading={loading}>Send OTP</Btn>
                                <button
                                    type="button"
                                    onClick={resetFp}
                                    className="w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft size={12} /> Back to Login
                                </button>
                            </form>
                        )}

                        {fpStep === "verify-otp" && (
                            <form onSubmit={handleFpVerifyOtp} className="space-y-4">
                                <div className="text-center space-y-1">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 mx-auto flex items-center justify-center">
                                        <Mail size={22} className="text-[#16B7C2]" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-800">Verify OTP</h2>
                                    <p className="text-xs text-slate-500">
                                        Code sent to <span className="font-semibold text-slate-700">{fpEmail}</span>
                                    </p>
                                </div>
                                <OtpInput value={fpOtp} onChange={setFpOtp} />
                                <Btn disabled={fpOtp.length !== 6} loading={loading}>Verify OTP</Btn>
                                <button
                                    type="button"
                                    onClick={() => setFpStep("email")}
                                    className="w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
                                >
                                    <ArrowLeft size={12} /> Change Email
                                </button>
                            </form>
                        )}

                        {fpStep === "reset-password" && (
                            <form onSubmit={handleResetPw} className="space-y-4">
                                <div className="text-center space-y-1">
                                    <div className="w-12 h-12 rounded-2xl bg-cyan-50 mx-auto flex items-center justify-center">
                                        <Lock size={22} className="text-[#16B7C2]" />
                                    </div>
                                    <h2 className="text-base font-bold text-slate-800">New Password</h2>
                                    <p className="text-xs text-slate-500">Make it strong & memorable</p>
                                </div>
                                <PasswordInput
                                    label="New Password"
                                    value={newPassword}
                                    onChange={setNewPassword}
                                    valid={Object.values(newPwChecks).every(Boolean)}
                                />
                                {newPassword && <PasswordStrength checks={newPwChecks} />}
                                <PasswordInput
                                    label="Confirm Password"
                                    value={resetConfirm}
                                    onChange={setResetConfirm}
                                    error={resetConfirm && resetConfirm !== newPassword ? "Doesn't match" : ""}
                                    valid={!!resetConfirm && resetConfirm === newPassword}
                                />
                                <Btn
                                    disabled={!newPassword || !resetConfirm || newPassword !== resetConfirm}
                                    loading={loading}
                                >
                                    Reset Password
                                </Btn>
                            </form>
                        )}
                    </div>
                )}

                {/* ── SIGNUP OTP VERIFY ── */}
                {mode !== "forgot-password" && signupStep === "verify-otp" && (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div className="text-center space-y-1">
                            <div className="w-12 h-12 rounded-2xl bg-cyan-50 mx-auto flex items-center justify-center">
                                <Mail size={22} className="text-[#16B7C2]" />
                            </div>
                            <h2 className="text-base font-bold text-slate-800">Verify Email</h2>
                            <p className="text-xs text-slate-500">
                                Code sent to <span className="font-semibold text-slate-700">{email}</span>
                            </p>
                        </div>
                        <OtpInput value={otp} onChange={setOtp} />
                        <Btn disabled={otp.length !== 6} loading={loading}>Verify Email</Btn>
                        <div className="flex flex-col items-center gap-1">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                className="text-xs text-[#16B7C2] hover:underline"
                            >
                                Resend OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSignupStep("form"); setOtp("") }}
                                className="text-xs text-slate-500 flex items-center gap-1"
                            >
                                <ArrowLeft size={12} /> Go back
                            </button>
                        </div>
                    </form>
                )}

                {/* ── LOGIN / SIGNUP FORM ── */}
                {mode !== "forgot-password" && signupStep === "form" && (
                    <>
                        {/* Tab switcher */}
                        <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                            {(["login", "signup"] as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => switchMode(m)}
                                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${mode === m
                                        ? "bg-white text-[#0c3e6f] shadow-sm"
                                        : "text-slate-400 hover:text-slate-600"
                                        }`}
                                >
                                    {m === "login" ? "Sign In" : "Sign Up"}
                                </button>
                            ))}
                        </div>

                        {/* ── GOOGLE BUTTON (clean, no hidden element trick) ── */}
                        <button
                            type="button"
                            onClick={() => handleGoogleLogin()}
                            disabled={googleLoading}
                            className="w-full flex items-center justify-center gap-2.5 py-2.5 mb-4 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 active:scale-[0.98] transition-all shadow-sm"
                        >
                            {/* Official Google colours on the G icon */}
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">or</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <form
                            onSubmit={mode === "login" ? handleLogin : handleSignup}
                            className="space-y-3"
                        >
                            {mode === "signup" && (
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        label="First Name"
                                        value={firstName}
                                        onChange={(e) => { setFirstName(e.target.value); validateField("firstName", e.target.value) }}
                                        placeholder="First"
                                        error={errors.firstName}
                                        valid={firstName.trim().length >= 2}
                                        icon={<User size={14} />}
                                    />
                                    <Input
                                        label="Last Name"
                                        value={lastName}
                                        onChange={(e) => { setLastName(e.target.value); validateField("lastName", e.target.value) }}
                                        placeholder="Last"
                                        error={errors.lastName}
                                        valid={lastName.trim().length >= 2}
                                        icon={<User size={14} />}
                                    />
                                </div>
                            )}

                            {mode === "signup" && (
                                <Input
                                    label="Phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => {
                                        const v = e.target.value.replace(/\D/g, "")
                                        setPhone(v)
                                        validateField("phone", v)
                                    }}
                                    maxLength={10}
                                    placeholder="10-digit number"
                                    error={errors.phone}
                                    valid={/^\d{10}$/.test(phone)}
                                    icon={<Phone size={14} />}
                                />
                            )}

                            <Input
                                label="Email"
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); validateField("email", e.target.value) }}
                                placeholder="you@example.com"
                                error={errors.email}
                                valid={/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                                icon={<Mail size={14} />}
                            />

                            <PasswordInput
                                label="Password"
                                value={password}
                                onChange={(v) => { setPassword(v); validateField("password", v) }}
                                error={errors.password}
                                valid={Object.values(pwChecks).every(Boolean)}
                            />

                            {mode === "signup" && password && (
                                <PasswordStrength checks={pwChecks} />
                            )}

                            {mode === "signup" && (
                                <PasswordInput
                                    label="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(v) => { setConfirmPassword(v); validateField("confirmPassword", v) }}
                                    error={errors.confirmPassword}
                                    valid={!!confirmPassword && confirmPassword === password}
                                />
                            )}

                            {mode === "login" && (
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={() => setMode("forgot-password")}
                                        className="text-xs text-[#16B7C2] hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>
                            )}

                            <Btn
                                disabled={mode === "signup" && !isSignupValid}
                                loading={loading}
                            >
                                {mode === "login" ? "Sign In" : "Create Account"}
                            </Btn>
                        </form>
                    </>
                )}
            </div>
        </div>
    )
}