import { useEffect, useState } from "react";
import { NODES } from "./MenuScreen";

// ─── Radial Node ──────────────────────────────────────────────────────────────
export function RadialNode({ node, x, y, onClick }: { node: typeof NODES[0]; x: number; y: number; onClick: () => void }) {
  const [hov, setHov] = useState(false)
  const [mounted, setMounted] = useState(false)
  const delay = NODES.indexOf(node) * 75 + 80

  useEffect(() => { const t = setTimeout(() => setMounted(true), delay); return () => clearTimeout(t) }, [delay])

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="absolute z-[4] cursor-pointer"
      style={{
        left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)`,
        opacity: mounted ? 1 : 0,
        animation: mounted
          ? `popIn .32s cubic-bezier(.22,1,.36,1) both, floatY ${3.1 + NODES.indexOf(node) * .28}s ${delay + 340}ms ease-in-out infinite`
          : "none",
      }}
    >
      <div
        className="flex flex-col items-center justify-center rounded-full transition-all duration-200"
        style={{
          width: 66, height: 66,
          background: hov ? "#16B7C2" : "rgba(255,255,255,.95)",
          border: `1.5px solid ${hov ? "rgba(22,183,194,.5)" : "rgba(12,62,111,.1)"}`,
          boxShadow: hov ? "0 8px 28px rgba(22,183,194,.35)" : "0 4px 16px rgba(12,62,111,.14)",
          gap: 5,
          backdropFilter: "blur(6px)",
        }}
      >
        <span className="flex transition-colors duration-200" style={{ color: hov ? "#FFFFFF" : "#0c3e6f", stroke: "currentColor" }}>
          {node.icon}
        </span>
        <span
          className="text-[8.5px] font-semibold tracking-wide transition-colors duration-200"
          style={{ color: hov ? "rgba(255,255,255,.92)" : "#2a5a8a" }}
        >
          {node.label}
        </span>
      </div>
    </div>
  )
}