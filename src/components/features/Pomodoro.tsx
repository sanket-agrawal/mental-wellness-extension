import { useState, useEffect, useRef } from "react"
import { pomoTimer, LABELS, type PomodoroMode, type PomoState } from "~src/lib/helpers/pomodoroTimer"

// ─── Format mm:ss ─────────────────────────────────────────────────────────────
function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sc = s % 60
  return String(m).padStart(2, "0") + ":" + String(sc).padStart(2, "0")
}

const CIRC = 2 * Math.PI * 88

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ message, sub, visible }: { message: string; sub?: string; visible: boolean }) {
  return (
    <div style={{
      position: "absolute", top: 58, left: "50%",
      transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)`,
      opacity: visible ? 1 : 0,
      transition: "all .35s cubic-bezier(.34,1.56,.64,1)",
      zIndex: 100, pointerEvents: "none",
      background: "linear-gradient(135deg, #0c3e6f 0%, #0a5080 100%)",
      borderRadius: 12, padding: "8px 18px",
      boxShadow: "0 8px 28px rgba(12,62,111,.32)",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 2, minWidth: 200, textAlign: "center",
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>
        {message}
      </span>
      {sub && (
        <span style={{ fontSize: 10.5, color: "rgba(22,183,194,.9)", fontWeight: 400 }}>
          {sub}
        </span>
      )}
    </div>
  )
}

// ─── Icon Button ─────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, children }: { onClick: () => void; title?: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 44, height: 44, borderRadius: "50%",
        border: "1.5px solid rgba(12,62,111,.14)",
        background: "rgba(255,255,255,.88)", cursor: "pointer",
        fontSize: 17, color: "#6a8fab",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all .2s ease",
        boxShadow: "0 2px 8px rgba(12,62,111,.08)", outline: "none",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "#fff"
        e.currentTarget.style.color = "#0c3e6f"
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(12,62,111,.18)"
        e.currentTarget.style.borderColor = "rgba(12,62,111,.28)"
        e.currentTarget.style.transform = "scale(1.06)"
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,.88)"
        e.currentTarget.style.color = "#6a8fab"
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(12,62,111,.08)"
        e.currentTarget.style.borderColor = "rgba(12,62,111,.14)"
        e.currentTarget.style.transform = "scale(1)"
      }}
    >
      {children}
    </button>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT  — reads from global singleton, no local timer logic
// ══════════════════════════════════════════════════════════════════════════════
export function PomodoroScreen({
  onBack,
  onMinimize,
}: {
  onBack: () => void
  onMinimize?: () => void
}) {
  const [pomo, setPomo] = useState<PomoState>(pomoTimer.getState)
  const [customVal, setCustomVal] = useState("")
  const [toast, setToast] = useState<{ message: string; sub?: string } | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Subscribe to global timer — unsubscribe on unmount, timer keeps running
  useEffect(() => {
    const unsub = pomoTimer.subscribe(setPomo)
    return unsub
  }, [])

  useEffect(() => {
    pomoTimer.requestNotificationPermission()
  }, [])

  // Listen for toast events fired by the global timer (works even when minimized)
  useEffect(() => {
    const handler = (e: Event) => {
      const { message, sub } = (e as CustomEvent<{ message: string; sub?: string }>).detail
      showToast(message, sub)
    }
    window.addEventListener("cc:pomo-toast", handler)
    return () => window.removeEventListener("cc:pomo-toast", handler)
  }, [])

  function showToast(message: string, sub?: string) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, sub })
    setToastVisible(true)
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 400)
    }, 3500)
  }

  function applyCustom() {
    const v = parseInt(customVal)
    if (!v || v < 1 || v > 99) return
    pomoTimer.setCustom(pomo.mode, v)
    setCustomVal("")
  }

  const { mode, timeLeft, total, running, sessions, customMins } = pomo
  const progress = total > 0 ? (total - timeLeft) / total : 0
  const ringColor = mode === "focus" ? "#0c3e6f" : mode === "short" ? "#16B7C2" : "#0a7080"
  const dots = Array.from({ length: 4 }, (_, i) => i < sessions % 4)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>

      {toast && <Toast message={toast.message} sub={toast.sub} visible={toastVisible} />}

      {/* Header */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "18px 20px 14px",
          borderBottom: "1px solid rgba(12,62,111,.08)",
          flexShrink: 0,
        }}
      >
        {/* Center Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "#0c3e6f",
            }}
          >
            Focus Timer
          </span>

          {running && (
            <span
              style={{
                fontSize: 9,
                color: "#16B7C2",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              {mode === "focus" ? "● Focusing" : "● On Break"}
            </span>
          )}
        </div>

        {/* Right Button */}
        <button
          onClick={onMinimize}
          title="Minimize — timer keeps running"
          style={{
            position: "absolute",
            right: 20,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#6a8fab",
            padding: "4px 8px",
            borderRadius: 6,
            lineHeight: 1,
            transition: "color .18s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#16B7C2")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#6a8fab")}
        >
          ⌃
        </button>
      </div>

      {/* Body */}
      <div style={{
        flex: 1, overflowY: "auto",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "16px 24px 28px",
      }}>

        {/* Mode tabs */}
        <div style={{ display: "flex", borderRadius: 10, padding: 3, background: "rgba(12,62,111,.07)", marginBottom: 26 }}>
          {(["focus", "short", "long"] as PomodoroMode[]).map(m => (
            <button
              key={m}
              onClick={() => pomoTimer.switchMode(m)}
              style={{
                padding: "6px 13px", borderRadius: 7, fontSize: 11, border: "none", cursor: "pointer",
                fontWeight: mode === m ? 600 : 400,
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0c3e6f" : "#6a8fab",
                boxShadow: mode === m ? "0 1px 4px rgba(12,62,111,.1)" : "none",
                transition: "all .2s",
              }}
            >{LABELS[m]}</button>
          ))}
        </div>

        {/* Ring */}
        <div style={{ position: "relative", width: 192, height: 192, marginBottom: 24 }}>
          <svg width="192" height="192" viewBox="0 0 192 192" style={{ position: "absolute", inset: 0 }}>
            <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(12,62,111,.08)" strokeWidth="5" />
            <circle
              cx="96" cy="96" r="88" fill="none" stroke={ringColor} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              transform="rotate(-90 96 96)"
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "stroke-dashoffset .3s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: -2, lineHeight: 1, color: "#0c3e6f", fontVariantNumeric: "tabular-nums" }}>
              {fmt(timeLeft)}
            </div>
            <div style={{ fontSize: 10, fontWeight: 500, marginTop: 6, letterSpacing: "2px", textTransform: "uppercase", color: "#6a8fab" }}>
              {LABELS[mode]}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
          <IconBtn onClick={() => pomoTimer.reset()} title="Reset">↺</IconBtn>
          <button
            onClick={() => pomoTimer.toggle()}
            style={{
              width: 64, height: 64, borderRadius: "50%", border: "none",
              background: running ? "#16B7C2" : "#0c3e6f",
              cursor: "pointer", fontSize: 22, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all .25s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: running
                ? "0 6px 24px rgba(22,183,194,.45), 0 2px 8px rgba(22,183,194,.2)"
                : "0 6px 24px rgba(12,62,111,.38), 0 2px 8px rgba(12,62,111,.18)",
              outline: "none",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.09)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)" }}
          >
            {running ? "⏸" : "▶"}
          </button>
          <IconBtn onClick={() => pomoTimer.skip()} title="Skip session">⏭</IconBtn>
        </div>

        {/* Session dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <span style={{ fontSize: 10, color: "#8aadcc" }}>Sessions</span>
          {dots.map((done, i) => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: done ? "#0c3e6f" : "rgba(12,62,111,.12)", transition: "all .5s" }} />
          ))}
          <span style={{ fontSize: 10, color: "#8aadcc" }}>{sessions} done</span>
        </div>

        {/* Custom duration */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#6a8fab" }}>Custom (min)</span>
          <input
            type="number" value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyCustom()}
            placeholder={String(customMins[mode])}
            style={{ width: 48, textAlign: "center", fontSize: 12, borderRadius: 8, padding: "5px", outline: "none", border: "1px solid rgba(12,62,111,.14)", background: "rgba(255,255,255,.85)", color: "#0c3e6f" }}
          />
          <button
            onClick={applyCustom}
            style={{ padding: "5px 14px", borderRadius: 8, fontSize: 11, border: "1px solid rgba(12,62,111,.18)", color: "#0c3e6f", background: "rgba(255,255,255,.75)", cursor: "pointer", fontWeight: 500, transition: "all .18s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#0c3e6f"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.75)"; e.currentTarget.style.color = "#0c3e6f" }}
          >Set</button>
        </div>
      </div>
    </div>
  )
}