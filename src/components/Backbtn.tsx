import { useState } from "react"
import { ArrowRight } from "lucide-react"

export function BackBtn({ onClick }: { onClick: () => void }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
      style={{
        background: hov ? "#16B7C2" : "rgba(12,62,111,.06)",
        color: hov ? "#FFFFFF" : "#2a5a8a",
      }}
    >
      <ArrowRight size={14} strokeWidth={2} />
    </button>
  )
}