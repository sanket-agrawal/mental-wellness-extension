import { BackBtn } from "./Backbtn";

export function TopBar({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div
      className="flex items-center justify-between px-5 pt-[18px] pb-3.5 flex-shrink-0"
      style={{ background: "#F8FBFF", borderBottom: "1px solid rgba(12,62,111,.08)" }}
    >
      <BackBtn onClick={onBack} />
      <span className="text-[13px] font-medium" style={{ color: "#0c3e6f" }}>{title}</span>
      <div className="w-7" />
    </div>
  )
}
