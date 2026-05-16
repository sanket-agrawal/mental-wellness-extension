export function TopBar({
  title,
  onBack,
}: {
  title: string
  onBack: () => void
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

      
    </div>
  )
}