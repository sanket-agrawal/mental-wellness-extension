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
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: 420,
        background: "linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #e0e7ff 100%)",
        position: "relative",
        overflow: "hidden"
      }}
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

      {/* Ambient Background Elements */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div
          className="blob-1"
          style={{
            position: "absolute",
            top: -64,
            right: -64,
            width: 160,
            height: 160,
            background: "linear-gradient(135deg, rgba(191,219,254,0.3), rgba(165,180,252,0.3))",
            borderRadius: "50%",
            filter: "blur(40px)"
          }}
        />
        <div
          className="blob-2"
          style={{
            position: "absolute",
            bottom: -64,
            left: -64,
            width: 192,
            height: 192,
            background: "linear-gradient(135deg, rgba(216,180,254,0.3), rgba(249,168,212,0.3))",
            borderRadius: "50%",
            filter: "blur(40px)"
          }}
        />
      </div>

      <TopBar title="Meditation" onBack={onBack} showBack={!hideBackButton} />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "12px 24px",
          textAlign: "center"
        }}
      >
        <h2
          style={{
            fontWeight: "bold",
            color: "#0c3e6f",
            marginBottom: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8
          }}
        >
          <Wind style={{ width: 16, height: 16 }} />
          Breathing Practice
        </h2>
        <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 32 }}>4-4-4-4 Box Breathing Technique</p>

        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          {/* Outer Ring */}
          <div
            className="breathing-ring"
            style={{
              position: "absolute",
              width: 160,
              height: 160,
              borderRadius: "50%",
              border: "4px solid #c7d2fe"
            }}
          />

          {/* Breathing Circle */}
          <div
            style={{
              width: 112,
              height: 112,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
              position: "relative",
              overflow: "hidden",
              transform: `scale(${circleScale})`,
              backgroundColor: circleColor,
              transition: "transform 3.5s ease-in-out, background-color 0.5s ease-in-out"
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
                borderRadius: "50%"
              }}
            />

            <div key={breathing} className="fade-in-scale" style={{ textAlign: "center", zIndex: 10 }}>
              <div style={{ fontSize: 14, fontWeight: "bold", color: "white", lineHeight: 1.2 }}>
                {breathing}
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 10 }}>4 seconds</div>
            </div>

            <div
              className="breathing-pulse-ring"
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)"
              }}
            />
          </div>
        </div>

        <p
          className="breathing-caption"
          style={{ color: "#6b7280", fontSize: 12, fontStyle: "italic", marginTop: 20, marginBottom: 20 }}
        >
          Follow the rhythm • Breathe with intention
        </p>

        {/* Balloon Instructions */}
        <div
          className="fade-in-up"
          style={{
            width: "100%",
            maxWidth: 320,
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(12px)",
            borderRadius: 16,
            padding: 16,
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
            border: "1px solid rgba(255,255,255,0.3)",
            textAlign: "left"
          }}
        >
          <h3
            style={{
              fontSize: 12,
              fontWeight: "bold",
              color: "#1f2937",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 6
            }}
          >
            <ListChecks style={{ width: 14, height: 14, color: "#0c3e6f" }} />
            How to Use the Breathing Balloon
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {balloonInstructions.map((instruction: string, j: number) => (
              <div
                key={j}
                className="fade-in-up"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  animationDelay: `${j * 0.08}s`
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    backgroundColor: "#0c3e6f",
                    color: "white",
                    fontSize: 9,
                    fontWeight: 600,
                    flexShrink: 0,
                    marginTop: 2
                  }}
                >
                  {j + 1}
                </div>
                <span style={{ color: "#4b5563", fontSize: 11, lineHeight: 1.4 }}>
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