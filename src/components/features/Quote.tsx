import { FooterBar } from "~src/components/FootBar";
import { TopBar } from "~src/components/Topbar";
import { AFFIRMATIONS, FEELING_OPTIONS, randFrom } from "~src/lib/constants/contant";
import type { FeelingOption, Quote } from "~src/lib/types";
import { useState } from "react";





export function QuoteScreen({ quote, onBack, onNext }: { quote: Quote; onBack: () => void; onNext: () => void }) {
  const [feeling, setFeeling] = useState<string | null>(null)
  const [affirmation] = useState(() => randFrom(AFFIRMATIONS))

  return (
    <div className="h-full flex flex-col" style={{ background: "#EFF6FF" }}>
      <TopBar title="A Word for You" onBack={onBack} />

      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center pb-2">
        <div className="text-[58px] leading-[0.7] mb-5 font-serif" style={{ color: "rgba(12,62,111,.11)" }}>"</div>

        <p key={quote.text} className="slide-in text-[16px] font-light leading-[1.68] tracking-tight mb-4 max-w-[272px]" style={{ color: "#0c3e6f" }}>
          {quote.text}
        </p>

        <div className="w-7 h-px mb-3" style={{ background: "rgba(12,62,111,.15)" }} />

        <p key={quote.author} className="slide-in text-[10.5px] font-normal tracking-[1.4px] uppercase mb-6" style={{ color: "#8aadcc" }}>
          — {quote.author}
        </p>

        {/* Feeling */}
        <div className="mb-5">
          <p className="text-[10.5px] mb-2.5" style={{ color: "#8aadcc" }}>How does this land with you?</p>
          <div className="flex gap-2 justify-center flex-wrap">
            {FEELING_OPTIONS.map(f => (
              <button
                key={f.label}
                onClick={() => { setFeeling(f.label); setTimeout(() => setFeeling(null), 2200) }}
                className="px-3 py-1.5 rounded-full text-[11px] transition-all duration-200"
                style={{
                  border: `1px solid ${feeling === f.label ? "#16B7C2" : "rgba(12,62,111,.12)"}`,
                  background: feeling === f.label ? "#16B7C2" : "rgba(255,255,255,.85)",
                  color: feeling === f.label ? "#FFFFFF" : "#2a5a8a",
                }}
              >
                {f.symbol} {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Affirmation card */}
        <div className="rounded-[11px] px-4 py-2.5 mb-5 max-w-[252px]"
          style={{ background: "rgba(255,255,255,.75)", border: "1px solid rgba(12,62,111,.07)" }}>
          <p className="text-[11.5px] font-light leading-relaxed italic" style={{ color: "#4a7099" }}>
            {affirmation}
          </p>
        </div>

        <button
          onClick={onNext}
          className="px-6 py-2.5 rounded-full text-[12px] font-medium tracking-wide transition-all duration-200"
          style={{ border: "1.5px solid rgba(12,62,111,.2)", background: "transparent", color: "#0c3e6f" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#16B7C2"; e.currentTarget.style.color = "#FFFFFF"; e.currentTarget.style.borderColor = "#16B7C2" }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#0c3e6f"; e.currentTarget.style.borderColor = "rgba(12,62,111,.2)" }}
        >
          Another thought →
        </button>
      </div>

      <FooterBar />
    </div>
  )
}
