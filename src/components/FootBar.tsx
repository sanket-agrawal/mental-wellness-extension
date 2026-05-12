export function FooterBar() {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-[18px] pb-3 pt-2" style={{ pointerEvents: "none" }}>
      <a
        href="https://catalystcare.in" target="_blank" rel="noreferrer"
        className="text-[10.5px] font-medium flex items-center gap-0.5 no-underline transition-colors duration-200"
        style={{ color: "#6a8fab", pointerEvents: "all" }}
        onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#16B7C2" }}
        onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#6a8fab" }}
      >
        Open CatalystCare 
      </a>
      <span className="text-[9px] font-normal" style={{ color: "#a0c4e0" }}>CatalystCare © 2026</span>
    </div>
  )
}