import logo from "../assets/logo.png"

export function HomeScreen({
  visible,
  onStart
}: {
  visible: boolean
  onStart: () => void
}) {
  return (
    <div
      className="h-full flex flex-col items-center justify-center text-center px-8 py-9 transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}>
      
      {/* Logo */}
     <div className="relative flex items-center justify-center mb-6">
  <img
    src={logo}
    alt="CatalystCare"
    style={{ height: 28, width: "auto", filter: "drop-shadow(0 2px 6px rgba(12,62,111,.2))" }}
  />
</div>

      {/* Heading */}
      <h1
        className="text-[21px] font-light leading-snug tracking-tight mb-2"
        style={{ color: "#0c3e6f" }}>
        You deserve to feel at ease today.
      </h1>

      {/* Description */}
      <p
        className="text-[13px] font-light leading-relaxed mb-8 max-w-[230px]"
        style={{ color: "#4a7099" }}>
        Your quiet corner for therapy, tools, and calm — always within reach.
      </p>

      {/* Button */}
      <button
        className="w-full max-w-[210px] py-3.5 rounded-full text-[13.5px] font-medium tracking-wide transition-all duration-300"
        style={{
          background: "#0c3e6f",
          color: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(12,62,111,.25)"
        }}
        onClick={onStart}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "#16B7C2"
          e.currentTarget.style.transform = "translateY(-1px)"
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "#0c3e6f"
          e.currentTarget.style.transform = "translateY(0)"
        }}>
        Begin →
      </button>

      {/* Footer text */}
      <p
        className="mt-4 text-[10.5px] font-normal"
        style={{ color: "#8aadcc" }}>
        Verified therapists · Private · Free to start
      </p>
    </div>
  )
}