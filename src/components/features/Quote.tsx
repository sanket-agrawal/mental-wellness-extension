import { FEELING_OPTIONS, QUOTES } from "~src/lib/constants/contant"
import { useState } from "react"
import { TopBar } from "../Topbar"



export function QuoteScreen({ onBack }: { onBack: () => void }) {
  const [quoteIdx, setQuoteIdx] = useState(() => Math.floor(Math.random() * QUOTES.length))
  const [feeling, setFeeling] = useState<string | null>(null)
  const quote = QUOTES[quoteIdx]

  const nextQuote = () => setQuoteIdx(i => (i + 1) % QUOTES.length)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* TopBar — renamed to "Positive Vibes" */}
      <TopBar title="Positive Vibes ✨" onBack={onBack} />

      {/* Scrollable body — contained within fixed dialog height */}
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
          marginBottom: 28,
          color: "#8aadcc",
        }}>
          — {quote.author}
        </p>

        {/* Feeling reaction row */}
        <div style={{ marginBottom: 28 }}>
          <p style={{ fontSize: 10.5, marginBottom: 10, color: "#8aadcc" }}>
            How does this land with you?
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {FEELING_OPTIONS.map(f => (
              <button
                key={f.label}
                onClick={() => {
                  setFeeling(f.label)
                  setTimeout(() => setFeeling(null), 2200)
                }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 99,
                  fontSize: 11,
                  cursor: "pointer",
                  border: `1px solid ${feeling === f.label ? "#16B7C2" : "rgba(12,62,111,.12)"}`,
                  background: feeling === f.label ? "#16B7C2" : "rgba(255,255,255,.85)",
                  color: feeling === f.label ? "#fff" : "#2a5a8a",
                  transition: "all .2s",
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