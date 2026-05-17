import React, { useEffect, useRef, useState, useCallback } from "react"
import { createPortal } from "react-dom"
import { renderToStaticMarkup } from "react-dom/server"
import type { PlasmoCSConfig } from "plasmo"
import {
  MessageCircle, Brain, Timer, Smile, UserRound,
  Wind, Music, type LucideIcon
} from "lucide-react"
import icon from "data-base64:~assets/icon.png"
import AuthForm from "~src/components/auth/AuthForm"
import { useAuthStore } from "~src/lib/hooks/useAuthStore"
import { ChatScreen } from "~src/components/features/Ai/ChatScreen"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BreatheScreen } from "~src/components/features/Meditation"
import { SoundsScreen } from "~src/components/features/Sound"
import { QuoteScreen } from "~src/components/features/Quote"
import { PomodoroScreen } from "~src/components/features/Pomodoro"
import { pomoTimer } from "~src/lib/helpers/pomodoroTimer"
import { QUOTES } from "~src/lib/constants/contant"

export const config: PlasmoCSConfig = { matches: ["<all_urls>"] }

const queryClient = new QueryClient()

export const getRootContainer = () =>
  new Promise<HTMLElement>((resolve) => {
    const existing = document.getElementById("cc-root-container")
    if (existing) { resolve(existing); return }
    const container = document.createElement("div")
    container.id = "cc-root-container"
    container.style.cssText =
      "position:fixed;inset:0;width:100vw;height:100vh;z-index:2147483645;pointer-events:none;overflow:visible;"
    const inject = () => { document.body.appendChild(container); resolve(container) }
    if (document.body) inject()
    else document.addEventListener("DOMContentLoaded", inject, { once: true })
  })

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_SIZE = 180, ICON_SIZE = 38, LABEL_WIDTH = 238, OFFSET = 80, RADIUS = 130
const SUB_NODE_SIZE = 52, SUB_ICON_SIZE = 14, SUB_LABEL_WIDTH = 44, SUB_OFFSET = 26, SUB_RADIUS = 130

const iconHtml = (Icon: LucideIcon, size = ICON_SIZE) =>
  renderToStaticMarkup(<Icon size={size} strokeWidth={1.6} />)

const NODES = [
  { id: "chat",     label: "Vent Out",   angle: 270, url: undefined as string | undefined, icon: iconHtml(MessageCircle) },
  {
    id: "meditate", label: "Productivity",   angle: 299, url: undefined as string | undefined, icon: iconHtml(Brain),
    subNodes: [
      { id: "breathe",  label: "Breathe",      angle: 279, icon: iconHtml(Wind,  SUB_ICON_SIZE) },
      { id: "sounds",   label: "Meditate",       angle: 307, icon: iconHtml(Music, SUB_ICON_SIZE) },
      { id: "pomodoro", label: "Stay Focused", angle: 335, icon: iconHtml(Timer, SUB_ICON_SIZE) },
    ],
  },
  { id: "quote",     label: "Lift Me Up", angle: 328, url: undefined as string | undefined, icon: iconHtml(Smile) },
  { id: "therapist", label: "Seek Help",  angle: 357, url: "https://catalystcare.in/therapists", icon: iconHtml(UserRound) },
]

// ─── Event bus ───────────────────────────────────────────────────────────────
const CC_OPEN       = "cc:open-screen"
const CC_CLOSE      = "cc:close-screen"
const CC_OPEN_MENU  = "cc:open-menu"
const CC_AUTO_QUOTE = "cc:auto-quote"
const dispatch = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }))

// ─── Auto-quote scheduler ────────────────────────────────────────────────────
const AUTO_QUOTE_INTERVAL_MS = 30 * 1000
let _autoQuoteItv: ReturnType<typeof setInterval> | null = null

function startAutoQuoteScheduler() {
  if (_autoQuoteItv) return
  _autoQuoteItv = setInterval(() => dispatch(CC_AUTO_QUOTE), AUTO_QUOTE_INTERVAL_MS)
}

// ─── Format mm:ss ─────────────────────────────────────────────────────────────
function fmt(s: number) {
  const m = Math.floor(s / 60)
  const sc = s % 60
  return String(m).padStart(2, "0") + ":" + String(sc).padStart(2, "0")
}

// ══════════════════════════════════════════════════════════════════════════════
//  PERSISTENT FAB-LEVEL POMO TOAST
// ══════════════════════════════════════════════════════════════════════════════
const FAB_BOTTOM = 28
const FAB_LEFT   = 28
const FAB_SIZE   = 54

function PomoToastBubble() {
  const [toast,        setToast]   = useState<{ message: string; sub?: string; countdown?: number } | null>(null)
  const [visible,      setVisible] = useState(false)
  const [countdown,    setCountdown] = useState<number | null>(null)
  const hideTimerRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownRef   = useRef<ReturnType<typeof setInterval> | null>(null)

  const dismiss = useCallback(() => {
    if (hideTimerRef.current)  clearTimeout(hideTimerRef.current)
    if (countdownRef.current)  clearInterval(countdownRef.current)
    setVisible(false)
    setCountdown(null)
    setTimeout(() => setToast(null), 380)
  }, [])

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, sub, countdown: cd } = (e as CustomEvent<{ message: string; sub?: string; countdown?: number }>).detail

      if (hideTimerRef.current)  clearTimeout(hideTimerRef.current)
      if (countdownRef.current)  clearInterval(countdownRef.current)

      setToast({ message, sub, countdown: cd })
      setCountdown(cd ?? null)
      requestAnimationFrame(() => setVisible(true))

      if (cd && cd > 0) {
        let remaining = cd
        countdownRef.current = setInterval(() => {
          remaining--
          setCountdown(remaining)
          if (remaining <= 0) {
            clearInterval(countdownRef.current!)
            countdownRef.current = null
          }
        }, 1000)
      }

      const hideAfter = cd ? (cd + 1) * 1000 : 4000
      hideTimerRef.current = setTimeout(() => {
        setVisible(false)
        setCountdown(null)
        setTimeout(() => setToast(null), 380)
      }, hideAfter)
    }

    window.addEventListener("cc:pomo-toast", handler)
    return () => {
      window.removeEventListener("cc:pomo-toast", handler)
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  if (!toast) return null

  return (
    <div
      style={{
        position:   "fixed",
        bottom:     FAB_BOTTOM + FAB_SIZE + 14,
        left:       FAB_LEFT,
        width:      252,
        zIndex:     2147483648,
        pointerEvents: "auto",
        transform:  visible ? "translateY(0) scale(1)" : "translateY(16px) scale(.93)",
        opacity:    visible ? 1 : 0,
        transition: "transform .38s cubic-bezier(.34,1.56,.64,1), opacity .28s ease",
      }}
    >
      <div style={{ position: "absolute", bottom: -7, left: 20, width: 14, height: 8, overflow: "hidden" }}>
        <div style={{
          width: 14, height: 14,
          background: "#0c3e6f",
          transform: "rotate(45deg) translateY(-7px)",
          boxShadow: "2px 2px 6px rgba(8,28,58,.18)",
        }} />
      </div>

      <div style={{
        borderRadius:         16,
        background:           "linear-gradient(135deg, #0c3e6f 0%, #0a5080 100%)",
        backdropFilter:       "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
        boxShadow:            "0 12px 40px rgba(8,28,58,.32), 0 0 0 1px rgba(22,183,194,.22)",
        padding:              "12px 14px 11px",
        position:             "relative",
      }}>
        <button
          onClick={dismiss}
          style={{
            position: "absolute", top: 7, right: 8,
            width: 20, height: 20, borderRadius: 6,
            border: "none", background: "transparent",
            cursor: "pointer", fontSize: 13,
            color: "rgba(22,183,194,.65)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 0, lineHeight: 1,
          }}
        >×</button>

        <p style={{
          margin: "0 24px 6px 0",
          fontSize: 12.5, fontWeight: 600,
          lineHeight: 1.5, color: "#fff",
          letterSpacing: "0.01em",
        }}>
          {toast.message}
        </p>

        {(toast.sub || countdown !== null) && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {toast.sub && (
              <span style={{
                fontSize: 10.5,
                color: "rgba(22,183,194,.85)",
                fontWeight: 400,
                letterSpacing: "0.02em",
              }}>
                {toast.sub}
              </span>
            )}
            {countdown !== null && (
              <span style={{
                fontSize: 13,
                fontWeight: 700,
                color: countdown <= 1 ? "#ff9f7a" : "#16B7C2",
                fontVariantNumeric: "tabular-nums",
                transition: "color .3s ease",
                lineHeight: 1,
              }}>
                {countdown}s
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  FAB init
// ══════════════════════════════════════════════════════════════════════════════
function initWidget(iconSrc: string) {
  if (document.getElementById("cc-fab")) return
  injectGlobalStyles()

  const r1 = Object.assign(document.createElement("div"), { className: "cc-ring", id: "cc-r1" })
  const r2 = Object.assign(document.createElement("div"), { className: "cc-ring", id: "cc-r2" })
  document.body.append(r1, r2)

  const fab = document.createElement("button")
  fab.id = "cc-fab"
  fab.innerHTML = `
    <img id="cc-fab-img" src="${iconSrc}" alt="logo" />
    <div id="cc-fab-timer">
      <span id="cc-fab-timer-label">25:00</span>
      <span id="cc-fab-timer-mode">Focus</span>
    </div>
  `
  document.body.appendChild(fab)

  startAutoQuoteScheduler()

  pomoTimer.subscribe(({ timeLeft, running, mode }) => {
    const timerLabel = document.getElementById("cc-fab-timer-label")
    const timerMode  = document.getElementById("cc-fab-timer-mode")
    if (timerLabel) timerLabel.textContent = fmt(timeLeft)
    if (timerMode)  timerMode.textContent  =
      mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"
    if (running) {
      fab.classList.add("cc-pomo-active")
    } else {
      fab.classList.remove("cc-pomo-active")
    }
  })

  let isOpen = false, nodes: HTMLButtonElement[] = [], bd: HTMLElement | null = null
  let subNodes: HTMLButtonElement[] = [], subConnectors: SVGSVGElement[] = []
  let subHoverTimer: ReturnType<typeof setTimeout> | null = null
  let subCloseTimer: ReturnType<typeof setTimeout> | null = null
  let subOpen = false, meditateBtnRef: HTMLButtonElement | null = null

  const openScreen = (screen: string) => dispatch(CC_OPEN, { screen })

  const openSubNodes = (mediateBtn: HTMLButtonElement, nodeData: typeof NODES[1]) => {
    if (subOpen) return
    subOpen = true
    mediateBtn.classList.add("cc-meditate-active")
    mediateBtn.classList.remove("cc-float")
    const mr  = mediateBtn.getBoundingClientRect()
    const mcx = mr.left + mr.width / 2, mcy = mr.top + mr.height / 2

    nodeData.subNodes!.forEach((sn, i) => {
      const rad = (sn.angle * Math.PI) / 180
      const sx  = mcx + Math.cos(rad) * SUB_RADIUS - SUB_OFFSET
      const sy  = mcy + Math.sin(rad) * SUB_RADIUS - SUB_OFFSET

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg") as SVGSVGElement
      svg.setAttribute("class", "cc-sub-connector")
      const snCx = sx + SUB_OFFSET, snCy = sy + SUB_OFFSET
      const minX = Math.min(mcx, snCx) - 8, minY = Math.min(mcy, snCy) - 8
      const w = Math.abs(snCx - mcx) + 16, h = Math.abs(snCy - mcy) + 16
      Object.assign(svg.style, { left: `${minX}px`, top: `${minY}px`, width: `${w}px`, height: `${h}px`, overflow: "visible", opacity: "0", transition: `opacity .3s ease ${i * 55 + 60}ms` })
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      line.setAttribute("x1", `${mcx - minX}`); line.setAttribute("y1", `${mcy - minY}`)
      line.setAttribute("x2", `${snCx - minX}`); line.setAttribute("y2", `${snCy - minY}`)
      line.setAttribute("stroke", "rgba(22,183,194,.22)"); line.setAttribute("stroke-width", "1.5"); line.setAttribute("stroke-dasharray", "4 4")
      svg.appendChild(line); document.body.appendChild(svg); subConnectors.push(svg)
      setTimeout(() => { svg.style.opacity = "1" }, 10)

      const btn = document.createElement("button") as HTMLButtonElement
      btn.className = "cc-sub-node"
      Object.assign(btn.style, { left: `${sx}px`, top: `${sy}px` })
      btn.style.setProperty("--sf-dur", `${3.2 + i * 0.22}s`)
      btn.style.setProperty("--sf-off", `${300 + i * 60}ms`)
      btn.innerHTML = `<span class="cc-sub-ni">${sn.icon}</span><span class="cc-sub-nl">${sn.label}</span>`
      btn.addEventListener("mouseenter", () => { if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null } })
      btn.addEventListener("mouseleave", () => { subCloseTimer = setTimeout(closeSubNodes, 180) })
      btn.addEventListener("click", e => { e.stopPropagation(); closeSubNodes(); closeMenu(); openScreen(sn.id) })
      document.body.appendChild(btn); subNodes.push(btn)
      setTimeout(() => {
        btn.classList.add("cc-sub-in")
        setTimeout(() => { btn.classList.remove("cc-sub-in"); btn.classList.add("cc-sub-float") }, 420 + i * 55)
      }, i * 55 + 10)
    })
  }

  const closeSubNodes = (immediate = false) => {
    if (!subOpen) return; subOpen = false
    if (meditateBtnRef) {
      meditateBtnRef.classList.remove("cc-meditate-active")
      if (isOpen) setTimeout(() => meditateBtnRef?.classList.add("cc-float"), 80)
    }
    subConnectors.forEach(svg => { svg.style.opacity = "0"; setTimeout(() => svg.remove(), immediate ? 0 : 220) })
    subConnectors = []
    subNodes.forEach((btn, i) => {
      btn.classList.remove("cc-sub-float", "cc-sub-in")
      if (immediate) { btn.remove(); return }
      btn.classList.add("cc-sub-out")
      setTimeout(() => btn.remove(), 260 + i * 30)
    })
    subNodes = []
  }

  const closeMenu = () => {
    if (!isOpen) return; isOpen = false
    fab.classList.remove("cc-open"); closeSubNodes(true)
    r1.classList.remove("cc-vis"); r2.classList.remove("cc-vis")
    bd?.remove(); bd = null
    nodes.forEach((btn, i) => {
      btn.classList.remove("cc-float")
      Object.assign(btn.style, { transition: `transform .25s cubic-bezier(.4,0,1,1) ${i * 25}ms, opacity .18s ease ${i * 25}ms`, transform: "scale(0.3)", opacity: "0" })
    })
    setTimeout(() => { nodes.forEach(b => b.remove()); nodes = []; meditateBtnRef = null }, 380)
  }

  const openMenu = () => {
    isOpen = true; fab.classList.add("cc-open")
    r1.classList.add("cc-vis"); r2.classList.add("cc-vis")
    bd = document.createElement("div"); bd.id = "cc-bd"
    bd.addEventListener("click", () => { subOpen ? closeSubNodes() : closeMenu() })
    document.body.appendChild(bd)

    const fr = fab.getBoundingClientRect()
    const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2
    nodes = []

    NODES.forEach((node, i) => {
      const rad = (node.angle * Math.PI) / 180
      const btn = document.createElement("button") as HTMLButtonElement
      btn.className = "cc-node"
      Object.assign(btn.style, {
        left: `${cx + Math.cos(rad) * RADIUS - OFFSET}px`,
        top:  `${cy + Math.sin(rad) * RADIUS - OFFSET}px`,
      })
      btn.style.setProperty("--f-dur", `${3.1 + i * 0.28}s`)
      btn.style.setProperty("--f-off", `${400 + i * 70}ms`)
      btn.innerHTML = `<span class="cc-ni">${node.icon}</span><span class="cc-nl">${node.label}</span>`

      if (node.id === "meditate" && node.subNodes) {
        meditateBtnRef = btn
        btn.addEventListener("mouseenter", () => {
          if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null }
          if (!subOpen) subHoverTimer = setTimeout(() => { if (meditateBtnRef) openSubNodes(meditateBtnRef, node as typeof NODES[1]) }, 220)
        })
        btn.addEventListener("mouseleave", () => {
          if (subHoverTimer) { clearTimeout(subHoverTimer); subHoverTimer = null }
          if (!subOpen) subCloseTimer = setTimeout(closeSubNodes, 200)
        })
        btn.addEventListener("click", e => {
          e.stopPropagation()
          subOpen ? closeSubNodes() : (meditateBtnRef && openSubNodes(meditateBtnRef, node as typeof NODES[1]))
        })
        return
      }

      btn.addEventListener("click", e => {
        e.stopPropagation(); closeMenu()
        if (node.id === "therapist" && node.url) {
          ;(chrome as any).tabs?.create({ url: node.url }) ?? window.open(node.url, "_blank")
          return
        }
        openScreen(node.id)
      })
      document.body.appendChild(btn); nodes.push(btn)
      setTimeout(() => {
        Object.assign(btn.style, {
          transition: `transform .4s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms, opacity .22s ease ${i * 55}ms`,
          transform: "scale(1)",
        })
        btn.classList.add("cc-vis")
        setTimeout(() => btn.classList.add("cc-float"), 420 + i * 55)
      }, 10)
    })

    if (meditateBtnRef && !nodes.includes(meditateBtnRef)) {
      document.body.appendChild(meditateBtnRef); nodes.push(meditateBtnRef)
      const i = NODES.findIndex(n => n.id === "meditate")
      setTimeout(() => {
        Object.assign(meditateBtnRef!.style, {
          transition: `transform .4s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms, opacity .22s ease ${i * 55}ms`,
          transform: "scale(1)",
        })
        meditateBtnRef!.classList.add("cc-vis")
        setTimeout(() => meditateBtnRef?.classList.add("cc-float"), 420 + i * 55)
      }, 10)
    }
  }

  window.addEventListener(CC_OPEN_MENU, openMenu)

  fab.addEventListener("click", () => {
    if (fab.classList.contains("cc-pomo-active")) {
      dispatch(CC_OPEN, { screen: "pomodoro" }); return
    }
    if (isOpen) { closeSubNodes(); closeMenu(); return }
    dispatch("cc:fab-clicked")
  })

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeSubNodes(); if (isOpen) closeMenu() }
  })
}

// ══════════════════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════════════════
function injectGlobalStyles() {
  if (document.getElementById("cc-global-styles")) return
  const style = document.createElement("style")
  style.id = "cc-global-styles"
  style.textContent = `
    @keyframes ccPulse {
      0%   { box-shadow: 0 0 0 0    rgba(12,62,111,.32); }
      70%  { box-shadow: 0 0 0 18px rgba(12,62,111,0);   }
      100% { box-shadow: 0 0 0 0    rgba(12,62,111,0);   }
    }
    @keyframes ccPomoRing {
      0%   { box-shadow: 0 0 0 0    rgba(22,183,194,.45); }
      70%  { box-shadow: 0 0 0 10px rgba(22,183,194,0);   }
      100% { box-shadow: 0 0 0 0    rgba(22,183,194,0);   }
    }
    @keyframes ccFloat {
      0%,100% { transform: translateY(0px); }
      50%      { transform: translateY(-6px); }
    }
    @keyframes ccSubFloat {
      0%,100% { transform: translateY(0px) scale(1); }
      50%      { transform: translateY(-4px) scale(1.02); }
    }
    @keyframes ccSubIn {
      0%   { opacity: 0 !important; transform: scale(0.18) translateY(8px) !important; }
      60%  { opacity: 1 !important; transform: scale(1.06) translateY(-2px) !important; }
      100% { opacity: 1 !important; transform: scale(1) translateY(0) !important; }
    }
    @keyframes ccSubOut {
      0%   { opacity: 1 !important; transform: scale(1) !important; }
      100% { opacity: 0 !important; transform: scale(0.18) translateY(8px) !important; }
    }
    @keyframes ccRipple {
      0%   { box-shadow: 0 0 0 0    rgba(22,183,194,.45); }
      70%  { box-shadow: 0 0 0 14px rgba(22,183,194,0);   }
      100% { box-shadow: 0 0 0 0    rgba(22,183,194,0);   }
    }
    #cc-fab {
      all: initial;
      position: fixed !important; bottom: 28px !important; left: 28px !important;
      width: 54px !important; height: 54px !important; border-radius: 100% !important;
      cursor: pointer !important; display: flex !important;
      align-items: center !important; justify-content: center !important;
      box-shadow: 0 6px 24px rgba(12,62,111,.35), 0 2px 8px rgba(12,62,111,.18) !important;
      pointer-events: auto !important;
      transition: transform .35s cubic-bezier(.34,1.56,.64,1), background .3s ease !important;
      animation: ccPulse 2.4s ease infinite !important;
      z-index: 2147483647 !important; border: none !important;
      background: #ffffff !important; overflow: hidden !important;
    }
    #cc-fab:hover { transform: scale(1.1) !important; }
    #cc-fab.cc-open { transform: rotate(45deg) scale(1.05) !important; animation: none !important; }
    #cc-fab.cc-pomo-active {
      background: #0c3e6f !important;
      animation: ccPomoRing 1.8s ease infinite !important;
      width: 66px !important; border-radius: 33px !important;
    }
    #cc-fab.cc-pomo-active:hover { transform: scale(1.06) !important; }
    #cc-fab-img {
      width: 38px !important; height: 38px !important;
      object-fit: cover !important; border-radius: 50% !important;
    }
    #cc-fab-timer {
      display: none !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      gap: 0px !important; pointer-events: none !important;
    }
    #cc-fab.cc-pomo-active #cc-fab-img   { display: none !important; }
    #cc-fab.cc-pomo-active #cc-fab-timer { display: flex !important; }
    #cc-fab-timer-label {
      font-family: monospace !important; font-size: 13px !important;
      font-weight: 700 !important; color: #fff !important;
      letter-spacing: 0.5px !important; line-height: 1 !important;
    }
    #cc-fab-timer-mode {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
      font-size: 7px !important; font-weight: 500 !important;
      color: #16B7C2 !important; letter-spacing: 1px !important;
      text-transform: uppercase !important; margin-top: 2px !important; line-height: 1 !important;
    }
    .cc-ring {
      position: fixed !important; border-radius: 50% !important;
      pointer-events: none !important; opacity: 0 !important;
      transition: opacity .4s ease !important; z-index: 2147483640 !important;
    }
    .cc-ring.cc-vis { opacity: 1 !important; }
    #cc-r1 { width: 310px !important; height: 310px !important; bottom: -100px !important; left: -100px !important; border: 1px dashed rgba(12,62,111,.15) !important; }
    #cc-r2 { width: 360px !important; height: 360px !important; bottom: -125px !important; left: -125px !important; border: 1px solid rgba(12,62,111,.08) !important; }
    .cc-node {
      all: initial; position: fixed !important;
      width: ${NODE_SIZE}px !important; height: ${NODE_SIZE}px !important;
      border-radius: 50% !important; background: rgba(255,255,255,.97) !important;
      border: 1.5px solid rgba(12,62,111,.1) !important;
      box-shadow: 0 4px 16px rgba(12,62,111,.14) !important;
      display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      gap: 6px !important; cursor: pointer !important;
      pointer-events: none !important; opacity: 0 !important;
      transform: scale(0.3) !important; z-index: 2147483646 !important;
      transition: background .2s ease, border-color .2s ease, box-shadow .2s ease !important;
    }
    .cc-node.cc-vis { opacity: 1 !important; pointer-events: auto !important; }
    .cc-node.cc-float { animation: ccFloat var(--f-dur,3s) var(--f-off,0ms) ease-in-out infinite !important; }
    .cc-node:hover { background: #16B7C2 !important; border-color: rgba(22,183,194,.5) !important; box-shadow: 0 8px 28px rgba(22,183,194,.38) !important; }
    .cc-node:hover .cc-ni { color: #fff !important; }
    .cc-node:hover .cc-nl { color: rgba(255,255,255,.9) !important; }
    .cc-node.cc-meditate-active { background: #0c3e6f !important; border-color: rgba(22,183,194,.6) !important; box-shadow: 0 8px 32px rgba(12,62,111,.42) !important; animation: ccRipple 1.8s ease infinite !important; }
    .cc-node.cc-meditate-active .cc-ni { color: #16B7C2 !important; }
    .cc-node.cc-meditate-active .cc-nl { color: rgba(22,183,194,.9) !important; }
    .cc-ni { display: flex !important; align-items: center !important; justify-content: center !important; color: #0c3e6f !important; transition: color .18s ease !important; }
    .cc-ni svg { width: ${ICON_SIZE}px !important; height: ${ICON_SIZE}px !important; stroke: currentColor !important; fill: none !important; }
    .cc-nl { font-family: -apple-system,BlinkMacSystemFont,sans-serif !important; font-size: 25px !important; font-weight: 500 !important; letter-spacing: .04em !important; color: #2a5a8a !important; text-align: center !important; line-height: 1.2 !important; max-width: ${LABEL_WIDTH}px !important; transition: color .18s ease !important; }
    .cc-sub-node {
      all: initial; position: fixed !important;
      width: ${SUB_NODE_SIZE}px !important; height: ${SUB_NODE_SIZE}px !important;
      border-radius: 50% !important; background: rgba(255,255,255,.96) !important;
      border: 1.5px solid rgba(22,183,194,.28) !important;
      box-shadow: 0 4px 18px rgba(12,62,111,.16), 0 0 0 4px rgba(22,183,194,.07) !important;
      display: flex !important; flex-direction: column !important;
      align-items: center !important; justify-content: center !important;
      gap: 5px !important; cursor: pointer !important;
      pointer-events: none !important; visibility: hidden !important; z-index: 2147483645 !important;
    }
    .cc-sub-node.cc-sub-in    { visibility: visible !important; pointer-events: auto !important; animation: ccSubIn .42s cubic-bezier(.34,1.56,.64,1) forwards !important; }
    .cc-sub-node.cc-sub-out   { visibility: visible !important; pointer-events: none !important; animation: ccSubOut .22s cubic-bezier(.4,0,1,1) forwards !important; }
    .cc-sub-node.cc-sub-float { visibility: visible !important; pointer-events: auto !important; animation: ccSubFloat var(--sf-dur,3.2s) var(--sf-off,0ms) ease-in-out infinite !important; }
    .cc-sub-node:hover { background: #16B7C2 !important; border-color: rgba(22,183,194,.7) !important; box-shadow: 0 6px 22px rgba(22,183,194,.42) !important; }
    .cc-sub-node:hover .cc-sub-ni { color: #fff !important; }
    .cc-sub-node:hover .cc-sub-nl { color: rgba(255,255,255,.92) !important; }
    .cc-sub-ni { display: flex !important; align-items: center !important; justify-content: center !important; color: #0c3e6f !important; transition: color .18s ease !important; }
    .cc-sub-ni svg { width: ${SUB_ICON_SIZE}px !important; height: ${SUB_ICON_SIZE}px !important; stroke: currentColor !important; fill: none !important; }
    .cc-sub-nl { font-family: -apple-system,BlinkMacSystemFont,sans-serif !important; font-size: 8px !important; font-weight: 500 !important; letter-spacing: .03em !important; color: #2a5a8a !important; text-align: center !important; line-height: 1.2 !important; max-width: ${SUB_LABEL_WIDTH}px !important; transition: color .18s ease !important; }
    .cc-sub-connector { position: fixed !important; pointer-events: none !important; z-index: 2147483644 !important; }
    #cc-bd { position: fixed !important; inset: 0 !important; background: transparent !important; pointer-events: auto !important; z-index: 2147483639 !important; }
  `
  document.head.appendChild(style)
}

// ══════════════════════════════════════════════════════════════════════════════
//  DRAGGABLE DIALOG SHELL
// ══════════════════════════════════════════════════════════════════════════════
const DIALOG_W   = 360
const DIALOG_H   = 520

function DraggableShell({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const [visible,  setVisible]  = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const dragging   = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const w = expanded ? DIALOG_W + 80 : (wide ? 400 : DIALOG_W)
    const h = DIALOG_H
    const x = FAB_LEFT + FAB_SIZE + 12
    const y = window.innerHeight - FAB_BOTTOM - FAB_SIZE - h + FAB_SIZE / 2
    setPos({
      x: Math.min(x, window.innerWidth - w - 12),
      y: Math.max(12, Math.min(y, window.innerHeight - h - 12)),
    })
    requestAnimationFrame(() => setVisible(true))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, input, textarea, select, a")) return
    dragging.current = true
    dragOffset.current = { x: e.clientX - (pos?.x ?? 0), y: e.clientY - (pos?.y ?? 0) }
    document.body.style.userSelect = "none"
  }, [pos])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const w = expanded ? DIALOG_W + 80 : (wide ? 400 : DIALOG_W)
      setPos({
        x: Math.max(0, Math.min(e.clientX - dragOffset.current.x, window.innerWidth - w)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.current.y, window.innerHeight - DIALOG_H)),
      })
    }
    const onUp = () => { dragging.current = false; document.body.style.userSelect = "" }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [expanded, wide])

  if (!pos) return null
  const currentW = expanded ? DIALOG_W + 80 : (wide ? 400 : DIALOG_W)

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2147483646, pointerEvents: "none", isolation: "isolate" }}>
      <div style={{
        position: "absolute", left: pos.x, top: pos.y,
        width: currentW, height: DIALOG_H, borderRadius: 20,
        background: "rgba(239,246,255,0.96)",
        backdropFilter: "blur(20px) saturate(1.5)", WebkitBackdropFilter: "blur(20px) saturate(1.5)",
        boxShadow: "0 24px 64px rgba(8,28,58,.28), 0 4px 16px rgba(8,28,58,.12), 0 0 0 1px rgba(12,62,111,.08)",
        overflow: "hidden", display: "flex", flexDirection: "column", pointerEvents: "auto",
        transform: visible ? "scale(1) translateY(0)" : "scale(.94) translateY(12px)",
        opacity: visible ? 1 : 0,
        transition: "transform .34s cubic-bezier(.34,1.56,.64,1), opacity .24s ease, width .28s cubic-bezier(.4,0,.2,1)",
      }}>
        <div onMouseDown={onMouseDown} style={{ position: "absolute", top: 0, left: 52, right: 72, height: 52, cursor: "grab", zIndex: 10 }} />
        <div style={{ position: "absolute", top: 5, right: 14, display: "flex", alignItems: "center", gap: 6, zIndex: 20 }}>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(12,62,111,.12)", background: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 11, color: "#6a8fab", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s", outline: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#16B7C2"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.7)"; e.currentTarget.style.color = "#6a8fab" }}
          >{expanded ? "⇤" : "⇥"}</button>
          <button
            onClick={onClose}
            style={{ width: 26, height: 26, borderRadius: 8, border: "1px solid rgba(12,62,111,.12)", background: "rgba(255,255,255,.7)", cursor: "pointer", fontSize: 13, color: "#6a8fab", display: "flex", alignItems: "center", justifyContent: "center", transition: "all .18s", outline: "none" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(220,60,60,.9)"; e.currentTarget.style.color = "#fff" }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.7)"; e.currentTarget.style.color = "#6a8fab" }}
          >×</button>
        </div>
        <div style={{ position: "absolute", top: 2, left: "50%", transform: "translateX(-50%)", width: 32, height: 5, borderRadius: 2, background: "rgba(12,62,111,.12)", pointerEvents: "none", zIndex: 5 }} />
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  AUTO QUOTE BUBBLE — now shows feeling badge
// ══════════════════════════════════════════════════════════════════════════════
function AutoQuoteBubble({
  text, author, feeling, onDismiss, onOpen
}: {
  text: string
  author: string
  feeling: { symbol: string; label: string }
  onDismiss: () => void
  onOpen: () => void
}) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    timerRef.current = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 400) }, 8000)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false); setTimeout(onDismiss, 400)
  }

  return (
    <div style={{ position: "fixed", bottom: FAB_BOTTOM + FAB_SIZE + 14, left: FAB_LEFT, width: 240, zIndex: 2147483646, pointerEvents: "auto", transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(.94)", opacity: visible ? 1 : 0, transition: "transform .38s cubic-bezier(.34,1.56,.64,1), opacity .28s ease" }}>
      <div style={{ position: "absolute", bottom: -7, left: 20, width: 14, height: 8, overflow: "hidden" }}>
        <div style={{ width: 14, height: 14, background: "rgba(239,246,255,0.96)", border: "1px solid rgba(12,62,111,.1)", transform: "rotate(45deg) translateY(-7px)", boxShadow: "2px 2px 6px rgba(8,28,58,.1)" }} />
      </div>
      <div style={{ borderRadius: 16, background: "rgba(239,246,255,0.96)", backdropFilter: "blur(20px) saturate(1.4)", WebkitBackdropFilter: "blur(20px) saturate(1.4)", boxShadow: "0 12px 40px rgba(8,28,58,.22), 0 0 0 1px rgba(12,62,111,.1)", padding: "14px 16px 12px", position: "relative" }}>
        <button onClick={dismiss} style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer", fontSize: 13, color: "#8aadcc", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, lineHeight: 1 }}>×</button>

        {/* Feeling badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 99, background: "rgba(22,183,194,.08)", border: "1px solid rgba(22,183,194,.2)", fontSize: 10, color: "#16B7C2", fontWeight: 500, marginBottom: 8 }}>
          {feeling.symbol} {feeling.label}
        </div>

        <p style={{ margin: "0 20px 6px 0", fontSize: 12.5, fontWeight: 300, lineHeight: 1.6, color: "#0c3e6f", fontStyle: "italic" }}>"{text}"</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "#8aadcc", letterSpacing: "0.6px" }}>— {author}</span>
          <button onClick={() => { dismiss(); onOpen() }} style={{ fontSize: 10, color: "#16B7C2", border: "none", background: "transparent", cursor: "pointer", fontWeight: 500, padding: "2px 6px", borderRadius: 6, transition: "background .15s" }} onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,183,194,.1)" }} onMouseLeave={e => { e.currentTarget.style.background = "transparent" }}>More →</button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  AUTH SCREEN
// ══════════════════════════════════════════════════════════════════════════════
class ErrorBoundary extends React.Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: any) { console.error("AuthForm crashed:", e) }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

function AuthScreen({ onSuccess }: { onSuccess: () => void; onClose: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflowY: "auto" }}>
      <ErrorBoundary fallback={<div style={{ padding: 20, color: "red", fontSize: 12 }}>Auth failed to load.</div>}>
        <AuthForm onSuccess={onSuccess} />
      </ErrorBoundary>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ROOT REACT COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Widget() {
  const [activeScreen, setActiveScreen] = useState<string | null>(null)
  const [overlayRoot,  setOverlayRoot]  = useState<HTMLElement | null>(null)
  const [autoQuote, setAutoQuote] = useState<{ text: string; author: string; feeling: { symbol: string; label: string } } | null>(null)
  const { isAuthenticated, isHydrated, hydrate } = useAuthStore()
  const activeScreenRef = useRef<string | null>(null)
  useEffect(() => { activeScreenRef.current = activeScreen }, [activeScreen])

  useEffect(() => { hydrate() }, [])
  useEffect(() => {
    const el = document.getElementById("cc-root-container")
    if (el) setOverlayRoot(el)
  }, [])
  useEffect(() => { initWidget(icon) }, [])

  useEffect(() => {
    const onAutoQuote = () => {
      if (activeScreenRef.current) return
      if (!QUOTES.length) return
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      // Pass feeling from the quote directly
      setAutoQuote({ text: q.text, author: q.author, feeling: q.feeling })
    }
    window.addEventListener(CC_AUTO_QUOTE, onAutoQuote)
    return () => window.removeEventListener(CC_AUTO_QUOTE, onAutoQuote)
  }, [])

  useEffect(() => {
    const onFabClick = () => {
      if (!isHydrated) return
      if (!isAuthenticated) setActiveScreen("auth")
      else window.dispatchEvent(new CustomEvent(CC_OPEN_MENU))
    }
    const onOpen  = (e: Event) => {
      const screen = (e as CustomEvent<{ screen: string }>).detail?.screen
      if (screen) setActiveScreen(screen)
    }
    const onClose = () => setActiveScreen(null)
    window.addEventListener("cc:fab-clicked", onFabClick)
    window.addEventListener(CC_OPEN,  onOpen)
    window.addEventListener(CC_CLOSE, onClose)
    return () => {
      window.removeEventListener("cc:fab-clicked", onFabClick)
      window.removeEventListener(CC_OPEN,  onOpen)
      window.removeEventListener(CC_CLOSE, onClose)
    }
  }, [isAuthenticated, isHydrated])

  const closeScreen    = () => { setActiveScreen(null); dispatch(CC_CLOSE) }
  const minimizeScreen = () => setActiveScreen(null)

  const handleAuthSuccess = () => {
    setActiveScreen(null)
    setTimeout(() => window.dispatchEvent(new CustomEvent(CC_OPEN_MENU)), 120)
  }

  const screenEl = (() => {
    switch (activeScreen) {
      case "auth":
        return <AuthScreen onSuccess={handleAuthSuccess} onClose={closeScreen} />
      case "chat":
        return <ChatScreen onBack={closeScreen} />
      case "breathe":
        return <BreatheScreen onBack={closeScreen} />
      case "sounds":
        return <SoundsScreen onBack={closeScreen} />
      case "pomodoro":
        return (
          <PomodoroScreen
            onBack={closeScreen}
            onMinimize={minimizeScreen}
          />
        )
      case "quote":
        return <QuoteScreen onBack={closeScreen} />
      default:
        return null
    }
  })()

  const isAuthScreen = activeScreen === "auth"
  const shellOnClose = activeScreen === "pomodoro" ? minimizeScreen : closeScreen

  if (!overlayRoot) return null

  return createPortal(
    <QueryClientProvider client={queryClient}>
      <PomoToastBubble />

      {autoQuote && !activeScreen && (
        <AutoQuoteBubble
          text={autoQuote.text}
          author={autoQuote.author}
          feeling={autoQuote.feeling}
          onDismiss={() => setAutoQuote(null)}
          onOpen={() => { setAutoQuote(null); setActiveScreen("quote") }}
        />
      )}
      {screenEl && (
        <DraggableShell onClose={shellOnClose} wide={isAuthScreen}>
          {screenEl}
        </DraggableShell>
      )}
    </QueryClientProvider>,
    overlayRoot
  )
}