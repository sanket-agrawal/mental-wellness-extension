import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { renderToStaticMarkup } from "react-dom/server"
import type { PlasmoCSConfig } from "plasmo"
import {
  MessageCircle, Brain, Timer, Smile, UserRound,
  Wind, Music, X, type LucideIcon
} from "lucide-react"
import icon from "data-base64:~assets/icon.png"
import AuthForm from "~src/components/auth/AuthForm"
import { useAuthStore } from "~src/lib/hooks/useAuthStore"
import { ChatScreen } from "~src/components/features/Ai/ChatScreen"

// ─── Plasmo config ────────────────────────────────────────────────
export const config: PlasmoCSConfig = { matches: ["<all_urls>"] }

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

export const getRootContainer = () =>
  new Promise<HTMLElement>((resolve) => {
    const existing = document.getElementById("cc-root-container")
    if (existing) { resolve(existing); return }
    const container = document.createElement("div")
    container.id = "cc-root-container"
    container.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483645;pointer-events:none;overflow:visible;"
    const inject = () => { document.body.appendChild(container); resolve(container) }
    if (document.body) inject()
    else document.addEventListener("DOMContentLoaded", inject, { once: true })
  })

// ─── Layout constants ─────────────────────────────────────────────
const NODE_SIZE = 160, ICON_SIZE = 38, LABEL_WIDTH = 238, OFFSET = 80, RADIUS = 140
const SUB_NODE_SIZE = 52, SUB_ICON_SIZE = 14, SUB_LABEL_WIDTH = 44, SUB_OFFSET = 26, SUB_RADIUS = 130

const iconHtml = (Icon: LucideIcon, size = ICON_SIZE) =>
  renderToStaticMarkup(<Icon size={size} strokeWidth={1.6} />)

const NODES = [
  { id: "chat",      label: "Vent Out",   angle: 270, url: undefined as string | undefined, icon: iconHtml(MessageCircle) },
  {
    id: "meditate",  label: "Meditate",   angle: 299, url: undefined as string | undefined, icon: iconHtml(Brain),
    subNodes: [
      { id: "breathe",  label: "Breathe",      angle: 279, icon: iconHtml(Wind,  SUB_ICON_SIZE) },
      { id: "sounds",   label: "Sounds",       angle: 307, icon: iconHtml(Music, SUB_ICON_SIZE) },
      { id: "pomodoro", label: "Stay Focused", angle: 335, icon: iconHtml(Timer, SUB_ICON_SIZE) },
    ]
  },
  { id: "quote",     label: "Lift Me Up",  angle: 328, url: undefined as string | undefined, icon: iconHtml(Smile) },
  { id: "therapist", label: "Seek Help",   angle: 357, url: "https://catalystcare.in/therapists", icon: iconHtml(UserRound) },
]

// ─── Event bus ───────────────────────────────────────────────────
const CC_OPEN       = "cc:open-screen"
const CC_CLOSE      = "cc:close-screen"
const CC_POMO_TICK  = "cc:pomo-tick"
const CC_OPEN_MENU  = "cc:open-menu"
const dispatch = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }))

// ══════════════════════════════════════════════════════════════════
//  OVERLAY SCREENS
// ══════════════════════════════════════════════════════════════════

function OverlayShell({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2147483646,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: visible ? "rgba(8,28,58,.55)" : "rgba(8,28,58,0)",
        backdropFilter: visible ? "blur(6px)" : "blur(0px)",
        transition: "background .3s ease, backdrop-filter .3s ease",
        pointerEvents: "auto",
        isolation: "isolate",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: wide ? 400 : 360,
          maxHeight: "92vh",
          borderRadius: 20,
          background: "#EFF6FF",
          boxShadow: "0 32px 80px rgba(8,28,58,.38), 0 8px 24px rgba(8,28,58,.18)",
          overflow: "hidden",
          transform: visible ? "scale(1) translateY(0)" : "scale(.92) translateY(18px)",
          opacity: visible ? 1 : 0,
          transition: "transform .38s cubic-bezier(.34,1.56,.64,1), opacity .28s ease",
          display: "flex", flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "18px 20px 14px",
      background: "#F8FBFF",
      borderBottom: "1px solid rgba(12,62,111,.08)",
      flexShrink: 0,
    }}>
      <button
        onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6a8fab", padding: "4px 0" }}
      >← Back</button>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#0c3e6f" }}>{title}</span>
      <div style={{ width: 40 }} />
    </div>
  )
}


// ── Breathe screen ────────────────────────────────────────────────
const BREATHE_STEPS = [
  { label: "Inhale",  duration: 4, instruction: "Breathe in slowly through your nose, filling your lungs completely." },
  { label: "Hold",    duration: 4, instruction: "Hold gently. Let stillness settle in." },
  { label: "Exhale",  duration: 6, instruction: "Release slowly through your mouth. Let everything go." },
]

function BreatheScreen({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [round, setRound] = useState(0)
  const itvRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const step = BREATHE_STEPS[stepIdx]

  useEffect(() => {
    if (!active) return
    itvRef.current = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= step.duration) {
          const next = (stepIdx + 1) % BREATHE_STEPS.length
          if (next === 0) setRound(r => r + 1)
          setStepIdx(next); return 0
        }
        return e + 1
      })
    }, 1000)
    return () => { itvRef.current && clearInterval(itvRef.current) }
  }, [active, stepIdx, step.duration])

  const toggle = () => {
    if (active) { itvRef.current && clearInterval(itvRef.current); setActive(false) }
    else { setStepIdx(0); setElapsed(0); setActive(true) }
  }

  const progress = step ? elapsed / step.duration : 0
  const scale = 1 + progress * 0.13

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <TopBar title="Breathe" onBack={onBack} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 32px", gap: 0 }}>
        {round > 0 && (
          <div style={{ fontSize: 10, letterSpacing: "2px", textTransform: "uppercase", color: "#6a8fab", marginBottom: 16 }}>
            Round {round}
          </div>
        )}
        <div style={{
          width: 108, height: 108, borderRadius: "50%",
          background: active ? "#0c3e6f" : "rgba(12,62,111,.08)",
          transform: `scale(${active ? scale : 1})`,
          transition: "transform .6s ease, background .5s ease",
          boxShadow: active ? `0 0 0 ${Math.round(14 * progress)}px rgba(22,183,194,.12)` : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 28,
        }}>
          <span style={{ fontSize: 10.5, letterSpacing: "1.5px", textTransform: "uppercase", color: active ? "rgba(255,255,255,.85)" : "#6a8fab" }}>
            {active ? step.label : "Ready"}
          </span>
        </div>
        <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.72, textAlign: "center", maxWidth: 248, color: "#2a5a8a", marginBottom: 12 }}>
          {active ? step.instruction : "Find a quiet moment. Let your shoulders drop. You're about to give yourself a gift."}
        </p>
        {active && (
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {BREATHE_STEPS.map((_, i) => (
              <div key={i} style={{ height: 4, borderRadius: 2, transition: "all .3s", width: i === stepIdx ? 18 : 5, background: i === stepIdx ? "#16B7C2" : "rgba(12,62,111,.12)" }} />
            ))}
          </div>
        )}
        <HoverBtn onClick={toggle} style={{ padding: "10px 28px", borderRadius: 99, fontSize: 13, fontWeight: 500 }}
          base={{ background: active ? "transparent" : "#0c3e6f", border: active ? "1.5px solid rgba(12,62,111,.2)" : "none", color: active ? "#0c3e6f" : "#fff" }}
        >
          {active ? "Pause" : "Begin"}
        </HoverBtn>
        {!active && (
          <p style={{ fontSize: 11, fontWeight: 300, textAlign: "center", marginTop: 14, maxWidth: 200, lineHeight: 1.6, color: "#8aadcc" }}>
            4-4-6 breathing · Calms your nervous system
          </p>
        )}
      </div>
    </div>
  )
}

// ── Sounds screen ─────────────────────────────────────────────────
const SOUNDS = [
  { id: "rain",    label: "Rain",        emoji: "🌧️", freq: 200, type: "noise" as const },
  { id: "ocean",   label: "Ocean",       emoji: "🌊", freq: 120, type: "noise" as const },
  { id: "forest",  label: "Forest",      emoji: "🌿", freq: 440, type: "tone"  as const },
  { id: "fire",    label: "Fireplace",   emoji: "🔥", freq: 80,  type: "noise" as const },
  { id: "bowl",    label: "Singing Bowl",emoji: "🪘", freq: 396, type: "tone"  as const },
  { id: "white",   label: "White Noise", emoji: "〰️", freq: 300, type: "noise" as const },
]

function SoundsScreen({ onBack }: { onBack: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.6)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ src: AudioBufferSourceNode | OscillatorNode; gain: GainNode } | null>(null)

  const stop = () => {
    nodesRef.current?.gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.3)
    setTimeout(() => { try { nodesRef.current?.src.stop() } catch {} nodesRef.current = null }, 400)
    setPlaying(null)
  }

  const play = (s: typeof SOUNDS[0]) => {
    if (playing === s.id) { stop(); return }
    if (playing) stop()
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    const gain = ctx.createGain(); gain.gain.value = 0
    gain.connect(ctx.destination)
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.5)

    if (s.type === "noise") {
      const bufLen = ctx.sampleRate * 4
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = s.freq
      src.connect(filter); filter.connect(gain); src.start()
      nodesRef.current = { src, gain }
    } else {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = s.freq
      osc.connect(gain); osc.start()
      nodesRef.current = { src: osc, gain }
    }
    setPlaying(s.id)
  }

  useEffect(() => {
    if (nodesRef.current) nodesRef.current.gain.gain.setTargetAtTime(volume, ctxRef.current!.currentTime, 0.1)
  }, [volume])

  useEffect(() => () => { stop() }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <TopBar title="Ambient Sounds" onBack={onBack} />
      <div style={{ flex: 1, padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {SOUNDS.map(s => {
            const active = playing === s.id
            return (
              <button
                key={s.id}
                onClick={() => play(s)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                  background: active ? "#0c3e6f" : "rgba(255,255,255,.85)",
                  border: `1.5px solid ${active ? "rgba(22,183,194,.5)" : "rgba(12,62,111,.1)"}`,
                  boxShadow: active ? "0 4px 18px rgba(12,62,111,.22)" : "0 2px 8px rgba(12,62,111,.06)",
                  transition: "all .22s ease",
                }}
              >
                <span style={{ fontSize: 26 }}>{s.emoji}</span>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: active ? "#16B7C2" : "#2a5a8a" }}>{s.label}</span>
                {active && (
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 3, borderRadius: 2, background: "#16B7C2",
                        animation: `ccSoundBar .8s ${i * 0.15}s ease-in-out infinite alternate`,
                        height: 8,
                      }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#6a8fab", minWidth: 48 }}>Volume</span>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#16B7C2" }}
          />
          <span style={{ fontSize: 11, color: "#6a8fab", minWidth: 28, textAlign: "right" }}>{Math.round(volume * 100)}%</span>
        </div>
        {!playing && (
          <p style={{ fontSize: 11, color: "#8aadcc", textAlign: "center", fontWeight: 300, lineHeight: 1.6 }}>
            Choose a sound to create your calm space
          </p>
        )}
      </div>
    </div>
  )
}

// ── Pomodoro screen ───────────────────────────────────────────────
type PomodoroMode = "focus" | "short" | "long"
const POMO_DEFAULTS: Record<PomodoroMode, number> = { focus: 25, short: 5, long: 15 }
const POMO_LABELS: Record<PomodoroMode, string> = { focus: "Focus", short: "Short Break", long: "Long Break" }
const CIRC = 2 * Math.PI * 88
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

function PomodoroScreen({ onBack, onTick, onMinimize }: {
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

// ── Quote screen ──────────────────────────────────────────────────
const QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or anxious.", author: "Lori Deschene" },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Healing is not linear. Be gentle with yourself.", author: "Unknown" },
  { text: "The bravest thing I ever did was continuing my life when I wanted to die.", author: "Juliette Lewis" },
]
const AFFIRMATIONS = [
  "I am worthy of love and care, especially from myself.",
  "This moment is hard, but I have survived hard moments before.",
  "My feelings are valid, and I am allowed to feel them.",
  "I am doing the best I can, and that is enough.",
]
const FEELING_OPTIONS = [
  { symbol: "💙", label: "Seen" }, { symbol: "✨", label: "Hopeful" },
  { symbol: "🌱", label: "Calm" },  { symbol: "💭", label: "Thinking" },
]

function QuoteScreen({ onBack }: { onBack: () => void }) {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [feeling, setFeeling] = useState<string | null>(null)
  const [affirmation] = useState(() => AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)])
  const quote = QUOTES[quoteIdx]

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 460 }}>
      <TopBar title="A Word for You" onBack={onBack} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px 32px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 58, lineHeight: .7, marginBottom: 20, color: "rgba(12,62,111,.11)", fontFamily: "Georgia, serif" }}>"</div>
        <p style={{ fontSize: 16, fontWeight: 300, lineHeight: 1.68, letterSpacing: "-.02em", marginBottom: 16, maxWidth: 272, color: "#0c3e6f" }}>
          {quote.text}
        </p>
        <div style={{ width: 28, height: 1, background: "rgba(12,62,111,.15)", marginBottom: 12 }} />
        <p style={{ fontSize: 10.5, fontWeight: 400, letterSpacing: "1.4px", textTransform: "uppercase", marginBottom: 24, color: "#8aadcc" }}>
          — {quote.author}
        </p>
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 10.5, marginBottom: 10, color: "#8aadcc" }}>How does this land with you?</p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {FEELING_OPTIONS.map(f => (
              <button key={f.label} onClick={() => { setFeeling(f.label); setTimeout(() => setFeeling(null), 2200) }}
                style={{
                  padding: "6px 12px", borderRadius: 99, fontSize: 11, cursor: "pointer",
                  border: `1px solid ${feeling === f.label ? "#16B7C2" : "rgba(12,62,111,.12)"}`,
                  background: feeling === f.label ? "#16B7C2" : "rgba(255,255,255,.85)",
                  color: feeling === f.label ? "#fff" : "#2a5a8a",
                  transition: "all .2s",
                }}
              >{f.symbol} {f.label}</button>
            ))}
          </div>
        </div>
        <div style={{ borderRadius: 11, padding: "10px 16px", marginBottom: 20, maxWidth: 252, background: "rgba(255,255,255,.75)", border: "1px solid rgba(12,62,111,.07)" }}>
          <p style={{ fontSize: 11.5, fontWeight: 300, lineHeight: 1.6, fontStyle: "italic", color: "#4a7099" }}>{affirmation}</p>
        </div>
        <button
          onClick={() => setQuoteIdx(i => (i + 1) % QUOTES.length)}
          style={{ padding: "10px 24px", borderRadius: 99, fontSize: 12, fontWeight: 500, letterSpacing: ".04em", cursor: "pointer", border: "1.5px solid rgba(12,62,111,.2)", background: "transparent", color: "#0c3e6f", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#16B7C2"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#16B7C2" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0c3e6f"; e.currentTarget.style.borderColor = "rgba(12,62,111,.2)" }}
        >Another thought →</button>
      </div>
    </div>
  )
}

function AuthScreen({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", maxHeight: "88vh", overflowY: "auto", minHeight: 500 }}>
      <ErrorBoundary fallback={<div style={{padding: 20, color: "red", fontSize: 12}}>Auth failed to load. Check console.</div>}>
        <AuthForm onSuccess={onSuccess} />
      </ErrorBoundary>
    </div>
  )
}

class ErrorBoundary extends React.Component<{fallback: React.ReactNode, children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: any) { console.error("AuthForm crashed:", e) }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

// ══════════════════════════════════════════════════════════════════
//  SMALL REUSABLE COMPONENTS
// ══════════════════════════════════════════════════════════════════

export const TypingDots = () => {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#93C5FD", animation: `ccDot .8s ${i * 0.16}s ease-in-out infinite alternate` }} />
      ))}
    </div>
  )
}

export const QuickPromptBtn = ({ label, onClick }: { label: string; onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      style={{ padding: "5px 10px", borderRadius: 99, fontSize: 10.5, fontWeight: 400, cursor: "pointer", border: "1px solid rgba(12,62,111,.12)", background: "rgba(255,255,255,.85)", color: "#2a5a8a", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "#16B7C2"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#16B7C2" }}
      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.85)"; e.currentTarget.style.color = "#2a5a8a"; e.currentTarget.style.borderColor = "rgba(12,62,111,.12)" }}
    >{label}</button>
  )
}

export const HoverBtn = ({ onClick, style: extraStyle = {}, base = {}, children }: {
  onClick: () => void; style?: React.CSSProperties; base?: React.CSSProperties; children: React.ReactNode
}) =>{
  const defaultBase: React.CSSProperties = { background: "#0c3e6f", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(12,62,111,.22)", ...base }
  return (
    <button onClick={onClick}
      style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", transition: "all .2s", ...defaultBase, ...extraStyle }}
      onMouseEnter={e => { e.currentTarget.style.background = "#16B7C2" }}
      onMouseLeave={e => { e.currentTarget.style.background = (base as any).background ?? "#0c3e6f" }}
    >{children}</button>
  )
}

export const RoundBtn = ({ onClick, size = 44, children }: { onClick: () => void; size?: number; children: React.ReactNode }) => {
  return (
    <button onClick={onClick}
      style={{ width: size, height: size, borderRadius: "50%", border: "1.5px solid rgba(12,62,111,.15)", background: "none", cursor: "pointer", fontSize: 15, color: "#4a7099", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,183,194,.1)"; e.currentTarget.style.borderColor = "#16B7C2" }}
      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(12,62,111,.15)" }}
    >{children}</button>
  )
}

// ══════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════
function injectGlobalStyles() {
  if (document.getElementById("cc-global-styles")) return
  const style = document.createElement("style")
  style.id = "cc-global-styles"
  style.textContent = `
    @keyframes ccPulse {
      0%   { box-shadow: 0 0 0 0    rgba(12,62,111,.32); }
      70%  { box-shadow: 0 0 0 18px rgba(12,62,111,0);   }
      100% { box-shadow: 0 0 0 0    rgba(12,62,111,0);   }
    }
    @keyframes ccPomoRing {
      0%   { box-shadow: 0 0 0 0    rgba(22,183,194,.45); }
      70%  { box-shadow: 0 0 0 10px rgba(22,183,194,0);   }
      100% { box-shadow: 0 0 0 0    rgba(22,183,194,0);   }
    }
    @keyframes ccFloat {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes ccSubFloat {
      0%,100% { transform: translateY(0px) scale(1); }
      50%      { transform: translateY(-4px) scale(1.02); }
    }
    @keyframes ccSubIn {
      0%   { opacity: 0 !important; transform: scale(0.18) translateY(8px) !important; }
      60%  { opacity: 1 !important; transform: scale(1.06) translateY(-2px) !important; }
      100% { opacity: 1 !important; transform: scale(1) translateY(0) !important; }
    }
    @keyframes ccSubOut {
      0%   { opacity: 1 !important; transform: scale(1) !important; }
      100% { opacity: 0 !important; transform: scale(0.18) translateY(8px) !important; }
    }
    @keyframes ccRipple {
      0%   { box-shadow: 0 0 0 0 rgba(22,183,194,.45); }
      70%  { box-shadow: 0 0 0 14px rgba(22,183,194,0); }
      100% { box-shadow: 0 0 0 0 rgba(22,183,194,0); }
    }
    @keyframes ccDot {
      0%   { transform: translateY(0);   opacity: .5; }
      100% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes ccSoundBar {
      0%   { height: 4px; }
      100% { height: 14px; }
    }
    #cc-fab {
      all: initial;
      position: fixed !important;
      bottom: 28px !important;
      left: 28px !important;
      width: 54px !important;
      height: 54px !important;
      border-radius: 100% !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 6px 24px rgba(12,62,111,.35), 0 2px 8px rgba(12,62,111,.18) !important;
      pointer-events: auto !important;
      transition: transform .35s cubic-bezier(.34,1.56,.64,1), background .3s ease !important;
      animation: ccPulse 2.4s ease infinite !important;
      z-index: 2147483647 !important;
      border: none !important;
      background: #ffffff !important;
      overflow: hidden !important;
    }
    #cc-fab:hover { transform: scale(1.1) !important; }
    #cc-fab.cc-open { transform: rotate(45deg) scale(1.05) !important; animation: none !important; }
    #cc-fab.cc-pomo-active {
      background: #0c3e6f !important;
      animation: ccPomoRing 1.8s ease infinite !important;
      width: 66px !important;
      border-radius: 33px !important;
    }
    #cc-fab.cc-pomo-active:hover { transform: scale(1.06) !important; }
    #cc-fab-img {
      width: 38px !important;
      height: 38px !important;
      object-fit: cover !important;
      border-radius: 50% !important;
      transition: opacity .25s ease, transform .25s ease !important;
    }
    #cc-fab-timer {
      display: none !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0px !important;
      pointer-events: none !important;
    }
    #cc-fab.cc-pomo-active #cc-fab-img {
      display: none !important;
    }
    #cc-fab.cc-pomo-active #cc-fab-timer {
      display: flex !important;
    }
    #cc-fab-timer-label {
      font-family: monospace !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #fff !important;
      letter-spacing: 0.5px !important;
      line-height: 1 !important;
    }
    #cc-fab-timer-mode {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
      font-size: 7px !important;
      font-weight: 500 !important;
      color: #16B7C2 !important;
      letter-spacing: 1px !important;
      text-transform: uppercase !important;
      margin-top: 2px !important;
      line-height: 1 !important;
    }
    .cc-ring {
      position: fixed !important; border-radius: 50% !important;
      pointer-events: none !important; opacity: 0 !important;
      transition: opacity .4s ease !important; z-index: 2147483640 !important;
    }
    .cc-ring.cc-vis { opacity: 1 !important; }
    #cc-r1 { width: 310px !important; height: 310px !important; bottom: -100px !important; left: -100px !important; border: 1px dashed rgba(12,62,111,.15) !important; }
    #cc-r2 { width: 360px !important; height: 360px !important; bottom: -125px !important; left: -125px !important; border: 1px solid rgba(12,62,111,.08) !important; }
    .cc-node {
      all: initial; position: fixed !important;
      width: ${NODE_SIZE}px !important; height: ${NODE_SIZE}px !important;
      border-radius: 50% !important;
      background: rgba(255,255,255,.97) !important;
      border: 1.5px solid rgba(12,62,111,.1) !important;
      box-shadow: 0 4px 16px rgba(12,62,111,.14) !important;
      display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      gap: 6px !important; cursor: pointer !important;
      pointer-events: none !important; opacity: 0 !important;
      transform: scale(0.3) !important; z-index: 2147483646 !important;
      transition: background .2s ease, border-color .2s ease, box-shadow .2s ease !important;
    }
    .cc-node.cc-vis { opacity: 1 !important; pointer-events: auto !important; }
    .cc-node.cc-float { animation: ccFloat var(--f-dur,3s) var(--f-off,0ms) ease-in-out infinite !important; }
    .cc-node:hover { background: #16B7C2 !important; border-color: rgba(22,183,194,.5) !important; box-shadow: 0 8px 28px rgba(22,183,194,.38) !important; }
    .cc-node:hover .cc-ni { color: #fff !important; }
    .cc-node:hover .cc-nl { color: rgba(255,255,255,.9) !important; }
    .cc-node.cc-meditate-active { background: #0c3e6f !important; border-color: rgba(22,183,194,.6) !important; box-shadow: 0 8px 32px rgba(12,62,111,.42) !important; animation: ccRipple 1.8s ease infinite !important; }
    .cc-node.cc-meditate-active .cc-ni { color: #16B7C2 !important; }
    .cc-node.cc-meditate-active .cc-nl { color: rgba(22,183,194,.9) !important; }
    .cc-ni { display: flex !important; align-items: center !important; justify-content: center !important; color: #0c3e6f !important; transition: color .18s ease !important; }
    .cc-ni svg { width: ${ICON_SIZE}px !important; height: ${ICON_SIZE}px !important; stroke: currentColor !important; fill: none !important; }
    .cc-nl { font-family: -apple-system,BlinkMacSystemFont,sans-serif !important; font-size: 25px !important; font-weight: 500 !important; letter-spacing: .04em !important; color: #2a5a8a !important; text-align: center !important; line-height: 1.2 !important; max-width: ${LABEL_WIDTH}px !important; transition: color .18s ease !important; }
    .cc-sub-node {
      all: initial; position: fixed !important;
      width: ${SUB_NODE_SIZE}px !important; height: ${SUB_NODE_SIZE}px !important;
      border-radius: 50% !important; background: rgba(255,255,255,.96) !important;
      border: 1.5px solid rgba(22,183,194,.28) !important;
      box-shadow: 0 4px 18px rgba(12,62,111,.16), 0 0 0 4px rgba(22,183,194,.07) !important;
      display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      gap: 5px !important; cursor: pointer !important;
      pointer-events: none !important; visibility: hidden !important; z-index: 2147483645 !important;
    }
    .cc-sub-node.cc-sub-in { visibility: visible !important; pointer-events: auto !important; animation: ccSubIn .42s cubic-bezier(.34,1.56,.64,1) forwards !important; }
    .cc-sub-node.cc-sub-out { visibility: visible !important; pointer-events: none !important; animation: ccSubOut .22s cubic-bezier(.4,0,1,1) forwards !important; }
    .cc-sub-node.cc-sub-float { visibility: visible !important; pointer-events: auto !important; animation: ccSubFloat var(--sf-dur,3.2s) var(--sf-off,0ms) ease-in-out infinite !important; }
    .cc-sub-node:hover { background: #16B7C2 !important; border-color: rgba(22,183,194,.7) !important; box-shadow: 0 6px 22px rgba(22,183,194,.42) !important; }
    .cc-sub-node:hover .cc-sub-ni { color: #fff !important; }
    .cc-sub-node:hover .cc-sub-nl { color: rgba(255,255,255,.92) !important; }
    .cc-sub-ni { display: flex !important; align-items: center !important; justify-content: center !important; color: #0c3e6f !important; transition: color .18s ease !important; }
    .cc-sub-ni svg { width: ${SUB_ICON_SIZE}px !important; height: ${SUB_ICON_SIZE}px !important; stroke: currentColor !important; fill: none !important; }
    .cc-sub-nl { font-family: -apple-system,BlinkMacSystemFont,sans-serif !important; font-size: 8px !important; font-weight: 500 !important; letter-spacing: .03em !important; color: #2a5a8a !important; text-align: center !important; line-height: 1.2 !important; max-width: ${SUB_LABEL_WIDTH}px !important; transition: color .18s ease !important; }
    .cc-sub-connector { position: fixed !important; pointer-events: none !important; z-index: 2147483644 !important; }
    #cc-bd { position: fixed !important; inset: 0 !important; background: transparent !important; pointer-events: auto !important; z-index: 2147483639 !important; }
  `
  document.head.appendChild(style)
}

// ══════════════════════════════════════════════════════════════════
//  FAB + RADIAL MENU  (vanilla JS — runs outside React tree)
// ══════════════════════════════════════════════════════════════════
function initWidget(iconSrc: string) {
  if (document.getElementById("cc-fab")) return
  injectGlobalStyles()

  const r1 = Object.assign(document.createElement("div"), { className: "cc-ring", id: "cc-r1" })
  const r2 = Object.assign(document.createElement("div"), { className: "cc-ring", id: "cc-r2" })
  document.body.append(r1, r2)

  const fab = document.createElement("button")
  fab.id = "cc-fab"
  fab.innerHTML = `
    <img id="cc-fab-img" src="${iconSrc}" alt="logo" />
    <div id="cc-fab-timer">
      <span id="cc-fab-timer-label">25:00</span>
      <span id="cc-fab-timer-mode">Focus</span>
    </div>
  `
  document.body.appendChild(fab)

  // ── Pomo tick ──
  window.addEventListener(CC_POMO_TICK, (e: Event) => {
    const { timeLeft, running, mode } = (e as CustomEvent<{ timeLeft: number; running: boolean; mode: PomodoroMode }>).detail
    const timerLabel = document.getElementById("cc-fab-timer-label")
    const timerMode  = document.getElementById("cc-fab-timer-mode")
    if (timerLabel) timerLabel.textContent = fmt(timeLeft)
    if (timerMode)  timerMode.textContent  = mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"
    if (running) {
      fab.classList.add("cc-pomo-active")
      fab.style.animation = "none"
    } else {
      fab.classList.remove("cc-pomo-active")
      fab.style.animation = ""
    }
  })

  let isOpen = false, nodes: HTMLButtonElement[] = [], bd: HTMLElement | null = null
  let subNodes: HTMLButtonElement[] = [], subConnectors: SVGSVGElement[] = []
  let subHoverTimer: ReturnType<typeof setTimeout> | null = null
  let subCloseTimer: ReturnType<typeof setTimeout> | null = null
  let subOpen = false, meditateBtnRef: HTMLButtonElement | null = null

  const openScreen = (screen: string) => dispatch(CC_OPEN, { screen })

  const openSubNodes = (mediateBtn: HTMLButtonElement, nodeData: typeof NODES[1]) => {
    if (subOpen) return
    subOpen = true
    mediateBtn.classList.add("cc-meditate-active")
    mediateBtn.classList.remove("cc-float")

    const mr = mediateBtn.getBoundingClientRect()
    const mcx = mr.left + mr.width / 2, mcy = mr.top + mr.height / 2

    nodeData.subNodes!.forEach((sn, i) => {
      const rad = (sn.angle * Math.PI) / 180
      const sx = mcx + Math.cos(rad) * SUB_RADIUS - SUB_OFFSET
      const sy = mcy + Math.sin(rad) * SUB_RADIUS - SUB_OFFSET

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement
      svg.setAttribute("class", "cc-sub-connector")
      const snCx = sx + SUB_OFFSET, snCy = sy + SUB_OFFSET
      const minX = Math.min(mcx, snCx) - 8, minY = Math.min(mcy, snCy) - 8
      const w = Math.abs(snCx - mcx) + 16, h = Math.abs(snCy - mcy) + 16
      Object.assign(svg.style, { left: `${minX}px`, top: `${minY}px`, width: `${w}px`, height: `${h}px`, overflow: "visible", opacity: "0", transition: `opacity .3s ease ${i * 55 + 60}ms` })
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute("x1", `${mcx - minX}`); line.setAttribute("y1", `${mcy - minY}`)
      line.setAttribute("x2", `${snCx - minX}`); line.setAttribute("y2", `${snCy - minY}`)
      line.setAttribute("stroke", "rgba(22,183,194,.22)"); line.setAttribute("stroke-width", "1.5"); line.setAttribute("stroke-dasharray", "4 4")
      svg.appendChild(line); document.body.appendChild(svg); subConnectors.push(svg)
      setTimeout(() => { svg.style.opacity = "1" }, 10)

      const btn = document.createElement("button") as HTMLButtonElement
      btn.className = "cc-sub-node"
      Object.assign(btn.style, { left: `${sx}px`, top: `${sy}px` })
      btn.style.setProperty("--sf-dur", `${3.2 + i * 0.22}s`)
      btn.style.setProperty("--sf-off", `${300 + i * 60}ms`)
      btn.innerHTML = `<span class="cc-sub-ni">${sn.icon}</span><span class="cc-sub-nl">${sn.label}</span>`
      btn.addEventListener("mouseenter", () => { if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null } })
      btn.addEventListener("mouseleave", () => { subCloseTimer = setTimeout(closeSubNodes, 180) })
      btn.addEventListener("click", e => {
        e.stopPropagation(); closeSubNodes(); closeMenu()
        openScreen(sn.id)
      })
      document.body.appendChild(btn); subNodes.push(btn)
      setTimeout(() => {
        btn.classList.add("cc-sub-in")
        setTimeout(() => { btn.classList.remove("cc-sub-in"); btn.classList.add("cc-sub-float") }, 420 + i * 55)
      }, i * 55 + 10)
    })
  }

  const closeSubNodes = (immediate = false) => {
    if (!subOpen) return; subOpen = false
    if (meditateBtnRef) {
      meditateBtnRef.classList.remove("cc-meditate-active")
      if (isOpen) setTimeout(() => meditateBtnRef?.classList.add("cc-float"), 80)
    }
    subConnectors.forEach(svg => { svg.style.opacity = "0"; setTimeout(() => svg.remove(), immediate ? 0 : 220) })
    subConnectors = []
    subNodes.forEach((btn, i) => {
      btn.classList.remove("cc-sub-float", "cc-sub-in")
      if (immediate) { btn.remove(); return }
      btn.classList.add("cc-sub-out")
      setTimeout(() => btn.remove(), 260 + i * 30)
    })
    subNodes = []
  }

  const closeMenu = () => {
    if (!isOpen) return; isOpen = false
    fab.classList.remove("cc-open"); closeSubNodes(true)
    r1.classList.remove("cc-vis"); r2.classList.remove("cc-vis")
    bd?.remove(); bd = null
    nodes.forEach((btn, i) => {
      btn.classList.remove("cc-float")
      Object.assign(btn.style, { transition: `transform .25s cubic-bezier(.4,0,1,1) ${i * 25}ms, opacity .18s ease ${i * 25}ms`, transform: "scale(0.3)", opacity: "0" })
    })
    setTimeout(() => { nodes.forEach(b => b.remove()); nodes = []; meditateBtnRef = null }, 380)
  }

  const openMenu = () => {
    isOpen = true; fab.classList.add("cc-open")
    r1.classList.add("cc-vis"); r2.classList.add("cc-vis")
    bd = document.createElement("div"); bd.id = "cc-bd"

    // ✅ FIX 2: Backdrop click — agar subnodes open hain to sirf subnodes close karo,
    // warna pura menu close karo
    bd.addEventListener("click", () => {
      if (subOpen) {
        closeSubNodes()
      } else {
        closeMenu()
      }
    })

    document.body.appendChild(bd)

    const fr = fab.getBoundingClientRect()
    const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2
    nodes = []

    NODES.forEach((node, i) => {
      const rad = (node.angle * Math.PI) / 180
      const btn = document.createElement("button") as HTMLButtonElement
      btn.className = "cc-node"
      Object.assign(btn.style, { left: `${cx + Math.cos(rad) * RADIUS - OFFSET}px`, top: `${cy + Math.sin(rad) * RADIUS - OFFSET}px` })
      btn.style.setProperty("--f-dur", `${3.1 + i * 0.28}s`)
      btn.style.setProperty("--f-off", `${400 + i * 70}ms`)
      btn.innerHTML = `<span class="cc-ni">${node.icon}</span><span class="cc-nl">${node.label}</span>`

      if (node.id === "meditate" && node.subNodes) {
        meditateBtnRef = btn

        // ✅ Hover pe open (with delay)
        btn.addEventListener("mouseenter", () => {
          if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null }
          if (!subOpen) {
            subHoverTimer = setTimeout(() => {
              if (meditateBtnRef) openSubNodes(meditateBtnRef, node as typeof NODES[1])
            }, 220)
          }
        })

        btn.addEventListener("mouseleave", () => {
          if (subHoverTimer) { clearTimeout(subHoverTimer); subHoverTimer = null }
          // ✅ KEY FIX: Agar subnodes already open hain to meditate se mouse hatane pe
          // close mat karo — sirf tab close ho jab subnode se bhi bahar jaaye
          if (!subOpen) {
            subCloseTimer = setTimeout(closeSubNodes, 200)
          }
        })

        // ✅ FIX 3: Click pe toggle — open tha to close, band tha to open
        btn.addEventListener("click", e => {
          e.stopPropagation()
          if (subOpen) {
            closeSubNodes()
          } else {
            if (meditateBtnRef) openSubNodes(meditateBtnRef, node as typeof NODES[1])
          }
        })

        return // meditate node ka apna click handler set ho gaya, neeche wala skip
      }

      btn.addEventListener("click", e => {
        e.stopPropagation()
        closeMenu()
        if (node.id === "therapist" && node.url) {
          ;(chrome as any).tabs?.create({ url: node.url }) ?? window.open(node.url, "_blank")
          return
        }
        openScreen(node.id)
      })

      document.body.appendChild(btn); nodes.push(btn)
      setTimeout(() => {
        Object.assign(btn.style, { transition: `transform .4s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms, opacity .22s ease ${i * 55}ms`, transform: "scale(1)" })
        btn.classList.add("cc-vis")
        setTimeout(() => btn.classList.add("cc-float"), 420 + i * 55)
      }, 10)
    })

    // Meditate node bhi nodes array mein push karo (tha nahi pehle agar return kiya)
    // Actually original code mein push nodes ke baad hota tha — yahan fix karo:
    // Sab nodes push ho chuke hain loop mein, meditate return se pehle push nahi hua
    // Isliye meditate btn ko manually push karte hain
    if (meditateBtnRef && !nodes.includes(meditateBtnRef)) {
      document.body.appendChild(meditateBtnRef)
      nodes.push(meditateBtnRef)
      const i = NODES.findIndex(n => n.id === "meditate")
      setTimeout(() => {
        Object.assign(meditateBtnRef!.style, { transition: `transform .4s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms, opacity .22s ease ${i * 55}ms`, transform: "scale(1)" })
        meditateBtnRef!.classList.add("cc-vis")
        setTimeout(() => meditateBtnRef?.classList.add("cc-float"), 420 + i * 55)
      }, 10)
    }
  }

  // Expose openMenu to React via event
  window.addEventListener(CC_OPEN_MENU, openMenu)

  // ✅ FIX 1: FAB click — toggle open/close
  fab.addEventListener("click", () => {
    if (fab.classList.contains("cc-pomo-active")) {
      dispatch(CC_OPEN, { screen: "pomodoro" })
      return
    }
    // Agar menu already open hai to band karo
    if (isOpen) {
      closeSubNodes()
      closeMenu()
      return
    }
    // Warna React ko batao (auth check ke liye)
    dispatch("cc:fab-clicked")
  })

  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSubNodes(); if (isOpen) closeMenu() } })
}

// ══════════════════════════════════════════════════════════════════
//  ROOT REACT COMPONENT
// ══════════════════════════════════════════════════════════════════

export default function Widget() {
  const [activeScreen, setActiveScreen] = useState<string | null>(null)
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null)
  const { isAuthenticated, isHydrated, hydrate } = useAuthStore()

  // Hydrate auth state from storage on mount
  useEffect(() => { hydrate() }, [])

  useEffect(() => {
    const el = document.getElementById("cc-root-container")
    if (el) setOverlayRoot(el)
  }, [])

  useEffect(() => {
    initWidget(icon)
  }, [])

  useEffect(() => {
    // Handle FAB click: auth gate
    const onFabClick = () => {
      console.log("fab clicked", { isHydrated, isAuthenticated })
      if (!isHydrated) return // wait for hydration
      if (!isAuthenticated) {
        setActiveScreen("auth")
      } else {
        // Tell vanilla JS to open the radial menu
        window.dispatchEvent(new CustomEvent("cc:open-menu"))
      }
    }

    const onOpen = (e: Event) => {
      const screen = (e as CustomEvent<{ screen: string }>).detail?.screen
      if (screen) setActiveScreen(screen)
    }
    const onClose = () => setActiveScreen(null)

    window.addEventListener("cc:fab-clicked", onFabClick)
    window.addEventListener(CC_OPEN, onOpen)
    window.addEventListener(CC_CLOSE, onClose)
    return () => {
      window.removeEventListener("cc:fab-clicked", onFabClick)
      window.removeEventListener(CC_OPEN, onOpen)
      window.removeEventListener(CC_CLOSE, onClose)
    }
  }, [isAuthenticated, isHydrated])

  const close = () => {
    setActiveScreen(null)
    dispatch(CC_CLOSE)
  }

  // After successful auth: close auth overlay and open the radial menu
  const handleAuthSuccess = () => {
    setActiveScreen(null)
    // Small delay so state updates propagate
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("cc:open-menu"))
    }, 120)
  }

  const screenEl = (() => {
    switch (activeScreen) {
      case "auth":
        return <AuthScreen onSuccess={handleAuthSuccess} onClose={close} />
      case "chat":
        return <ChatScreen onBack={close} />
      case "breathe":
        return <BreatheScreen onBack={close} />
      case "sounds":
        return <SoundsScreen onBack={close} />
      case "pomodoro":
        return (
          <PomodoroScreen
            onBack={() => {
              dispatch(CC_POMO_TICK, { timeLeft: 0, running: false, mode: "focus" })
              close()
            }}
            onTick={(timeLeft, running, mode) => {
              dispatch(CC_POMO_TICK, { timeLeft, running, mode })
            }}
            onMinimize={close}
          />
        )
      case "quote":
        return <QuoteScreen onBack={close} />
      default:
        return null
    }
  })()

  if (!screenEl) return null

  const isAuthScreen = activeScreen === "auth"
  return overlayRoot
    ? createPortal(
      <QueryClientProvider client={queryClient}>
        <OverlayShell onClose={close} wide={isAuthScreen}>
         
           {screenEl}
        </OverlayShell>
      </QueryClientProvider>,
      overlayRoot
    ) : null
}