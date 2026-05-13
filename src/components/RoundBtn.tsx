export const RoundBtn = ({ onClick, size = 44, children }: { onClick: () => void; size?: number; children: React.ReactNode }) => {
  return (
    <button onClick={onClick}
      style={{ width: size, height: size, borderRadius: "50%", border: "1.5px solid rgba(12,62,111,.15)", background: "none", cursor: "pointer", fontSize: 15, color: "#4a7099", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,183,194,.1)"; e.currentTarget.style.borderColor = "#16B7C2" }}
      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "rgba(12,62,111,.15)" }}
    >{children}</button>
  )
}