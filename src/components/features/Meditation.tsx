import { FooterBar } from "~src/components/FootBar"
import { TopBar } from "~src/components/Topbar"
import { MEDITATE_STEPS } from "~src/lib/constants/contant"
import { useEffect, useRef, useState } from "react"




export function MeditateScreen({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState(false)
  const [stepIdx, setStepIdx] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [round, setRound] = useState(0)
  const itvRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = MEDITATE_STEPS[stepIdx]

  useEffect(() => {
    if (!active) return
    itvRef.current = setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= step.duration) {
          const next = (stepIdx + 1) % MEDITATE_STEPS.length
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
  const scale = 1 + progress * 0.11

  return (
    <div className="h-full flex flex-col" style={{ background: "#EFF6FF" }}>
      <TopBar title="Breathe" onBack={onBack} />

      <div className="flex-1 flex flex-col items-center justify-center px-7 pb-2 gap-0">
        {round > 0 && (
          <div className="text-[10px] font-normal tracking-widest uppercase mb-4" style={{ color: "#6a8fab" }}>
            Round {round}
          </div>
        )}

        {/* Orb */}
        <div
          className="rounded-full flex items-center justify-center mb-7 transition-all"
          style={{
            width: 108, height: 108,
            background: active ? "#0c3e6f" : "rgba(12,62,111,.08)",
            transform: `scale(${active ? scale : 1})`,
            transition: "transform .6s ease, background .5s ease",
            boxShadow: active ? `0 0 0 ${Math.round(14 * progress)}px rgba(22,183,194,.1)` : "none",
          }}
        >
          <span
            className="text-[10.5px] tracking-[1.5px] uppercase transition-colors duration-500"
            style={{ color: active ? "rgba(255,255,255,.85)" : "#6a8fab" }}
          >
            {active ? step.label : "Ready"}
          </span>
        </div>

        {/* Instruction */}
        <p key={stepIdx} className="slide-in text-[13.5px] font-light leading-[1.72] text-center max-w-[248px] mb-3" style={{ color: "#2a5a8a" }}>
          {active ? step.instruction : "Find a quiet moment. Let your shoulders drop. You're about to give yourself a gift."}
        </p>

        {/* Step dots */}
        {active && (
          <div className="flex gap-1.5 mb-5">
            {MEDITATE_STEPS.map((_, i) => (
              <div
                key={i}
                className="h-[4px] rounded-full transition-all duration-300"
                style={{ width: i === stepIdx ? 18 : 5, background: i === stepIdx ? "#16B7C2" : "rgba(12,62,111,.12)" }}
              />
            ))}
          </div>
        )}

        <div style={{ height: active ? 0 : 12 }} />

        <button
          onClick={toggle}
          className="px-8 py-3 rounded-full text-[13px] font-medium transition-all duration-250"
          style={{
            background: active ? "transparent" : "#0c3e6f",
            border: active ? "1.5px solid rgba(12,62,111,.2)" : "none",
            color: active ? "#0c3e6f" : "#FFFFFF",
            boxShadow: active ? "none" : "0 4px 16px rgba(12,62,111,.22)",
          }}
          onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#16B7C2" }}
          onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#0c3e6f" }}
        >
          {active ? "Pause" : "Begin"}
        </button>

        {!active && (
          <p className="text-[11px] font-light text-center mt-4 max-w-[210px] leading-relaxed" style={{ color: "#8aadcc" }}>
            4-4-6 breathing · Calms your nervous system
          </p>
        )}
      </div>

      <FooterBar />
    </div>
  )
}