import { FooterBar } from "./FootBar"
import { RadialNode } from "./RadicalNodes"

import {
  MessageCircle,
  Brain,
  Timer,
  UserRound,
  Smile,
  LogOut
} from "lucide-react"

import logo from "../assets/logo.png"
import cc from "../assets/logo.svg"

export const RADIUS = 118

export const NODES = [
  {
    id: "chat",
    label: "Vent Out",
    angle: -90,
    icon: <MessageCircle size={20} strokeWidth={1.8} />
  },
  {
    id: "meditate",
    label: "Find Peace",
    angle: -18,
    icon: <Brain size={20} strokeWidth={1.8} />
  },
  {
    id: "pomodoro",
    label: "Stay Focused",
    angle: 54,
    icon: <Timer size={20} strokeWidth={1.8} />
  },
  {
    id: "quote",
    label: "Lift Me Up",
    angle: 126,
    icon: <Smile size={20} strokeWidth={1.8} />
  },
  {
    id: "therapist",
    label: "Seek Help",
    angle: 198,
    url: "https://catalystcare.in/therapists",
    icon: <UserRound size={20} strokeWidth={1.8} />
  }
]

// ─── Menu ─────────────────────────────────────────────────────
export function MenuScreen({
  onNode,
  openQuote,
  onLogout
}: {
  onNode: (id: string, url?: string) => void
  openQuote: () => void
  onLogout: () => void
}) {
  return (
    <div className="h-full relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-[18px] z-10">
        
        <img
          src={logo}
          alt="CatalystCare"
          style={{
            height: 28,
            width: "auto",
            filter: "drop-shadow(0 2px 6px rgba(12,62,111,.2))"
          }}
        />

        {/* Logout Button */}
        <button
          onClick={onLogout}
          className="
            w-10 h-10
            rounded-2xl
            bg-white/70
            backdrop-blur-xl
            border border-white/40
            shadow-lg
            flex items-center justify-center
            transition-all duration-300
            hover:scale-105
            hover:bg-red-50
            active:scale-95
          ">
          <LogOut
            size={18}
            className="text-slate-600"
            strokeWidth={2}
          />
        </button>
      </div>

      {/* Stage */}
      <div className="absolute inset-0 flex items-center justify-center">
        
        {/* Rings */}
        {[248, 298].map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: s,
              height: s,
              border:
                i === 0
                  ? "1px dashed rgba(12,62,111,.12)"
                  : "1px solid rgba(12,62,111,.06)",
              pointerEvents: "none"
            }}
          />
        ))}

        {/* Center */}
        <div
          className="absolute z-[5] flex flex-col items-center justify-center rounded-full bg-white"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%,-50%)",
            width: 70,
            height: 70,
            boxShadow: "0 4px 18px rgba(12,62,111,.25)"
          }}>
          
          <img
            src={cc}
            alt="CatalystCare"
            style={{
              width: 52,
              height: "auto"
            }}
          />
        </div>

        {/* Nodes */}
        {NODES.map((node) => {
          const rad = (node.angle * Math.PI) / 180

          return (
            <RadialNode
              key={node.id}
              node={node}
              x={Math.cos(rad) * RADIUS}
              y={Math.sin(rad) * RADIUS}
              onClick={() =>
                node.id === "quote"
                  ? openQuote()
                  : onNode(node.id, (node as any).url)
              }
            />
          )
        })}
      </div>

      <FooterBar />
    </div>
  )
}