import { useEffect, useRef, useState } from "react"
import { TopBar } from "../Topbar"
import { HoverBtn } from "../HoverBtn"
export const BREATHE_STEPS = [
  { label: "Inhale",  duration: 4, instruction: "Breathe in slowly through your nose, filling your lungs completely." },
  { label: "Hold",    duration: 4, instruction: "Hold gently. Let stillness settle in." },
  { label: "Exhale",  duration: 6, instruction: "Release slowly through your mouth. Let everything go." },
]

export function BreatheScreen({ onBack }: { onBack: () => void }) {
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
