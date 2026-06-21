import { useState, useEffect } from "react"
import { Wind, ListChecks } from "lucide-react"
import { TopBar } from "../Topbar"

type BreathingPhase = "Inhale" | "Hold" | "Exhale" | "Hold"

interface BreatheScreenProps {
  onBack?: () => void
  hideBackButton?: boolean
}

export function BreatheScreen({
  onBack = () => {},
  hideBackButton = false
}: BreatheScreenProps) {

  const [breathing, setBreathing] = useState<BreathingPhase>("Hold")
  const [breathingPhase, setBreathingPhase] = useState<number>(3)

  useEffect(() => {
    const steps: BreathingPhase[] = ["Inhale", "Hold", "Exhale", "Hold"]
    let i = 0
    const interval = setInterval(() => {
      setBreathing(steps[i % steps.length])
      setBreathingPhase(i % steps.length)
      i++
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const balloonInstructions: string[] = [
    "Watch the circle — it grows and shrinks on a steady cycle",
    "Breathe in as it expands (Inhale, 4s)",
    "Hold gently at its largest size (Hold, 4s)",
    "Breathe out as it contracts (Exhale, 4s)",
    "Hold briefly at the smallest size, then repeat (Hold, 4s)"
  ]


  const circleScale = breathingPhase < 2 ? 1.25 : 0.85
  const circleColor =
    breathingPhase === 0
      ? "#3b82f6"
      : breathingPhase === 1
        ? "#8b5cf6"
        : breathingPhase === 2
          ? "#06b6d4"
          : "#10b981"

  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: 420 }}
      className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
    >
      <style>{`
        @keyframes blob-pulse-1 {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.15) rotate(180deg); }
        }
        @keyframes blob-pulse-2 {
          0%, 100% { transform: scale(1.15) rotate(0deg); }
          50% { transform: scale(1) rotate(180deg); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes ring-pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes caption-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .blob-1 { animation: blob-pulse-1 20s ease-in-out infinite; }
        .blob-2 { animation: blob-pulse-2 25s ease-in-out infinite; }
        .breathing-ring { animation: spin-slow 16s linear infinite; }
        .breathing-pulse-ring { animation: ring-pulse 4s ease-in-out infinite; }
        .breathing-caption { animation: caption-pulse 4s ease-in-out infinite; }
        .fade-in-up { animation: fade-in-up 0.5s ease-out both; }
        .fade-in-scale { animation: fade-in-scale 0.4s ease-out both; }
      `}</style>

      {/* Ambient Background Elements (kept small so they stay contained) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="blob-1 absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-indigo-300/30 rounded-full blur-3xl" />
        <div className="blob-2 absolute -bottom-16 -left-16 w-48 h-48 bg-gradient-to-tr from-purple-200/30 to-pink-300/30 rounded-full blur-3xl" />
      </div>

      <TopBar title="Meditation" onBack={onBack} showBack={!hideBackButton} />

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-3 text-center">
        <h2 className="text-base font-bold text-[#0c3e6f] mb-1 flex items-center justify-center gap-2">
          <Wind className="w-4 h-4" />
          Breathing Practice
        </h2>
        <p className="text-xs text-gray-500 mb-8">4-4-4-4 Box Breathing Technique</p>

        <div className="relative flex items-center justify-center mb-5">
          {/* Outer Ring */}
          <div className="breathing-ring absolute w-40 h-40 rounded-full border-4 border-indigo-200" />

          {/* Breathing Circle */}
          <div
            style={{
              transform: `scale(${circleScale})`,
              backgroundColor: circleColor,
              transition: "transform 3.5s ease-in-out, background-color 0.5s ease-in-out"
            }}
            className="w-28 h-28 rounded-full flex items-center justify-center shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full" />

            <div key={breathing} className="fade-in-scale text-center z-10">
              <div className="text-sm font-bold text-white leading-tight">
                {breathing}
              </div>
              <div className="text-white/80 text-[10px]">4 seconds</div>
            </div>

            <div className="breathing-pulse-ring absolute inset-0 rounded-full border-2 border-white/30" />
          </div>
        </div>

        <p className="breathing-caption text-gray-500 text-xs italic mt-5 mb-5">
          Follow the rhythm • Breathe with intention
        </p>

        {/* Balloon Instructions */}
        <div className="fade-in-up w-full max-w-xs bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-md border border-white/30 text-left">
          <h3 className="text-xs font-bold text-gray-800 mb-2.5 flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-[#0c3e6f]" />
            How to Use the Breathing Balloon
          </h3>
          <div className="space-y-1.5">
            {balloonInstructions.map((instruction: string, j: number) => (
              <div
                key={j}
                className="fade-in-up flex items-start gap-2"
                style={{ animationDelay: `${j * 0.08}s` }}
              >
                <div className="flex items-center justify-center w-4 h-4 rounded-full bg-[#0c3e6f] text-white text-[9px] font-semibold flex-shrink-0 mt-0.5">
                  {j + 1}
                </div>
                <span className="text-gray-600 text-[11px] leading-snug">
                  {instruction}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}