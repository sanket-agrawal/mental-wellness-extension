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
function Input({ label, error, valid, icon, rightEl, style, ...rest }: InputProps) {
    const borderColor = error ? "#f87171" : valid ? "#34d399" : "#e2e8f0"
    const focusRingColor = error ? "#fecaca" : valid ? "#d1fae5" : "#cffafe"

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <label
                style={{
                    display: "block",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#64748b",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                }}
            >
                {label}
            </label>
            <div style={{ position: "relative" }}>
                {icon && (
                    <span
                        style={{
                            position: "absolute",
                            left: "12px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            color: "#cbd5e1",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        {icon}
                    </span>
                )}
                <input
                    style={{
                        width: "100%",
                        paddingLeft: icon ? "36px" : "12px",
                        paddingRight: rightEl ? "40px" : "12px",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        backgroundColor: "#f8fafc",
                        border: `1px solid ${borderColor}`,
                        borderRadius: "12px",
                        fontSize: "14px",
                        color: "#1e293b",
                        outline: "none",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                        ...style
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.boxShadow = `0 0 0 2px ${focusRingColor}`
                        e.currentTarget.style.borderColor = borderColor
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.boxShadow = "none"
                    }}
                    {...rest}
                />
                {rightEl && (
                    <span
                        style={{
                            position: "absolute",
                            right: "12px",
                            top: "50%",
                            transform: "translateY(-50%)"
                        }}
                    >
                        {rightEl}
                    </span>
                )}
            </div>
            {error && (
                <p style={{ fontSize: "12px", color: "#ef4444", margin: 0 }}>{error}</p>
            )}
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
                    style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#94a3b8",
                        display: "flex",
                        alignItems: "center",
                        padding: 0,
                        transition: "color 0.2s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#475569")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
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
            style={{
                width: "100%",
                padding: "16px",
                backgroundColor: "#f8fafc",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                textAlign: "center",
                letterSpacing: "0.5em",
                fontSize: "24px",
                fontWeight: 700,
                color: "#1e293b",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s, box-shadow 0.2s"
            }}
            placeholder="——————"
            onFocus={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 2px #a5f3fc"
                e.currentTarget.style.borderColor = "#22d3ee"
            }}
            onBlur={(e) => {
                e.currentTarget.style.boxShadow = "none"
                e.currentTarget.style.borderColor = "#e2e8f0"
            }}
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
    const barColor =
        passed === 1 ? "#f87171" :
        passed === 2 ? "#fb923c" :
        passed === 3 ? "#facc15" :
        "#34d399"

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ display: "flex", gap: "4px" }}>
                {[0, 1, 2, 3].map((i) => (
                    <div
                        key={i}
                        style={{
                            height: "4px",
                            flex: 1,
                            borderRadius: "999px",
                            backgroundColor: i < passed ? barColor : "#e2e8f0",
                            transition: "background-color 0.3s"
                        }}
                    />
                ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                {items.map(({ key, label }) => (
                    <span
                        key={key}
                        style={{
                            fontSize: "10px",
                            color: checks[key] ? "#10b981" : "#94a3b8",
                            display: "flex",
                            alignItems: "center",
                            gap: "2px"
                        }}
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
    const isDisabled = disabled || loading
    return (
        <button
            type={type}
            disabled={isDisabled}
            onClick={onClick}
            style={{
                width: "100%",
                paddingTop: "10px",
                paddingBottom: "10px",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "14px",
                color: "#ffffff",
                backgroundColor: "#0c3e6f",
                border: "none",
                cursor: isDisabled ? "not-allowed" : "pointer",
                opacity: isDisabled ? 0.4 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(34,211,238,0.25)",
                transition: "opacity 0.2s, transform 0.1s"
            }}
            onMouseEnter={(e) => {
                if (!isDisabled) e.currentTarget.style.opacity = "0.9"
            }}
            onMouseLeave={(e) => {
                if (!isDisabled) e.currentTarget.style.opacity = "1"
            }}
            onMouseDown={(e) => {
                if (!isDisabled) e.currentTarget.style.transform = "scale(0.98)"
            }}
            onMouseUp={(e) => {
                if (!isDisabled) e.currentTarget.style.transform = "scale(1)"
            }}
        >
            {loading && (
                <span style={{ display: "flex", alignItems: "center", animation: "spin 1s linear infinite" }}>
                    <Loader2 size={15} />
                </span>
            )}
            {children}
        </button>
    )
}

interface AuthFormProps {
    onSuccess?: () => void
}

// ── Main AuthForm ──────────────────────────────────────────────
export default function AuthFormWidget({ onSuccess }: AuthFormProps) {
    const { setUser, setAuthToken } = useAuthStore()
    const { toasts, success, error: toastError } = useToast()

    const [mode, setMode] = useState<Mode>("login")
    const [signupStep, setSignupStep] = useState<SignupStep>("form")
    const [fpStep, setFpStep] = useState<FPStep>("email")
    const [signupToken, setSignupToken] = useState("")
    const [googleLoading, setGoogleLoading] = useState(false)

    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [otp, setOtp] = useState("")

    const [fpEmail, setFpEmail] = useState("")
    const [fpOtp, setFpOtp] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [resetConfirm, setResetConfirm] = useState("")

    const [errors, setErrors] = useState<Record<string, string>>({})
    const pwChecks = checkPassword(password)
    const newPwChecks = checkPassword(newPassword)

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
            if (!clientId) { toastError("Google Client ID missing in .env"); return }
            const redirectUri = chrome.identity.getRedirectURL()
            const nonce = Math.random().toString(36).substring(2)
            const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
            authUrl.searchParams.set("client_id", clientId)
            authUrl.searchParams.set("redirect_uri", redirectUri)
            authUrl.searchParams.set("response_type", "id_token")
            authUrl.searchParams.set("scope", "openid email profile")
            authUrl.searchParams.set("nonce", nonce)
            authUrl.searchParams.set("prompt", "select_account")
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
            if (!idToken) { toastError("Failed to get ID token from Google"); return }
            const res = await fetch(
                `${process.env.PLASMO_PUBLIC_API_URL}/api/v1/auth/google-signin`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idToken,source: "EXTENSION" })
                }
            )
            const data = await res.json()
            if (!res.ok || !data.success) { toastError(data.message || "Google login failed"); return }
            const { token, user } = data.data
            if (!token || !user) { toastError("Invalid server response"); return }
            setUser(user)
            setAuthToken(token)
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

    const switchMode = (m: Mode) => {
        setMode(m)
        setErrors({})
        setPassword("")
        setConfirmPassword("")
        setOtp("")
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!email || !password) return toastError("Please fill all fields")
        try {
            const res = await login.mutateAsync({ email: email.trim().toLowerCase(), password,source: "EXTENSION" })
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

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isSignupValid) return toastError("Please complete all fields correctly")
        try {
            const res = await register.mutateAsync({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim().toLowerCase(),
                mobileNumber: phone.trim(),
                password,
                source: "EXTENSION"
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

    const handleResend = async () => {
        try {
            await resendOtp.mutateAsync(email.trim().toLowerCase())
            success("OTP resent to your email!")
        } catch {
            toastError("Failed to resend OTP")
        }
    }

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

    const handleFpVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        if (fpOtp.length !== 6) return toastError("Enter valid 6-digit OTP")
        try {
            const res = await verifyFpOtp.mutateAsync({ email: fpEmail.trim().toLowerCase(), otp: fpOtp })
            if (!res.data.success) return toastError(res.data.message || "Invalid OTP")
            success("OTP verified!")
            setFpStep("reset-password")
        } catch (err: any) {
            toastError(err?.response?.data?.message || "OTP verification failed")
        }
    }

    const handleResetPw = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword || !resetConfirm) return toastError("Fill all fields")
        if (newPassword !== resetConfirm) return toastError("Passwords do not match")
        if (!Object.values(newPwChecks).every(Boolean)) return toastError("Password does not meet requirements")
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
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                zIndex: 9999,
                boxSizing: "border-box"
            }}
        >
            {/* Spinner keyframes injected once */}
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {/* Brand header */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "20px 16px 12px",
                    borderBottom: "1px solid #f1f5f9"
                }}
            >

                <div>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#0c3e6f" }}>Catalyst</span>
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "#16B7C2" }}>Care</span>
                </div>
            </div>

            {/* Toast container */}
            <div
                style={{
                    position: "fixed",
                    top: "8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    width: "340px",
                    pointerEvents: "none"
                }}
            >
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        style={{
                            padding: "8px 12px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 500,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            color: "#ffffff",
                            backgroundColor: t.type === "success" ? "#10b981" : "#ef4444"
                        }}
                    >
                        {t.msg}
                    </div>
                ))}
            </div>

            <div
                style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    overflowY: "auto",
                    padding: "32px 16px"
                }}
            >
                <div style={{ width: "100%", maxWidth: "420px" }}>

                {/* ── FORGOT PASSWORD FLOW ── */}
                {mode === "forgot-password" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {fpStep === "email" && (
                            <form onSubmit={handleFpSendOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "16px",
                                            backgroundColor: "#ecfeff",
                                            margin: "0 auto",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <Mail size={22} style={{ color: "#16B7C2" }} />
                                    </div>
                                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Forgot Password?</h2>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>We'll send you a verification code</p>
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
                                    style={{
                                        width: "100%",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px"
                                    }}
                                >
                                    <ArrowLeft size={12} /> Back to Login
                                </button>
                            </form>
                        )}

                        {fpStep === "verify-otp" && (
                            <form onSubmit={handleFpVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "16px",
                                            backgroundColor: "#ecfeff",
                                            margin: "0 auto",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <Mail size={22} style={{ color: "#16B7C2" }} />
                                    </div>
                                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Verify OTP</h2>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                                        Code sent to <span style={{ fontWeight: 600, color: "#334155" }}>{fpEmail}</span>
                                    </p>
                                </div>
                                <OtpInput value={fpOtp} onChange={setFpOtp} />
                                <Btn disabled={fpOtp.length !== 6} loading={loading}>Verify OTP</Btn>
                                <button
                                    type="button"
                                    onClick={() => setFpStep("email")}
                                    style={{
                                        width: "100%",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        color: "#64748b",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "4px"
                                    }}
                                >
                                    <ArrowLeft size={12} /> Change Email
                                </button>
                            </form>
                        )}

                        {fpStep === "reset-password" && (
                            <form onSubmit={handleResetPw} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                                    <div
                                        style={{
                                            width: "48px",
                                            height: "48px",
                                            borderRadius: "16px",
                                            backgroundColor: "#ecfeff",
                                            margin: "0 auto",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        <Lock size={22} style={{ color: "#16B7C2" }} />
                                    </div>
                                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>New Password</h2>
                                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>Make it strong & memorable</p>
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
                    <form onSubmit={handleVerifyOtp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div
                                style={{
                                    width: "48px",
                                    height: "48px",
                                    borderRadius: "16px",
                                    backgroundColor: "#ecfeff",
                                    margin: "0 auto",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}
                            >
                                <Mail size={22} style={{ color: "#16B7C2" }} />
                            </div>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#1e293b", margin: 0 }}>Verify Email</h2>
                            <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>
                                Code sent to <span style={{ fontWeight: 600, color: "#334155" }}>{email}</span>
                            </p>
                        </div>
                        <OtpInput value={otp} onChange={setOtp} />
                        <Btn disabled={otp.length !== 6} loading={loading}>Verify Email</Btn>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={loading}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    fontSize: "12px",
                                    color: "#16B7C2",
                                    textDecoration: "underline"
                                }}
                            >
                                Resend OTP
                            </button>
                            <button
                                type="button"
                                onClick={() => { setSignupStep("form"); setOtp("") }}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "12px",
                                    color: "#64748b",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}
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
                        <div
                            style={{
                                display: "flex",
                                backgroundColor: "#f1f5f9",
                                borderRadius: "12px",
                                padding: "4px",
                                marginBottom: "16px"
                            }}
                        >
                            {(["login", "signup"] as Mode[]).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    onClick={() => switchMode(m)}
                                    style={{
                                        flex: 1,
                                        paddingTop: "8px",
                                        paddingBottom: "8px",
                                        borderRadius: "8px",
                                        fontSize: "12px",
                                        fontWeight: 600,
                                        border: "none",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                        backgroundColor: mode === m ? "#ffffff" : "transparent",
                                        color: mode === m ? "#0c3e6f" : "#94a3b8",
                                        boxShadow: mode === m ? "0 1px 3px rgba(0,0,0,0.1)" : "none"
                                    }}
                                >
                                    {m === "login" ? "Sign In" : "Sign Up"}
                                </button>
                            ))}
                        </div>

                        {/* Google button */}
                        <button
                            type="button"
                            onClick={() => handleGoogleLogin()}
                            disabled={googleLoading}
                            style={{
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px",
                                paddingTop: "10px",
                                paddingBottom: "10px",
                                marginBottom: "16px",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                fontSize: "14px",
                                fontWeight: 600,
                                color: "#334155",
                                backgroundColor: "#ffffff",
                                cursor: googleLoading ? "not-allowed" : "pointer",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                transition: "background-color 0.2s, transform 0.1s",
                                opacity: googleLoading ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => { if (!googleLoading) e.currentTarget.style.backgroundColor = "#f8fafc" }}
                            onMouseLeave={(e) => { if (!googleLoading) e.currentTarget.style.backgroundColor = "#ffffff" }}
                            onMouseDown={(e) => { if (!googleLoading) e.currentTarget.style.transform = "scale(0.98)" }}
                            onMouseUp={(e) => { if (!googleLoading) e.currentTarget.style.transform = "scale(1)" }}
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48">
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                            </svg>
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: "16px"
                            }}
                        >
                            <div style={{ flex: 1, height: "1px", backgroundColor: "#f1f5f9" }} />
                            <span
                                style={{
                                    fontSize: "10px",
                                    color: "#94a3b8",
                                    fontWeight: 500,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em"
                                }}
                            >
                                or
                            </span>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "#f1f5f9" }} />
                        </div>

                        <form
                            onSubmit={mode === "login" ? handleLogin : handleSignup}
                            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                        >
                            {mode === "signup" && (
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
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
                                <div style={{ textAlign: "right" }}>
                                    <button
                                        type="button"
                                        onClick={() => setMode("forgot-password")}
                                        style={{
                                            background: "none",
                                            border: "none",
                                            cursor: "pointer",
                                            fontSize: "12px",
                                            color: "#16B7C2",
                                            textDecoration: "underline"
                                        }}
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
        </div>
    )
}