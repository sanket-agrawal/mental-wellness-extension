import { useState, useRef, useEffect } from "react"
import { CIRC, fmt, POMO_DEFAULTS, POMO_LABELS } from "~src/lib/constants/contant"

export type PomodoroMode = "focus" | "short" | "long"

// ─── Web Audio chime ─────────────────────────────────────────────
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()
    const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = "sine"
      osc.frequency.value = freq
      const t = ctx.currentTime + i * 0.2
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.28, t + 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
      osc.start(t)
      osc.stop(t + 0.75)
    })
  } catch (e) {
    console.warn("Audio not available", e)
  }
}

export function PomodoroScreen({
  onBack,
  onTick,
  onMinimize,
}: {
  onBack: () => void
  onTick?: (timeLeft: number, running: boolean, mode: PomodoroMode) => void
  onMinimize?: () => void
}) {
  const [mode, setMode]           = useState<PomodoroMode>("focus")
  const [customMins, setCustomMins] = useState<Record<PomodoroMode, number>>({ ...POMO_DEFAULTS })
  const [timeLeft, setTimeLeft]   = useState(POMO_DEFAULTS.focus * 60)
  const [running, setRunning]     = useState(false)
  const [sessions, setSessions]   = useState(0)
  const [customVal, setCustomVal] = useState("")

  const totalRef      = useRef(POMO_DEFAULTS.focus * 60)
  const itvRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  // Track whether unmount is due to minimize (timer should keep ticking via onTick)
  const isMinimizing  = useRef(false)

  // ── mode switch ────────────────────────────────────────────────
  const switchMode = (m: PomodoroMode) => {
    itvRef.current && clearInterval(itvRef.current)
    setRunning(false)
    setMode(m)
    const t = customMins[m] * 60
    totalRef.current = t
    setTimeLeft(t)
  }

  // ── toggle play / pause ────────────────────────────────────────
  const toggle = () => {
    if (running) {
      itvRef.current && clearInterval(itvRef.current)
      setRunning(false)
      onTick?.(timeLeft, false, mode)
      return
    }

    setRunning(true)
    itvRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          itvRef.current && clearInterval(itvRef.current)
          setRunning(false)
          if (mode === "focus") setSessions(s => s + 1)
          playChime()
          onTick?.(0, false, mode)
          return 0
        }
        onTick?.(prev - 1, true, mode)
        return prev - 1
      })
    }, 1000)
  }

  // ── reset ──────────────────────────────────────────────────────
  const reset = () => {
    itvRef.current && clearInterval(itvRef.current)
    setRunning(false)
    const t = customMins[mode] * 60
    totalRef.current = t
    setTimeLeft(t)
    onTick?.(t, false, mode)
  }

  // ── skip ───────────────────────────────────────────────────────
  const skip = () => {
    reset()
    if (mode === "focus") setSessions(s => s + 1)
  }

  // ── custom duration ────────────────────────────────────────────
  const applyCustom = () => {
    const v = parseInt(customVal)
    if (!v || v < 1 || v > 99) return
    setCustomMins(p => ({ ...p, [mode]: v }))
    itvRef.current && clearInterval(itvRef.current)
    setRunning(false)
    const t = v * 60
    totalRef.current = t
    setTimeLeft(t)
    setCustomVal("")
  }

  // ── minimize: keep interval alive ─────────────────────────────
  const handleMinimize = () => {
    isMinimizing.current = true
    onMinimize?.()
  }

  // ── cleanup: only stop timer if NOT minimizing ─────────────────
  useEffect(() => {
    return () => {
      if (!isMinimizing.current) {
        itvRef.current && clearInterval(itvRef.current)
      }
      // Reset flag for next mount
      isMinimizing.current = false
    }
  }, [])

  // ── derived ────────────────────────────────────────────────────
  const progress  = totalRef.current > 0 ? (totalRef.current - timeLeft) / totalRef.current : 0
  const ringColor = mode === "focus" ? "#0c3e6f" : mode === "short" ? "#16B7C2" : "#0a7080"
  const dots      = Array.from({ length: 4 }, (_, i) => i < sessions % 4)

  // ── small reusable icon button ─────────────────────────────────
  const IconBtn = ({
    onClick,
    title,
    children,
  }: {
    onClick: () => void
    title?: string
    children: React.ReactNode
  }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: "1.5px solid rgba(12,62,111,.14)",
        background: "rgba(255,255,255,.88)",
        cursor: "pointer",
        fontSize: 17,
        color: "#6a8fab",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all .2s ease",
        boxShadow: "0 2px 8px rgba(12,62,111,.08)",
        outline: "none",
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

  // ── render ─────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 440 }}>

      {/* ── header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 20px 14px",
          background: "#F8FBFF",
          borderBottom: "1px solid rgba(12,62,111,.08)",
          flexShrink: 0,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            color: "#6a8fab",
            padding: "4px 0",
          }}
        >
          ← Back
        </button>

        <span style={{ fontSize: 13, fontWeight: 500, color: "#0c3e6f" }}>
          Focus Timer
        </span>

        <button
          onClick={handleMinimize}
          title="Minimize — timer keeps running"
          style={{
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
          onMouseEnter={e => (e.currentTarget.style.color = "#16B7C2")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6a8fab")}
        >
          ⌃
        </button>
      </div>

      {/* ── body ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px 24px 28px",
        }}
      >
        {/* mode tabs */}
        <div
          style={{
            display: "flex",
            borderRadius: 10,
            padding: 3,
            background: "rgba(12,62,111,.07)",
            marginBottom: 26,
          }}
        >
          {(["focus", "short", "long"] as PomodoroMode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              style={{
                padding: "6px 13px",
                borderRadius: 7,
                fontSize: 11,
                border: "none",
                cursor: "pointer",
                fontWeight: mode === m ? 600 : 400,
                background: mode === m ? "#fff" : "transparent",
                color: mode === m ? "#0c3e6f" : "#6a8fab",
                boxShadow: mode === m ? "0 1px 4px rgba(12,62,111,.1)" : "none",
                transition: "all .2s",
              }}
            >
              {POMO_LABELS[m]}
            </button>
          ))}
        </div>

        {/* ring + timer */}
        <div style={{ position: "relative", width: 192, height: 192, marginBottom: 24 }}>
          <svg
            width="192"
            height="192"
            viewBox="0 0 192 192"
            style={{ position: "absolute", inset: 0 }}
          >
            <circle
              cx="96" cy="96" r="88"
              fill="none"
              stroke="rgba(12,62,111,.08)"
              strokeWidth="5"
            />
            <circle
              cx="96" cy="96" r="88"
              fill="none"
              stroke={ringColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              transform="rotate(-90 96 96)"
              style={{
                transition: running
                  ? "stroke-dashoffset 1s linear"
                  : "stroke-dashoffset .3s ease",
              }}
            />
          </svg>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                fontSize: 40,
                fontWeight: 300,
                letterSpacing: -2,
                lineHeight: 1,
                color: "#0c3e6f",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {fmt(timeLeft)}
            </div>
            <div
              style={{
                fontSize: 10,
                fontWeight: 500,
                marginTop: 6,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#6a8fab",
              }}
            >
              {POMO_LABELS[mode]}
            </div>
          </div>
        </div>

        {/* ── controls ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 18,
          }}
        >
          {/* Reset */}
          <IconBtn onClick={reset} title="Reset">↺</IconBtn>

          {/* Play / Pause — primary */}
          <button
            onClick={toggle}
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "none",
              background: running ? "#16B7C2" : "#0c3e6f",
              cursor: "pointer",
              fontSize: 22,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
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

          {/* Skip */}
          <IconBtn onClick={skip} title="Skip session">⏭</IconBtn>
        </div>

        {/* session dots */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 18,
          }}
        >
          <span style={{ fontSize: 10, color: "#8aadcc" }}>Sessions</span>
          {dots.map((done, i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: done ? "#0c3e6f" : "rgba(12,62,111,.12)",
                transition: "all .5s",
              }}
            />
          ))}
          <span style={{ fontSize: 10, color: "#8aadcc" }}>{sessions} done</span>
        </div>

        {/* custom duration */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#6a8fab" }}>Custom (min)</span>
          <input
            type="number"
            value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyCustom()}
            placeholder={String(customMins[mode])}
            style={{
              width: 48,
              textAlign: "center",
              fontSize: 12,
              borderRadius: 8,
              padding: "5px",
              outline: "none",
              border: "1px solid rgba(12,62,111,.14)",
              background: "rgba(255,255,255,.85)",
              color: "#0c3e6f",
            }}
          />
          <button
            onClick={applyCustom}
            style={{
              padding: "5px 14px",
              borderRadius: 8,
              fontSize: 11,
              border: "1px solid rgba(12,62,111,.18)",
              color: "#0c3e6f",
              background: "rgba(255,255,255,.75)",
              cursor: "pointer",
              fontWeight: 500,
              transition: "all .18s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "#0c3e6f"
              e.currentTarget.style.color = "#fff"
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,.75)"
              e.currentTarget.style.color = "#0c3e6f"
            }}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  )
}