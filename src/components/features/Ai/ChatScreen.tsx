import { useState, useRef, useEffect } from "react"
import { TopBar } from "~src/contents/widget"
import { useAuthStore } from "~src/lib/hooks/useAuthStore"
import { useIsAuthenticated } from "~src/lib/hooks/Useisauthenticated"
import cc from "../../../assets/logo.svg"

const QUICK_PROMPTS = ["I'm overwhelmed", "Can't stop thinking", "I feel alone", "I'm anxious"]

const VENT_API_URL = `${process.env.PLASMO_PUBLIC_API_URL}/api/v1/ai/vent/text/message`

// ─── Typing Dots ─────────────────────────────────────────────────────────────
const TypingDots = () => (
  <span style={{ display: "inline-flex", gap: 4, alignItems: "center", height: 14 }}>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "#16B7C2",
          opacity: 0.5,
          animation: `typingPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes typingPulse {
        0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
        40% { opacity: 1; transform: scale(1); }
      }
      @keyframes fadeSlideIn {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes promptIn {
        from { opacity: 0; transform: translateY(6px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `}</style>
  </span>
)

// ─── Quick Prompt Button ──────────────────────────────────────────────────────
const QuickPromptBtn = ({
  label,
  onClick,
  delay = 0,
}: {
  label: string
  onClick: () => void
  delay?: number
}) => {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontSize: 11.5,
        fontWeight: 500,
        letterSpacing: "0.01em",
        padding: "6px 13px",
        borderRadius: 20,
        border: `1px solid ${hover ? "#16B7C2" : "rgba(12,62,111,0.16)"}`,
        background: hover ? "rgba(22,183,194,0.07)" : "rgba(255,255,255,0.85)",
        color: hover ? "#0c3e6f" : "#3a6390",
        cursor: "pointer",
        transition: "all 0.18s ease",
        backdropFilter: "blur(4px)",
        animation: `promptIn 0.35s ease both`,
        animationDelay: `${delay}ms`,
        fontFamily: "inherit",
        outline: "none",
      }}
    >
      {label}
    </button>
  )
}

// ─── Send Button ──────────────────────────────────────────────────────────────
const SendBtn = ({
  onClick,
  disabled,
}: {
  onClick: () => void
  disabled: boolean
}) => {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label="Send message"
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        border: "none",
        background: disabled
          ? "rgba(22,183,194,0.3)"
          : hover
          ? "#0fa8b8"
          : "#16B7C2",
        color: "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        transition: "all 0.18s ease",
        transform: hover && !disabled ? "scale(1.04)" : "scale(1)",
        boxShadow: hover && !disabled
          ? "0 4px 12px rgba(22,183,194,0.35)"
          : "none",
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </button>
  )
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
const MessageBubble = ({
  msg,
  index,
}: {
  msg: { id: string; role: string; text: string }
  index: number
}) => {
  const isAi = msg.role === "ai"
  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAi ? "flex-start" : "flex-end",
        gap: 9,
        animation: "fadeSlideIn 0.28s ease both",
        animationDelay: `${Math.min(index * 30, 200)}ms`,
      }}
    >
      {isAi && (
        <div
          style={{
            width: 28,
            height: 28,
            flexShrink: 0,
            marginTop: 2,
            borderRadius: 8,
            background: "rgba(22,183,194,0.08)",
            border: "1px solid rgba(22,183,194,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={cc} alt="companion" style={{ width: 18, height: 18 }} />
        </div>
      )}
      <div
        style={{
          maxWidth: "78%",
          fontSize: 12.5,
          lineHeight: 1.75,
          fontWeight: isAi ? 350 : 400,
          padding: "10px 14px",
          borderRadius: isAi ? "3px 14px 14px 14px" : "14px 3px 14px 14px",
          background: isAi
            ? "rgba(255,255,255,0.9)"
            : "linear-gradient(135deg, #0e4a80 0%, #0c3e6f 100%)",
          color: isAi ? "#1a3d5c" : "#f0f8ff",
          border: isAi ? "1px solid rgba(12,62,111,0.09)" : "none",
          boxShadow: isAi
            ? "0 1px 6px rgba(12,62,111,0.06)"
            : "0 2px 10px rgba(12,62,111,0.25)",
          letterSpacing: "0.005em",
        }}
      >
        {msg.text}
      </div>
    </div>
  )
}

// ─── Auth Fallback ────────────────────────────────────────────────────────────
const UnauthenticatedFallback = ({ onBack }: { onBack: () => void }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "72vh",
      minHeight: 480,
      gap: 16,
      background: "linear-gradient(160deg, #f0f7ff 0%, #f8fbff 40%, #eef8f9 100%)",
      padding: 2,
    }}
  >
    <div
      style={{
        width: 52,
        height: 52,
        borderRadius: 16,
        background: "rgba(22,183,194,0.08)",
        border: "1px solid rgba(22,183,194,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16B7C2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
    <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 6 }}>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#0c3e6f", letterSpacing: "0.01em" }}>
        Session Expired
      </p>
      <p style={{ fontSize: 12, color: "#3a6390", lineHeight: 1.6, maxWidth: 220 }}>
        You need to be signed in to access your companion.
      </p>
    </div>
    <button
      onClick={onBack}
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "8px 20px",
        borderRadius: 20,
        border: "1px solid rgba(22,183,194,0.4)",
        background: "rgba(22,183,194,0.07)",
        color: "#0c3e6f",
        cursor: "pointer",
        fontFamily: "inherit",
        letterSpacing: "0.01em",
      }}
    >
      Go Back
    </button>
  </div>
)

// ─── Protected ChatScreen ─────────────────────────────────────────────────────
const ChatScreenInner = ({ onBack, authToken }: { onBack: () => void; authToken: string }) => {
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "ai",
      text: "Hey, I'm here with you. This is a safe, private space — no judgment, no rush. What's been on your mind?",
    },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [showPrompts, setShowPrompts] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionId = useRef<string>(crypto.randomUUID())

  const scrollBottom = () =>
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 96) + "px"
    }
  }, [input])

  const fetchAIReply = async (message: string): Promise<string> => {
    const response = await fetch(VENT_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message, sessionId: sessionId.current }),
    })
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    const json = await response.json()
    if (!json.success || !json.data?.reply) throw new Error("Invalid response from server")
    return json.data.reply as string
  }

  const send = async (text: string) => {
    if (!text.trim() || typing) return
    setMessages((p) => [...p, { id: Date.now() + "u", role: "user", text: text.trim() }])
    setInput("")
    setShowPrompts(false)
    setTyping(true)
    setError(null)
    scrollBottom()
    try {
      const reply = await fetchAIReply(text.trim())
      setMessages((p) => [...p, { id: Date.now() + "a", role: "ai", text: reply }])
    } catch (err) {
      console.error("Vent API error:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setTyping(false)
      scrollBottom()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "72vh",
        minHeight: 480,
        background: "linear-gradient(160deg, #f0f7ff 0%, #f8fbff 40%, #eef8f9 100%)",
        position: "relative",
        overflow: "hidden",
        padding: 2,
      }}
    >
      {/* Subtle bg decoration */}
      <div
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(22,183,194,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: -40,
          width: 160,
          height: 160,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(12,62,111,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* TopBar */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <TopBar title="Your Companion" onBack={onBack} />
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(12,62,111,0.08) 30%, rgba(22,183,194,0.15) 50%, rgba(12,62,111,0.08) 70%, transparent)",
          flexShrink: 0,
        }}
      />

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 16px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative",
          zIndex: 1,
          scrollbarWidth: "none",
        }}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id} msg={msg} index={i} />
        ))}

        {/* Typing indicator */}
        {typing && (
          <div
            style={{
              display: "flex",
              gap: 9,
              alignItems: "flex-start",
              animation: "fadeSlideIn 0.25s ease both",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                flexShrink: 0,
                marginTop: 2,
                borderRadius: 8,
                background: "rgba(22,183,194,0.08)",
                border: "1px solid rgba(22,183,194,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={cc} alt="companion" style={{ width: 18, height: 18 }} />
            </div>
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "3px 14px 14px 14px",
                background: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(12,62,111,0.09)",
                boxShadow: "0 1px 6px rgba(12,62,111,0.06)",
              }}
            >
              <TypingDots />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div
            style={{
              alignSelf: "center",
              fontSize: 11.5,
              color: "#c0392b",
              background: "rgba(255,240,238,0.95)",
              border: "1px solid rgba(192,57,43,0.14)",
              borderRadius: 10,
              padding: "7px 14px",
              animation: "fadeSlideIn 0.25s ease both",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      {showPrompts && (
        <div
          style={{
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
            padding: "4px 16px 12px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {QUICK_PROMPTS.map((p, i) => (
            <QuickPromptBtn
              key={p}
              label={p}
              delay={i * 60}
              onClick={() => void send(p)}
            />
          ))}
        </div>
      )}

      {/* Input area */}
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-end",
          padding: "10px 14px 16px",
          background: "rgba(248,251,255,0.95)",
          backdropFilter: "blur(8px)",
          borderTop: "1px solid rgba(12,62,111,0.07)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              void send(input)
            }
          }}
          placeholder="Share what's on your mind…"
          rows={1}
          disabled={typing}
          style={{
            flex: 1,
            fontSize: 12.5,
            fontWeight: 350,
            lineHeight: 1.65,
            letterSpacing: "0.005em",
            padding: "9px 13px",
            borderRadius: 13,
            resize: "none",
            outline: "none",
            border: "1px solid rgba(12,62,111,0.12)",
            background: typing
              ? "rgba(248,251,255,0.7)"
              : "rgba(255,255,255,0.95)",
            color: "#0c3e6f",
            fontFamily: "inherit",
            opacity: typing ? 0.65 : 1,
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
            boxShadow: "0 1px 4px rgba(12,62,111,0.05)",
            overflow: "hidden",
            maxHeight: 96,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "rgba(22,183,194,0.5)"
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(22,183,194,0.1)"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "rgba(12,62,111,0.12)"
            e.currentTarget.style.boxShadow = "0 1px 4px rgba(12,62,111,0.05)"
          }}
        />
        <SendBtn onClick={() => void send(input)} disabled={typing || !input.trim()} />
      </div>
    </div>
  )
}
// ─── Exported Protected Wrapper ───────────────────────────────────────────────
export const ChatScreen = ({ onBack }: { onBack: () => void }) => {
  const isAuthenticated = useIsAuthenticated()
  const authToken = useAuthStore((s) => s.authToken)

  if (!isAuthenticated) return <UnauthenticatedFallback onBack={onBack} />

  return <ChatScreenInner onBack={onBack} authToken={authToken!} />
}