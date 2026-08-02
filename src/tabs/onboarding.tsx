import React, { useState } from "react"
import logo from "data-base64:~assets/logo.png"
import {
  FiMessageCircle,
  FiWind,
  FiMusic,
  FiClock,
  FiSun,
  FiSmile,
  FiLock,
  FiAlertTriangle,
  FiCheck,
  FiX,
  FiChevronDown,
  FiShield,
  FiZap,
  FiArrowRight,
} from "react-icons/fi"

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:    "#0c3e6f",
  navyMid: "#0e4d87",
  teal:    "#16B7C2",
  tealBg:  "#e6f9fa",
  white:   "#ffffff",
  border:  "#e2e8f0",
  text:    "#1e293b",
  muted:   "#64748b",
  light:   "#f8fafc",
  light2:  "#f1f5f9",
}

// ── Data ──────────────────────────────────────────────────────────────────────
const features = [
  { Icon: FiMessageCircle, name: "AI Companion",     desc: "Vent out and reflect with an empathetic AI companion available anytime." },
  { Icon: FiWind,          name: "Guided Breathing",  desc: "Box breathing and mindfulness exercises to calm your nervous system." },
  { Icon: FiMusic,         name: "Focus Sounds",      desc: "Rain, forest, and lo-fi soundscapes to keep you in deep flow." },
  { Icon: FiClock,         name: "Pomodoro Timer",    desc: "Science-backed work intervals to maintain focus and prevent burnout." },
  { Icon: FiSun,           name: "Daily Quotes",      desc: "Curated wellness quotes to keep you grounded through the day." },
  { Icon: FiSmile,         name: "Mood Check-in",     desc: "Track your emotional patterns and understand your wellbeing over time." },
]

const faqs = [
  {
    q: "Why does Cove need access to all websites?",
    a: "Cove injects a small floating UI widget on top of your active browser tab so you can access wellness tools without switching pages. Chrome applies the label \"read and change data on all websites\" to any extension that renders content on web pages - including Grammarly, Dark Reader, and others. We never access your page content.",
  },
  {
    q: "Does Cove read my browsing history or page content?",
    a: "No. Cove's content script only mounts a Shadow DOM widget on top of the page. It does not read, transmit, or store any content from the pages you visit - including text, form data, passwords, or URLs.",
  },
  {
    q: "What data does Cove actually collect?",
    a: "Only your account profile (name, email via Google login) and anonymised in-app usage data such as session counts and feature interactions - used solely to personalise your wellness experience. No browsing data is ever collected.",
  },
  {
    q: "Is my data shared with third parties?",
    a: "Never. Your data is stored securely within CatalystCare's infrastructure and is never sold, shared, or used for advertising.",
  },
]

// ── Hover button ──────────────────────────────────────────────────────────────
function HoverBtn({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "outline"
}) {
  const [hov, setHov] = useState(false)
  const isPrimary = variant === "primary"
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          "8px",
        padding:      "13px 28px",
        borderRadius: "7px",
        background:   isPrimary ? (hov ? C.teal : C.navy) : "transparent",
        color:        isPrimary ? C.white : hov ? C.teal : C.navy,
        border:       isPrimary ? "none" : `1.5px solid ${hov ? C.teal : C.navy}`,
        fontSize:     "14px",
        fontWeight:   600,
        cursor:       "pointer",
        fontFamily:   "inherit",
        transition:   "all 0.18s",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </button>
  )
}
function InstallBtn({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "outline"
}) {
  const [hov, setHov] = useState(false)
  const isPrimary = variant === "primary"
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display:      "inline-flex",
        alignItems:   "center",
        gap:          "8px",
        padding:      "13px 28px",
        borderRadius: "7px",
        background:   C.white,
        color:        isPrimary ? C.navy : hov ? C.teal : C.navy,
        border:       isPrimary ? "none" : `1.5px solid ${hov ? C.teal : C.navy}`,
        fontSize:     "14px",
        fontWeight:   600,
        cursor:       "pointer",
        fontFamily:   "inherit",
        transition:   "all 0.18s",
        letterSpacing: "-0.01em",
      }}
    >
      {children}
    </button>
  )
}



// ── FAQ item ──────────────────────────────────────────────────────────────────
function FaqItem({ q, a, open, onToggle, isLast }: {
  q: string; a: string; open: boolean; onToggle: () => void; isLast: boolean
}) {
  const [hov, setHov] = useState(false)
  return (
    <div style={{ borderBottom: isLast ? "none" : `1px solid ${C.border}` }}>
      <div
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display:        "flex",
          justifyContent: "space-between",
          alignItems:     "center",
          padding:        "20px 0",
          cursor:         "pointer",
          gap:            "24px",
          userSelect:     "none",
        }}
      >
        <span style={{ fontSize: "15px", fontWeight: 600, color: hov || open ? C.navy : C.text, lineHeight: 1.4, transition: "color 0.15s" }}>
          {q}
        </span>
        <FiChevronDown
          size={16}
          style={{
            flexShrink:  0,
            color:       open ? C.teal : C.muted,
            transform:   open ? "rotate(180deg)" : "rotate(0deg)",
            transition:  "transform 0.22s, color 0.15s",
          }}
        />
      </div>
      <div
        style={{
          maxHeight:  open ? "300px" : "0px",
          overflow:   "hidden",
          opacity:    open ? 1 : 0,
          transition: "max-height 0.35s ease, opacity 0.25s ease",
        }}
      >
        <div style={{ paddingBottom: "20px", fontSize: "14px", color: C.muted, lineHeight: 1.8 }}>
          {a}
        </div>
      </div>
    </div>
  )
}

// ── Pill label ────────────────────────────────────────────────────────────────
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display:       "inline-flex",
    alignItems:    "center",
    gap:           "6px",
    fontSize:      "12px",
    fontWeight:    600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color:         C.teal,
    marginBottom:  "14px",
  }}>
    {children}
  </span>
)

// ── Section heading ───────────────────────────────────────────────────────────
const SectionH2 = ({ children }: { children: React.ReactNode }) => (
  <h2 style={{ fontSize: "30px", fontWeight: 700, color: C.navy, letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: "12px" }}>
    {children}
  </h2>
)

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Onboarding() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: C.white, color: C.text, minHeight: "100vh", WebkitFontSmoothing: "antialiased" as React.CSSProperties["WebkitFontSmoothing"] }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { margin: 0; padding: 0; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════ HEADER */}
      <header style={{
        position:       "sticky",
        top:            0,
        zIndex:         50,
        background:     C.white,
        borderBottom:   `1px solid ${C.border}`,
        padding:        "0 48px",
        height:         "60px",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
      }}>
        <img src={logo} alt="CatalystCare" style={{ height: "32px", width: "auto", display: "block" }} />
      </header>

      {/* ═══════════════════════════════════════════════════════════ HERO */}
      <section style={{ background: C.light, borderBottom: `1px solid ${C.border}`, padding: "72px 48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "64px", alignItems: "center", maxWidth: "1200px", margin: "0 auto" }}>

          {/* Left */}
          <div>
            <div style={{
              display:      "inline-flex",
              alignItems:   "center",
              gap:          "8px",
              padding:      "5px 12px",
              background:   C.tealBg,
              borderRadius: "999px",
              marginBottom: "24px",
            }}>
              <span style={{ fontSize: "12px", fontWeight: 600, color: C.teal, letterSpacing: "0.04em" }}>
                Welcome - Cove is now installed
              </span>
            </div>

            <h1 style={{
              fontSize:      "clamp(36px, 3.5vw, 52px)",
              fontWeight:    800,
              color:         C.navy,
              lineHeight:    1.15,
              letterSpacing: "-0.04em",
              marginBottom:  "20px",
            }}>
              Your mental wellness<br />companion is ready.
            </h1>

            <p style={{ fontSize: "17px", color: C.muted, lineHeight: 1.75, marginBottom: "36px", maxWidth: "440px" }}>
              Cove gives you instant access to breathing exercises, focus tools, AI journaling, and more - from any webpage, without switching tabs.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <HoverBtn onClick={() => window.close()} variant="primary">
                Open Cove <FiArrowRight size={14} />
              </HoverBtn>
              <HoverBtn onClick={() => window.open("https://catalystcare.in/legal/extension/privacy-policy", "_blank")} variant="outline">
                 Privacy Policy
              </HoverBtn>
            </div>

            {/* Trust row */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px", marginTop: "32px", flexWrap: "wrap" }}>
              {[
                { icon: FiShield, text: "Privacy-first" },
                { icon: FiLock,   text: "No browsing data collected" },
                { icon: FiCheck,  text: "5.0 ★ on Chrome Web Store" },
              ].map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <t.icon size={13} color={C.teal} />
                  <span style={{ fontSize: "12px", color: C.muted, fontWeight: 500 }}>{t.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Chrome permission card mockup */}
          <div>
            <div style={{
              background:   C.white,
              border:       `1px solid ${C.border}`,
              borderRadius: "12px",
              overflow:     "hidden",
              boxShadow:    "0 1px 3px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.06)",
            }}>
              {/* Mock chrome dialog header */}
              <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: C.navy }}>About the Chrome warning</div>
                  <div style={{ fontSize: "12px", color: C.muted }}>What it means for Cove</div>
                </div>
              </div>

              {/* Warning notice */}
              <div style={{ padding: "16px 24px", background: "#fffbeb", borderBottom: `1px solid #fef3c7`, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                <FiAlertTriangle size={14} color="#d97706" style={{ flexShrink: 0, marginTop: "2px" }} />
                <p style={{ fontSize: "13px", color: "#92400e", lineHeight: 1.5, fontWeight: 500 }}>
                  Chrome shows: <em>"Read and change all your data on all websites"</em>
                </p>
              </div>

              {/* Explanation */}
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: "13px", color: C.muted, lineHeight: 1.75, marginBottom: "16px" }}>
                  This is Chrome&apos;s <strong style={{ color: C.text }}>generic label</strong> for any extension that displays a UI overlay on web pages - including Grammarly, Dark Reader, and others. Cove uses it <strong style={{ color: C.text }}>only</strong> to render its wellness widget.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { ok: true,  text: "Renders a floating UI widget on your active tab" },
                    { ok: true,  text: "Stores wellness data on secure CatalystCare servers" },
                    { ok: false, text: "Reads or records any page content" },
                    { ok: false, text: "Tracks your browsing or collects personal data" },
                  ].map((item, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "8px", background: item.ok ? "#f0fdf4" : "#fff7f7", border: `1px solid ${item.ok ? "#bbf7d0" : "#fecaca"}` }}>
                      <div style={{ flexShrink: 0, color: item.ok ? "#16a34a" : "#dc2626" }}>
                        {item.ok ? <FiCheck size={13} /> : <FiX size={13} />}
                      </div>
                      <span style={{ fontSize: "12.5px", color: C.text, fontWeight: 500 }}>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ FEATURES */}
      <section style={{ padding: "80px 48px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "48px" }}>
            <Pill>What&apos;s inside Cove</Pill>
            <SectionH2>Everything you need, on every page.</SectionH2>
            <p style={{ fontSize: "16px", color: C.muted, maxWidth: "480px", lineHeight: 1.7 }}>
              One floating button gives you access to your complete wellness toolkit without leaving your current workflow.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
            {features.map(({ Icon, name, desc }, i) => {
              const [hov, setHov] = useState(false)
              return (
                <div
                  key={i}
                  onMouseEnter={() => setHov(true)}
                  onMouseLeave={() => setHov(false)}
                  style={{
                    padding:      "24px",
                    border:       `1px solid ${hov ? C.teal : C.border}`,
                    borderRadius: "10px",
                    background:   hov ? C.light : C.white,
                    transition:   "all 0.18s",
                    cursor:       "default",
                  }}
                >
                  <div style={{
                    width:         "40px",
                    height:        "40px",
                    borderRadius:  "10px",
                    background:    C.tealBg,
                    border:        `1px solid rgba(22,183,194,0.2)`,
                    display:       "flex",
                    alignItems:    "center",
                    justifyContent:"center",
                    marginBottom:  "16px",
                    color:         C.teal,
                  }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ fontSize: "15px", fontWeight: 600, color: C.navy, marginBottom: "6px" }}>{name}</div>
                  <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.65 }}>{desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ HOW IT WORKS */}
      <section style={{ padding: "80px 48px", background: C.light, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <Pill> How to use Cove</Pill>
            <SectionH2>Three steps to begin.</SectionH2>
            <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.7, marginBottom: "36px" }}>
              Cove lives in your browser toolbar. No app switching, no separate tab - just instant access wherever you are.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {[
                { step: "01", title: "Click the Cove icon", desc: "Find the Cove icon in your Chrome toolbar (pin it for easy access)." },
                { step: "02", title: "Sign in or create account", desc: "Log in with Google or your CatalystCare credentials to sync your data." },
                { step: "03", title: "Access your tools", desc: "Open breathing exercises, focus timers, AI journaling and more - instantly." },
              ].map((item) => (
                <div key={item.step} style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                  <div style={{
                    flexShrink:    0,
                    width:         "36px",
                    height:        "36px",
                    borderRadius:  "8px",
                    background:    C.navy,
                    color:         C.white,
                    display:       "flex",
                    alignItems:    "center",
                    justifyContent:"center",
                    fontSize:      "11px",
                    fontWeight:    700,
                    letterSpacing: "0.02em",
                  }}>
                    {item.step}
                  </div>
                  <div>
                    <div style={{ fontSize: "15px", fontWeight: 600, color: C.navy, marginBottom: "4px" }}>{item.title}</div>
                    <div style={{ fontSize: "13px", color: C.muted, lineHeight: 1.65 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy callout */}
          <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "12px", overflow: "hidden" }}>
            <div style={{ padding: "24px", borderBottom: `1px solid ${C.border}`, background: C.navy }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "14px", fontWeight: 700, color: C.white }}>Our Privacy Commitment</span>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.65)", lineHeight: 1.65 }}>
                Cove is built on a privacy-first architecture. This is what we commit to every user.
              </p>
            </div>
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {[
                "We do not read any web page content you visit",
                "We do not sell or share your data with any third party",
                "We do not track your browsing history or behaviour",
                "Your wellness data is encrypted and stored securely",
                "You can delete your account and all data at any time",
              ].map((point, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                  <FiCheck size={14} color={C.teal} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <span style={{ fontSize: "13.5px", color: C.text, lineHeight: 1.5 }}>{point}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ FAQ */}
      <section style={{ padding: "80px 48px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "80px", alignItems: "flex-start" }}>
          <div style={{ position: "sticky", top: "80px" }}>
            <Pill> Questions</Pill>
            <SectionH2>Privacy &amp; permissions - answered.</SectionH2>
            <p style={{ fontSize: "15px", color: C.muted, lineHeight: 1.7, marginBottom: "24px" }}>
              We believe in full transparency. Here are the most common questions about how Cove handles permissions and your data.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <a
                href="https://catalystcare.in/legal/extension/privacy-policy"
                target="_blank"
                rel="noreferrer"
                style={{ fontSize: "13px", color: C.teal, fontWeight: 600, textDecoration: "none" }}
              >
                Read full Privacy Policy →
              </a>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}` }}>
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                q={faq.q}
                a={faq.a}
                open={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                isLast={i === faqs.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ CTA BANNER */}
      <section style={{ padding: "80px 48px", background: C.navy }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "40px", flexWrap: "wrap" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: C.white, letterSpacing: "-0.03em", marginBottom: "8px" }}>
              Ready to take care of your mind?
            </h2>
            <p style={{ fontSize: "15px", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              Click the Cove icon in your Chrome toolbar to get started.
            </p>
          </div>
          <InstallBtn onClick={() => window.close()} variant="primary">
            Open Cove now <FiArrowRight size={14} />
          </InstallBtn>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ FOOTER */}
      <footer style={{ padding: "24px 48px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logo} alt="CatalystCare" style={{ height: "24px", width: "auto", display: "block" }} />
          <span style={{ color: C.muted, fontWeight: 400, fontSize: "12px" }}>
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
        <div style={{ display: "flex", gap: "24px" }}>
          {[
            { label: "Privacy Policy", href: "https://catalystcare.in/legal/extension/privacy-policy" },
            { label: "Website",        href: "https://catalystcare.in" },
          ].map(({ label, href }) => {
            const [hov, setHov] = useState(false)
            return (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{ fontSize: "12px", color: hov ? C.teal : C.muted, textDecoration: "none", transition: "color 0.15s", fontWeight: 500 }}
              >
                {label}
              </a>
            )
          })}
        </div>
      </footer>

    </div>
  )
}
