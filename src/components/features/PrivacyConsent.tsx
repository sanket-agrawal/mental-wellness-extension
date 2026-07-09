import React, { useEffect, useRef, useState } from "react"

// ─── Shared policy section helpers ───────────────────────────────────────────
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{
    fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
    fontSize: 17, fontWeight: 700, color: "#0c3e6f", margin: "0 0 4px",
  }}>{children}</h2>
)

const H3 = ({ children }: { children: React.ReactNode }) => (
  <h3 style={{
    fontSize: 13, fontWeight: 700, color: "#0c3e6f", margin: "18px 0 6px",
    fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
  }}>{children}</h3>
)

const P = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <p style={{ margin: "0 0 12px", ...style }}>{children}</p>
)

const UL = ({ children }: { children: React.ReactNode }) => (
  <ul style={{ paddingLeft: 18, margin: "0 0 12px" }}>{children}</ul>
)

const LI = ({ children }: { children: React.ReactNode }) => (
  <li style={{ marginBottom: 6 }}>{children}</li>
)

const InfoBox = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    background: "#f0f9f9", borderLeft: "3px solid #16B7C2",
    padding: "10px 14px", borderRadius: "0 8px 8px 0",
    margin: "0 0 14px", fontSize: 12,
    fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
  }}>{children}</div>
)

// ─── Full policy content as JSX ───────────────────────────────────────────────
function PolicyContent() {
  return (
    <div style={{
      fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
      fontSize: 12.5, lineHeight: 1.65, color: "#2b2b2b",
    }}>
      <H2>Privacy Policy -Cove by CatalystCare</H2>
      <p style={{ fontSize: 11, color: "#8aadcc", margin: "0 0 18px" }}>
        Last updated: 5 July 2026 &nbsp;|&nbsp; Effective for: Cove browser extension
      </p>

      <P>
        This Privacy Policy explains how Cove by CatalystCare ("Cove," "we," "us") collects,
        uses, stores, and shares information when you install and use the Cove browser extension.
        Cove is operated by <strong>Concise Cube Global Wellness Private Limited</strong>, the
        legal entity behind the CatalystCare platform.
      </P>

      <H3>1. What Cove Does</H3>
      <P>
        Cove provides an in-browser wellness companion -a private space to express feelings
        (Vent Box), guided meditations, a focus/deep-work timer, mood check-ins, and one-tap
        access to book a session with a CatalystCare wellness practitioner.
      </P>

      <H3>2. Information We Collect</H3>
      <UL>
        <LI><strong>Account info:</strong> Name, email, phone -to create and secure your account.</LI>
        <LI><strong>Vent Box entries:</strong> Text you type and AI responses -to generate supportive replies.</LI>
        <LI><strong>Mood data:</strong> Self-reported mood/energy selections and timestamps.</LI>
        <LI><strong>Focus &amp; meditation usage:</strong> Session times and completion status.</LI>
        <LI><strong>Device &amp; technical data:</strong> Browser type, extension version, error logs.</LI>
      </UL>
      <InfoBox>
        Cove does <strong>not</strong> collect your general web browsing history, content of other
        websites, or search activity.
      </InfoBox>

      <H3>3. How We Use Your Information</H3>
      <UL>
        <LI>To provide and operate Cove's features</LI>
        <LI>To personalise your experience (mood trends, streaks)</LI>
        <LI>To process payments and manage subscriptions</LI>
        <LI>To connect you with a practitioner when you book a session</LI>
        <LI>To maintain security and fix bugs</LI>
      </UL>
      <P>We do <strong>not</strong> use your data for personalised advertising, and we do <strong>not</strong> sell your data.</P>

      <H3>4. Who We Share Information With</H3>
      <UL>
        <LI>
          <strong>AI processing:</strong> Vent Box conversations are processed by our self-hosted AI.
          On rare unavailability, requests may fall back to Google's Gemini API (as a data processor,
          not for advertising).
        </LI>
        <LI>
          <strong>Payment processors:</strong> Razorpay and Instamojo process subscription payments.
          We never store your card/UPI details.
        </LI>
        <LI>
          <strong>Practitioners:</strong> When you book, the practitioner receives your name, contact,
          and appointment time.
        </LI>
        <LI>
          <strong>Legal:</strong> We may disclose data if required by law or to protect user safety.
        </LI>
      </UL>

      <H3>5. Data Storage &amp; Security</H3>
      <UL>
        <LI>Data is transmitted using HTTPS/TLS and stored on access-controlled servers in India.</LI>
        <LI>Account data is retained while your account is active.</LI>
        <LI>If you delete your account, personal data is deleted/anonymised within 30 days.</LI>
      </UL>

      <H3>6. Your Rights (DPDP Act 2023)</H3>
      <UL>
        <LI><strong>Access</strong> a summary of personal data we hold</LI>
        <LI><strong>Correct or update</strong> inaccurate data</LI>
        <LI><strong>Erase</strong> your data (subject to legal retention)</LI>
        <LI><strong>Withdraw consent</strong> at any time</LI>
      </UL>

      <H3>7. Contact</H3>
      <P style={{ margin: "0 0 6px" }}>
        Concise Cube Global Wellness Private Limited<br />
        Jurisdiction: Pune, Maharashtra, India
      </P>
      <P>
        Email:{" "}
        <a href="mailto:techadmin@catalystcare.in" style={{ color: "#16B7C2" }}>
          techadmin@catalystcare.in
        </a>
      </P>
      <p style={{ margin: "14px 0 0", fontSize: 11, color: "#8aadcc" }}>
        © 2026 Concise Cube Global Wellness Private Limited. Cove and CatalystCare are brands of
        Concise Cube Global Wellness Private Limited.
      </p>
    </div>
  )
}

// ─── Shared consent dialog ────────────────────────────────────────────────────
export function PrivacyConsentDialog({ onAccept }: { onAccept: () => void }) {
  const [checked, setChecked] = useState(false)
  const [visible, setVisible] = useState(false)
  const [scrolledToBottom, setScrolledToBottom] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 20) {
      setScrolledToBottom(true)
    }
  }

  const handleAccept = () => {
    if (!checked) return
    chrome.storage.local.set({ cc_privacy_accepted: true })
    setVisible(false)
    setTimeout(onAccept, 340)
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 2147483647, pointerEvents: "auto",
      background: "rgba(8,28,58,0.55)",
      backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      opacity: visible ? 1 : 0,
      transition: "opacity .3s ease",
    }}>
      <div style={{
        width: 440, maxWidth: "calc(100vw - 32px)",
        background: "rgba(239,246,255,0.98)",
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(8,28,58,.38), 0 0 0 1px rgba(12,62,111,.1)",
        overflow: "hidden", display: "flex", flexDirection: "column",
        transform: visible ? "scale(1) translateY(0)" : "scale(.93) translateY(16px)",
        transition: "transform .36s cubic-bezier(.34,1.56,.64,1), opacity .3s ease",
        maxHeight: "calc(100vh - 48px)",
      }}>

        {/* Header */}
        <div style={{
          padding: "22px 24px 16px",
          background: "linear-gradient(135deg, #0c3e6f 0%, #0a5080 100%)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div>
              <h2 style={{
                margin: 0,
                fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
                fontSize: 16, fontWeight: 700, color: "#fff", letterSpacing: "0.01em",
              }}>Privacy Policy</h2>
              <p style={{
                margin: "2px 0 0", fontSize: 11.5,
                color: "#ffffff",
                fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
              }}>Please review before continuing with Cove</p>
            </div>
          </div>
        </div>

        {/* Scrollable policy body */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: "auto", padding: "18px 22px",
            minHeight: 0, maxHeight: 340,
          }}
        >
          <PolicyContent />
        </div>

        {/* Scroll hint */}
        {!scrolledToBottom && (
          <div style={{
            textAlign: "center", padding: "4px 0 2px",
            fontSize: 11, color: "#8aadcc",
            fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
            flexShrink: 0,
          }}>
            ↓ Scroll to read the full policy
          </div>
        )}

        {/* Footer */}
        <div style={{
          padding: "14px 22px 20px",
          borderTop: "1px solid rgba(12,62,111,.1)",
          background: "rgba(255,255,255,.6)",
          flexShrink: 0,
        }}>
          {/* Checkbox row */}
          <label style={{
            display: "flex", alignItems: "flex-start", gap: 10,
            cursor: "pointer", marginBottom: 14,
          }}>
            <div
              onClick={() => setChecked(v => !v)}
              style={{
                width: 18, height: 18, borderRadius: 5,
                border: checked ? "none" : "1.5px solid rgba(12,62,111,.3)",
                background: checked ? "#16B7C2" : "rgba(255,255,255,.9)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 1,
                transition: "all .18s ease",
                boxShadow: checked ? "0 2px 8px rgba(22,183,194,.35)" : "none",
                cursor: "pointer",
              }}
            >
              {checked && (
                <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                  <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{
              fontSize: 12, color: "#2b2b2b", lineHeight: 1.5,
              fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
              userSelect: "none",
            }}>
              By continuing, I agree with the{" "}
              <a
                href="https://catalystcare.in/legal/extension/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{ color: "#16B7C2", textDecoration: "underline" }}
              >
                Privacy Policy
              </a>
              {" "}of Cove extension
            </span>
          </label>

          {/* Accept button */}
          <button
            onClick={handleAccept}
            disabled={!checked}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 12,
              border: "none", cursor: checked ? "pointer" : "not-allowed",
              fontFamily: "-apple-system,BlinkMacSystemFont,sans-serif",
              fontSize: 13.5, fontWeight: 700, letterSpacing: "0.02em",
              background: checked
                ? "linear-gradient(135deg, #16B7C2 0%, #0ea5b0 100%)"
                : "rgba(12,62,111,.1)",
              color: checked ? "#fff" : "rgba(12,62,111,.35)",
              transition: "all .22s ease",
              boxShadow: checked ? "0 4px 18px rgba(22,183,194,.38)" : "none",
            }}
            onMouseEnter={e => { if (checked) e.currentTarget.style.transform = "translateY(-1px)" }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)" }}
          >
            {checked ? "Accept & Continue →" : "Read the policy above to continue"}
          </button>
        </div>
      </div>
    </div>
  )
}
