export const HoverBtn = ({ onClick, style: extraStyle = {}, base = {}, children }: {
  onClick: () => void; style?: React.CSSProperties; base?: React.CSSProperties; children: React.ReactNode
}) =>{
  const defaultBase: React.CSSProperties = { background: "#0c3e6f", color: "#fff", border: "none", boxShadow: "0 4px 16px rgba(12,62,111,.22)", ...base }
  return (
    <button onClick={onClick}
      style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit", transition: "all .2s", ...defaultBase, ...extraStyle }}
      onMouseEnter={e => { e.currentTarget.style.background = "#16B7C2" }}
      onMouseLeave={e => { e.currentTarget.style.background = (base as any).background ?? "#0c3e6f" }}
    >{children}</button>
  )
}