import { FEELING_OPTIONS, QUOTES } from "~src/lib/constants/contant"
import { useState, useMemo } from "react"
import { TopBar } from "../Topbar"

export function QuoteScreen({ onBack,hideBackButton }: { onBack: () => void,hideBackButton?:boolean }) {
  const [activeFeeling, setActiveFeeling] = useState<string | null>(null)
  const [reacted, setReacted] = useState<string | null>(null)

  const filtered = useMemo(() =>
    activeFeeling
      ? QUOTES.filter(q => q.feeling.label === activeFeeling)
      : QUOTES,
    [activeFeeling]
  )

  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))

  const quote = useMemo(() => {
    const idx = quoteIdx % filtered.length
    return filtered[idx]
  }, [quoteIdx, filtered])

  const nextQuote = () => setQuoteIdx(i => i + 1)

  const handleFeelingFilter = (label: string) => {
    if (activeFeeling === label) {
      setActiveFeeling(null)
    } else {
      setActiveFeeling(label)
      setQuoteIdx(0)
    }
    setReacted(null)
  }

  const handleReact = (label: string) => {
    setReacted(label)
    setTimeout(() => setReacted(null), 2200)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TopBar title="Positive Vibes ✨" onBack={onBack} showBack={!hideBackButton}/>

      <div style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 32px 24px",
        textAlign: "center",
      }}>

        {/* Opening quote mark */}
        <div style={{
          fontSize: 64,
          lineHeight: 0.6,
          marginBottom: 18,
          color: "rgba(12,62,111,.09)",
          fontFamily: "Georgia, serif",
          userSelect: "none",
        }}>
          "
        </div>

        {/* Quote text */}
        <p style={{
          fontSize: 16,
          fontWeight: 300,
          lineHeight: 1.72,
          letterSpacing: "-.02em",
          marginBottom: 16,
          maxWidth: 272,
          color: "#0c3e6f",
        }}>
          {quote.text}
        </p>

        {/* Divider */}
        <div style={{ width: 28, height: 1, background: "rgba(12,62,111,.15)", marginBottom: 12 }} />

        {/* Author */}
        <p style={{
          fontSize: 10.5,
          fontWeight: 400,
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          marginBottom: 12,
          color: "#8aadcc",
        }}>
          — {quote.author}
        </p>

          {/* Feeling filter pills */}
        <div style={{ marginBottom: 24, width: "100%" }}>
          <p style={{ fontSize: 10.5, marginBottom: 10, color: "#8aadcc" }}>
           What does your heart need right now? 💙
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            {FEELING_OPTIONS.map(f => (
              <button
                key={f.label}
                onClick={() => handleFeelingFilter(f.label)}
                style={{
                  padding: "5px 11px",
                  borderRadius: 99,
                  fontSize: 11,
                  cursor: "pointer",
                  border: `1px solid ${activeFeeling === f.label ? "#16B7C2" : "rgba(12,62,111,.12)"}`,
                  background: activeFeeling === f.label ? "#16B7C2" : "rgba(255,255,255,.85)",
                  color: activeFeeling === f.label ? "#fff" : "#2a5a8a",
                  transition: "all .2s",
                  fontWeight: activeFeeling === f.label ? 500 : 400,
                }}
              >
                {f.symbol} {f.label}
              </button>
            ))}
          </div>
        </div>


    
        {/* Next quote CTA */}
        <button
          onClick={nextQuote}
          style={{
            padding: "10px 24px",
            borderRadius: 99,
            fontSize: 12,
            fontWeight: 500,
            letterSpacing: ".04em",
            cursor: "pointer",
            border: "1.5px solid rgba(12,62,111,.2)",
            background: "transparent",
            color: "#0c3e6f",
            transition: "all .2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#16B7C2"
            e.currentTarget.style.color = "#fff"
            e.currentTarget.style.borderColor = "#16B7C2"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "#0c3e6f"
            e.currentTarget.style.borderColor = "rgba(12,62,111,.2)"
          }}
        >
          Another thought →
        </button>
      </div>
    </div>
  )
}