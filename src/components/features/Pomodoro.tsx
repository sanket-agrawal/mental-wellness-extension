import { useState, useRef, useEffect } from "react"
import { RoundBtn } from "../RoundBtn"
import { HoverBtn } from "../HoverBtn"
import { CIRC, fmt, POMO_DEFAULTS, POMO_LABELS } from "~src/lib/constants/contant"

export type PomodoroMode = "focus" | "short" | "long"

export function PomodoroScreen({ onBack, onTick, onMinimize }: {
  onBack: () => void
  onTick?: (timeLeft: number, running: boolean, mode: PomodoroMode) => void
  onMinimize?: () => void
}) {
  const [mode, setMode] = useState<PomodoroMode>("focus")
  const [customMins, setCustomMins] = useState<Record<PomodoroMode, number>>({ ...POMO_DEFAULTS })
  const [timeLeft, setTimeLeft] = useState(POMO_DEFAULTS.focus * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [customVal, setCustomVal] = useState("")
  const totalRef = useRef(POMO_DEFAULTS.focus * 60)
  const itvRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const switchMode = (m: PomodoroMode) => {
    itvRef.current && clearInterval(itvRef.current); setRunning(false); setMode(m)
    const t = customMins[m] * 60; totalRef.current = t; setTimeLeft(t)
  }

  const toggle = () => {
    if (running) { itvRef.current && clearInterval(itvRef.current); setRunning(false); onTick?.(timeLeft, false, mode) }
    else {
      setRunning(true)
      itvRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) { itvRef.current && clearInterval(itvRef.current); setRunning(false); if (mode === "focus") setSessions(s => s + 1); onTick?.(0, false, mode); return 0 }
          onTick?.(p - 1, true, mode)
          return p - 1
        })
      }, 1000)
    }
  }

  const reset = () => {
    itvRef.current && clearInterval(itvRef.current); setRunning(false)
    const t = customMins[mode] * 60; totalRef.current = t; setTimeLeft(t); onTick?.(t, false, mode)
  }

  const applyCustom = () => {
    const v = parseInt(customVal); if (!v || v < 1 || v > 99) return
    setCustomMins(p => ({ ...p, [mode]: v }))
    itvRef.current && clearInterval(itvRef.current); setRunning(false)
    const t = v * 60; totalRef.current = t; setTimeLeft(t); setCustomVal("")
  }

  useEffect(() => () => { itvRef.current && clearInterval(itvRef.current) }, [])

  const progress = totalRef.current > 0 ? (totalRef.current - timeLeft) / totalRef.current : 0
  const ringColor = mode === "focus" ? "#0c3e6f" : mode === "short" ? "#16B7C2" : "#0a7080"
  const dots = Array.from({ length: 4 }, (_, i) => i < sessions % 4)

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 440 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px", background: "#F8FBFF", borderBottom: "1px solid rgba(12,62,111,.08)", flexShrink: 0 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6a8fab", padding: "4px 0" }}>← Back</button>
        <span style={{ fontSize: 13, fontWeight: 500, color: "#0c3e6f" }}>Focus Timer</span>
        <button
          onClick={onMinimize}
          title="Minimize — timer keeps running"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6a8fab", padding: "4px 6px", borderRadius: 6, lineHeight: 1 }}
          onMouseEnter={e => (e.currentTarget.style.color = "#16B7C2")}
          onMouseLeave={e => (e.currentTarget.style.color = "#6a8fab")}
        >⌃</button>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 24px 24px" }}>
        <div style={{ display: "flex", borderRadius: 10, padding: 3, background: "rgba(12,62,111,.07)", marginBottom: 24 }}>
          {(["focus", "short", "long"] as PomodoroMode[]).map(m => (
            <button key={m} onClick={() => switchMode(m)} style={{
              padding: "6px 12px", borderRadius: 7, fontSize: 11, border: "none", cursor: "pointer",
              fontWeight: mode === m ? 500 : 400,
              background: mode === m ? "#fff" : "transparent",
              color: mode === m ? "#0c3e6f" : "#6a8fab",
              boxShadow: mode === m ? "0 1px 4px rgba(12,62,111,.1)" : "none",
              transition: "all .2s",
            }}>{POMO_LABELS[m]}</button>
          ))}
        </div>

        <div style={{ position: "relative", width: 192, height: 192, marginBottom: 20 }}>
          <svg width="192" height="192" viewBox="0 0 192 192" style={{ position: "absolute", inset: 0 }}>
            <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(12,62,111,.08)" strokeWidth="5" />
            <circle cx="96" cy="96" r="88" fill="none" stroke={ringColor} strokeWidth="5"
              strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - progress)}
              transform="rotate(-90 96 96)"
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "stroke-dashoffset .3s ease" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 40, fontWeight: 300, letterSpacing: -2, lineHeight: 1, color: "#0c3e6f" }}>{fmt(timeLeft)}</div>
            <div style={{ fontSize: 10, fontWeight: 400, marginTop: 6, letterSpacing: "2px", textTransform: "uppercase", color: "#6a8fab" }}>{POMO_LABELS[mode]}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <RoundBtn onClick={reset} size={44}>↺</RoundBtn>
          <HoverBtn onClick={toggle} style={{ width: 56, height: 56, borderRadius: "50%", fontSize: 20 }}>
            {running ? "⏸" : "▶"}
          </HoverBtn>
          <RoundBtn onClick={() => { reset(); if (mode === "focus") setSessions(s => s + 1) }} size={44}>⏭</RoundBtn>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <span style={{ fontSize: 10, color: "#8aadcc" }}>Sessions</span>
          {dots.map((done, i) => (
            <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: done ? "#0c3e6f" : "rgba(12,62,111,.12)", transition: "all .5s" }} />
          ))}
          <span style={{ fontSize: 10, color: "#8aadcc" }}>{sessions} done</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, color: "#6a8fab" }}>Custom (min)</span>
          <input type="number" value={customVal} onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyCustom()}
            placeholder={String(customMins[mode])}
            style={{ width: 48, textAlign: "center", fontSize: 12, borderRadius: 8, padding: "5px", outline: "none", border: "1px solid rgba(12,62,111,.14)", background: "rgba(255,255,255,.85)", color: "#0c3e6f" }}
          />
          <HoverBtn onClick={applyCustom} style={{ padding: "5px 12px", borderRadius: 8, fontSize: 11 }}
            base={{ border: "1px solid rgba(12,62,111,.18)", color: "#0c3e6f", background: "rgba(255,255,255,.75)" }}
          >Set</HoverBtn>
        </div>
      </div>
    </div>
  )
}
