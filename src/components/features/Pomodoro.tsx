import { FooterBar } from "~src/components/FootBar"
import { TopBar } from "~src/components/Topbar"
import { CIRC, fmt, POMO_DEFAULTS, POMO_LABELS } from "~src/lib/constants/contant"
import type { PomodoroMode } from "~src/lib/types"
import { useEffect, useRef, useState } from "react"



export function PomodoroScreen({ onBack }: { onBack: () => void }) {
  const [mode, setMode] = useState<PomodoroMode>("focus")
  const [customMins, setCustomMins] = useState<Record<PomodoroMode, number>>({ ...POMO_DEFAULTS })
  const [timeLeft, setTimeLeft] = useState(POMO_DEFAULTS.focus * 60)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [customVal, setCustomVal] = useState("")
  const totalRef = useRef(POMO_DEFAULTS.focus * 60)
  const itvRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const switchMode = (m: PomodoroMode) => {
    itvRef.current && clearInterval(itvRef.current)
    setRunning(false); setMode(m)
    const t = customMins[m] * 60
    totalRef.current = t; setTimeLeft(t)
  }

  const toggle = () => {
    if (running) { itvRef.current && clearInterval(itvRef.current); setRunning(false) }
    else {
      setRunning(true)
      itvRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            itvRef.current && clearInterval(itvRef.current)
            setRunning(false)
            if (mode === "focus") setSessions(s => s + 1)
            return 0
          }
          return p - 1
        })
      }, 1000)
    }
  }

  const reset = () => {
    itvRef.current && clearInterval(itvRef.current); setRunning(false)
    const t = customMins[mode] * 60; totalRef.current = t; setTimeLeft(t)
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
    <div className="h-full flex flex-col" style={{ background: "#EFF6FF" }}>
      <TopBar title="Focus Timer" onBack={onBack} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4">
        {/* Mode tabs */}
        <div className="flex rounded-[10px] p-[3px] mb-7" style={{ background: "rgba(12,62,111,.07)" }}>
          {(["focus", "short", "long"] as PomodoroMode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className="px-3 py-[6px] rounded-[7px] text-[11px] transition-all duration-200"
              style={{
                fontWeight: mode === m ? 500 : 400,
                background: mode === m ? "#FFFFFF" : "transparent",
                color: mode === m ? "#0c3e6f" : "#6a8fab",
                boxShadow: mode === m ? "0 1px 4px rgba(12,62,111,.1)" : "none",
              }}
            >
              {POMO_LABELS[m]}
            </button>
          ))}
        </div>

        {/* Ring */}
        <div className="relative mb-6" style={{ width: 192, height: 192 }}>
          <svg width="192" height="192" viewBox="0 0 192 192" className="absolute inset-0">
            <circle cx="96" cy="96" r="88" fill="none" stroke="rgba(12,62,111,.08)" strokeWidth="5" />
            <circle
              cx="96" cy="96" r="88" fill="none"
              stroke={ringColor} strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * (1 - progress)}
              transform="rotate(-90 96 96)"
              style={{ transition: running ? "stroke-dashoffset 1s linear" : "stroke-dashoffset .3s ease" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-[40px] font-light tracking-[-2px] leading-none" style={{ color: "#0c3e6f" }}>
              {fmt(timeLeft)}
            </div>
            <div className="text-[10px] font-normal mt-1.5 tracking-widest uppercase" style={{ color: "#6a8fab" }}>
              {POMO_LABELS[mode]}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={reset}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] transition-all duration-200"
            style={{ border: "1.5px solid rgba(12,62,111,.15)", color: "#4a7099" }}
          >↺</button>
          <button
            onClick={toggle}
            className="w-14 h-14 rounded-full flex items-center justify-center text-[20px] transition-all duration-200"
            style={{ background: "#0c3e6f", color: "#FFFFFF", boxShadow: "0 4px 16px rgba(12,62,111,.22)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#16B7C2" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#0c3e6f" }}
          >
            {running ? "⏸" : "▶"}
          </button>
          <button
            onClick={() => { reset(); if (mode === "focus") setSessions(s => s + 1) }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[15px] transition-all duration-200"
            style={{ border: "1.5px solid rgba(12,62,111,.15)", color: "#4a7099" }}
          >⏭</button>
        </div>

        {/* Session dots */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px]" style={{ color: "#8aadcc" }}>Sessions</span>
          {dots.map((done, i) => (
            <div key={i} className="w-[7px] h-[7px] rounded-full transition-all duration-500"
              style={{ background: done ? "#0c3e6f" : "rgba(12,62,111,.12)" }} />
          ))}
          <span className="text-[10px]" style={{ color: "#8aadcc" }}>{sessions} done</span>
        </div>

        {/* Custom */}
        <div className="flex items-center gap-2">
          <span className="text-[11px]" style={{ color: "#6a8fab" }}>Custom (min)</span>
          <input
            type="number" value={customVal}
            onChange={e => setCustomVal(e.target.value)}
            onKeyDown={e => e.key === "Enter" && applyCustom()}
            placeholder={String(customMins[mode])}
            className="w-12 text-center text-[12px] rounded-[8px] py-[5px] outline-none transition-colors"
            style={{ border: "1px solid rgba(12,62,111,.14)", background: "rgba(255,255,255,.85)", color: "#0c3e6f" }}
          />
          <button
            onClick={applyCustom}
            className="px-3 py-[5px] rounded-[8px] text-[11px] transition-all duration-200"
            style={{ border: "1px solid rgba(12,62,111,.18)", color: "#0c3e6f", background: "rgba(255,255,255,.75)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#16B7C2"; (e.currentTarget as HTMLButtonElement).style.color = "#FFFFFF" }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,.75)"; (e.currentTarget as HTMLButtonElement).style.color = "#0c3e6f" }}
          >Set</button>
        </div>
      </div>

      <FooterBar />
    </div>
  )
}