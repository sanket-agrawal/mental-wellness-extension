import { ArrowRight } from "lucide-react"

export function TopBar({
  title,
  onBack,
  showBack = true,
}: {
  title: string
  onBack: () => void
  showBack?: boolean
}) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "16px 20px",
        background: "#F8FBFF",
        borderBottom: "1px solid rgba(12,62,111,.08)",
        flexShrink: 0,
      }}
    >
      {/* Center Title */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          fontSize: 14,
          fontWeight: 600,
          color: "#0c3e6f",
        }}
      >
        {title}
      </span>

      {/* Back Button — right side */}
      {showBack && (
        <button
          onClick={onBack}
          aria-label="Go back"
          style={{
            width: 30,
            height: 30,
            borderRadius: 9,
            border: "1px solid rgba(12,62,111,0.12)",
            background: "rgba(255,255,255,0.7)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3a6390",
            transition: "all 0.18s ease",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(22,183,194,0.1)"
            e.currentTarget.style.borderColor = "rgba(22,183,194,0.4)"
            e.currentTarget.style.color = "#0c3e6f"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.7)"
            e.currentTarget.style.borderColor = "rgba(12,62,111,0.12)"
            e.currentTarget.style.color = "#3a6390"
          }}
        >
          <ArrowRight size={16} strokeWidth={2.2} />
        </button>
      )}
    </div>
  )
}