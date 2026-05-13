import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { renderToStaticMarkup } from "react-dom/server"
import type { PlasmoCSConfig } from "plasmo"
import {
  MessageCircle, Brain, Timer, Smile, UserRound,
  Wind, Music, X, type LucideIcon
} from "lucide-react"
import icon from "data-base64:~assets/icon.png"
import AuthForm from "~src/components/auth/AuthForm"
import { useAuthStore } from "~src/lib/hooks/useAuthStore"
import { ChatScreen } from "~src/components/features/Ai/ChatScreen"

// ─── Plasmo config ────────────────────────────────────────────────
export const config: PlasmoCSConfig = { matches: ["<all_urls>"] }

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { BreatheScreen } from "~src/components/features/Meditation"
import { SoundsScreen } from "~src/components/features/Sound"
import { QuoteScreen } from "~src/components/features/Quote"
import type { PomodoroMode } from "~src/lib/types"
import { fmt } from "~src/lib/constants/contant"
import { PomodoroScreen } from "~src/components/features/Pomodoro"

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

// ─── Layout constants ─────────────────────────────────────────────
const NODE_SIZE = 160, ICON_SIZE = 38, LABEL_WIDTH = 238, OFFSET = 80, RADIUS = 140
const SUB_NODE_SIZE = 52, SUB_ICON_SIZE = 14, SUB_LABEL_WIDTH = 44, SUB_OFFSET = 26, SUB_RADIUS = 130

const iconHtml = (Icon: LucideIcon, size = ICON_SIZE) =>
  renderToStaticMarkup(<Icon size={size} strokeWidth={1.6} />)

const NODES = [
  { id: "chat",      label: "Vent Out",   angle: 270, url: undefined as string | undefined, icon: iconHtml(MessageCircle) },
  {
    id: "meditate",  label: "Meditate",   angle: 299, url: undefined as string | undefined, icon: iconHtml(Brain),
    subNodes: [
      { id: "breathe",  label: "Breathe",      angle: 279, icon: iconHtml(Wind,  SUB_ICON_SIZE) },
      { id: "sounds",   label: "Sounds",       angle: 307, icon: iconHtml(Music, SUB_ICON_SIZE) },
      { id: "pomodoro", label: "Stay Focused", angle: 335, icon: iconHtml(Timer, SUB_ICON_SIZE) },
    ]
  },
  { id: "quote",     label: "Lift Me Up",  angle: 328, url: undefined as string | undefined, icon: iconHtml(Smile) },
  { id: "therapist", label: "Seek Help",   angle: 357, url: "https://catalystcare.in/therapists", icon: iconHtml(UserRound) },
]

// ─── Event bus ───────────────────────────────────────────────────
const CC_OPEN       = "cc:open-screen"
const CC_CLOSE      = "cc:close-screen"
const CC_POMO_TICK  = "cc:pomo-tick"
const CC_OPEN_MENU  = "cc:open-menu"
const dispatch = (name: string, detail?: unknown) =>
  window.dispatchEvent(new CustomEvent(name, { detail }))

// ══════════════════════════════════════════════════════════════════
//  OVERLAY SCREENS
// ══════════════════════════════════════════════════════════════════

function OverlayShell({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 2147483646,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: visible ? "rgba(8,28,58,.55)" : "rgba(8,28,58,0)",
        backdropFilter: visible ? "blur(6px)" : "blur(0px)",
        transition: "background .3s ease, backdrop-filter .3s ease",
        pointerEvents: "auto",
        isolation: "isolate",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: wide ? 400 : 360,
          maxHeight: "92vh",
          borderRadius: 20,
          background: "#EFF6FF",
          boxShadow: "0 32px 80px rgba(8,28,58,.38), 0 8px 24px rgba(8,28,58,.18)",
          overflow: "hidden",
          transform: visible ? "scale(1) translateY(0)" : "scale(.92) translateY(18px)",
          opacity: visible ? 1 : 0,
          transition: "transform .38s cubic-bezier(.34,1.56,.64,1), opacity .28s ease",
          display: "flex", flexDirection: "column",
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

function AuthScreen({ onSuccess, onClose }: { onSuccess: () => void; onClose: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", maxHeight: "88vh", overflowY: "auto", minHeight: 500 }}>
      <ErrorBoundary fallback={<div style={{padding: 20, color: "red", fontSize: 12}}>Auth failed to load. Check console.</div>}>
        <AuthForm onSuccess={onSuccess} />
      </ErrorBoundary>
    </div>
  )
}

class ErrorBoundary extends React.Component<{fallback: React.ReactNode, children: React.ReactNode}, {hasError: boolean}> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: any) { console.error("AuthForm crashed:", e) }
  render() { return this.state.hasError ? this.props.fallback : this.props.children }
}

// ══════════════════════════════════════════════════════════════════
//  GLOBAL STYLES
// ══════════════════════════════════════════════════════════════════
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
      0%   { box-shadow: 0 0 0 0 rgba(22,183,194,.45); }
      70%  { box-shadow: 0 0 0 14px rgba(22,183,194,0); }
      100% { box-shadow: 0 0 0 0 rgba(22,183,194,0); }
    }
    @keyframes ccDot {
      0%   { transform: translateY(0);   opacity: .5; }
      100% { transform: translateY(-4px); opacity: 1; }
    }
    @keyframes ccSoundBar {
      0%   { height: 4px; }
      100% { height: 14px; }
    }
    #cc-fab {
      all: initial;
      position: fixed !important;
      bottom: 28px !important;
      left: 28px !important;
      width: 54px !important;
      height: 54px !important;
      border-radius: 100% !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      box-shadow: 0 6px 24px rgba(12,62,111,.35), 0 2px 8px rgba(12,62,111,.18) !important;
      pointer-events: auto !important;
      transition: transform .35s cubic-bezier(.34,1.56,.64,1), background .3s ease !important;
      animation: ccPulse 2.4s ease infinite !important;
      z-index: 2147483647 !important;
      border: none !important;
      background: #ffffff !important;
      overflow: hidden !important;
    }
    #cc-fab:hover { transform: scale(1.1) !important; }
    #cc-fab.cc-open { transform: rotate(45deg) scale(1.05) !important; animation: none !important; }
    #cc-fab.cc-pomo-active {
      background: #0c3e6f !important;
      animation: ccPomoRing 1.8s ease infinite !important;
      width: 66px !important;
      border-radius: 33px !important;
    }
    #cc-fab.cc-pomo-active:hover { transform: scale(1.06) !important; }
    #cc-fab-img {
      width: 38px !important;
      height: 38px !important;
      object-fit: cover !important;
      border-radius: 50% !important;
      transition: opacity .25s ease, transform .25s ease !important;
    }
    #cc-fab-timer {
      display: none !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0px !important;
      pointer-events: none !important;
    }
    #cc-fab.cc-pomo-active #cc-fab-img {
      display: none !important;
    }
    #cc-fab.cc-pomo-active #cc-fab-timer {
      display: flex !important;
    }
    #cc-fab-timer-label {
      font-family: monospace !important;
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #fff !important;
      letter-spacing: 0.5px !important;
      line-height: 1 !important;
    }
    #cc-fab-timer-mode {
      font-family: -apple-system, BlinkMacSystemFont, sans-serif !important;
      font-size: 7px !important;
      font-weight: 500 !important;
      color: #16B7C2 !important;
      letter-spacing: 1px !important;
      text-transform: uppercase !important;
      margin-top: 2px !important;
      line-height: 1 !important;
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
      border-radius: 50% !important;
      background: rgba(255,255,255,.97) !important;
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
    .cc-sub-node.cc-sub-in { visibility: visible !important; pointer-events: auto !important; animation: ccSubIn .42s cubic-bezier(.34,1.56,.64,1) forwards !important; }
    .cc-sub-node.cc-sub-out { visibility: visible !important; pointer-events: none !important; animation: ccSubOut .22s cubic-bezier(.4,0,1,1) forwards !important; }
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

// ══════════════════════════════════════════════════════════════════
//  FAB + RADIAL MENU  (vanilla JS — runs outside React tree)
// ══════════════════════════════════════════════════════════════════
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

  // ── Pomo tick ──
  window.addEventListener(CC_POMO_TICK, (e: Event) => {
    const { timeLeft, running, mode } = (e as CustomEvent<{ timeLeft: number; running: boolean; mode: PomodoroMode }>).detail
    const timerLabel = document.getElementById("cc-fab-timer-label")
    const timerMode  = document.getElementById("cc-fab-timer-mode")
    if (timerLabel) timerLabel.textContent = fmt(timeLeft)
    if (timerMode)  timerMode.textContent  = mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"
    if (running) {
      fab.classList.add("cc-pomo-active")
      fab.style.animation = "none"
    } else {
      fab.classList.remove("cc-pomo-active")
      fab.style.animation = ""
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

    const mr = mediateBtn.getBoundingClientRect()
    const mcx = mr.left + mr.width / 2, mcy = mr.top + mr.height / 2

    nodeData.subNodes!.forEach((sn, i) => {
      const rad = (sn.angle * Math.PI) / 180
      const sx = mcx + Math.cos(rad) * SUB_RADIUS - SUB_OFFSET
      const sy = mcy + Math.sin(rad) * SUB_RADIUS - SUB_OFFSET

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
      btn.addEventListener("click", e => {
        e.stopPropagation(); closeSubNodes(); closeMenu()
        openScreen(sn.id)
      })
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

    bd.addEventListener("click", () => {
      if (subOpen) {
        closeSubNodes()
      } else {
        closeMenu()
      }
    })

    document.body.appendChild(bd)

    const fr = fab.getBoundingClientRect()
    const cx = fr.left + fr.width / 2, cy = fr.top + fr.height / 2
    nodes = []

    NODES.forEach((node, i) => {
      const rad = (node.angle * Math.PI) / 180
      const btn = document.createElement("button") as HTMLButtonElement
      btn.className = "cc-node"
      Object.assign(btn.style, { left: `${cx + Math.cos(rad) * RADIUS - OFFSET}px`, top: `${cy + Math.sin(rad) * RADIUS - OFFSET}px` })
      btn.style.setProperty("--f-dur", `${3.1 + i * 0.28}s`)
      btn.style.setProperty("--f-off", `${400 + i * 70}ms`)
      btn.innerHTML = `<span class="cc-ni">${node.icon}</span><span class="cc-nl">${node.label}</span>`

      if (node.id === "meditate" && node.subNodes) {
        meditateBtnRef = btn


        btn.addEventListener("mouseenter", () => {
          if (subCloseTimer) { clearTimeout(subCloseTimer); subCloseTimer = null }
          if (!subOpen) {
            subHoverTimer = setTimeout(() => {
              if (meditateBtnRef) openSubNodes(meditateBtnRef, node as typeof NODES[1])
            }, 220)
          }
        })

        btn.addEventListener("mouseleave", () => {
          if (subHoverTimer) { clearTimeout(subHoverTimer); subHoverTimer = null }

          if (!subOpen) {
            subCloseTimer = setTimeout(closeSubNodes, 200)
          }
        })

        btn.addEventListener("click", e => {
          e.stopPropagation()
          if (subOpen) {
            closeSubNodes()
          } else {
            if (meditateBtnRef) openSubNodes(meditateBtnRef, node as typeof NODES[1])
          }
        })

        return 
      }

      btn.addEventListener("click", e => {
        e.stopPropagation()
        closeMenu()
        if (node.id === "therapist" && node.url) {
          ;(chrome as any).tabs?.create({ url: node.url }) ?? window.open(node.url, "_blank")
          return
        }
        openScreen(node.id)
      })

      document.body.appendChild(btn); nodes.push(btn)
      setTimeout(() => {
        Object.assign(btn.style, { transition: `transform .4s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms, opacity .22s ease ${i * 55}ms`, transform: "scale(1)" })
        btn.classList.add("cc-vis")
        setTimeout(() => btn.classList.add("cc-float"), 420 + i * 55)
      }, 10)
    })


    if (meditateBtnRef && !nodes.includes(meditateBtnRef)) {
      document.body.appendChild(meditateBtnRef)
      nodes.push(meditateBtnRef)
      const i = NODES.findIndex(n => n.id === "meditate")
      setTimeout(() => {
        Object.assign(meditateBtnRef!.style, { transition: `transform .4s cubic-bezier(.34,1.56,.64,1) ${i * 55}ms, opacity .22s ease ${i * 55}ms`, transform: "scale(1)" })
        meditateBtnRef!.classList.add("cc-vis")
        setTimeout(() => meditateBtnRef?.classList.add("cc-float"), 420 + i * 55)
      }, 10)
    }
  }


  window.addEventListener(CC_OPEN_MENU, openMenu)

  fab.addEventListener("click", () => {
    if (fab.classList.contains("cc-pomo-active")) {
      dispatch(CC_OPEN, { screen: "pomodoro" })
      return
    }

    if (isOpen) {
      closeSubNodes()
      closeMenu()
      return
    }
 
    dispatch("cc:fab-clicked")
  })

  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeSubNodes(); if (isOpen) closeMenu() } })
}

// ══════════════════════════════════════════════════════════════════
//  ROOT REACT COMPONENT
// ══════════════════════════════════════════════════════════════════

export default function Widget() {
  const [activeScreen, setActiveScreen] = useState<string | null>(null)
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null)
  const { isAuthenticated, isHydrated, hydrate } = useAuthStore()

  // Hydrate auth state from storage on mount
  useEffect(() => { hydrate() }, [])

  useEffect(() => {
    const el = document.getElementById("cc-root-container")
    if (el) setOverlayRoot(el)
  }, [])

  useEffect(() => {
    initWidget(icon)
  }, [])

  useEffect(() => {
    // Handle FAB click: auth gate
    const onFabClick = () => {
      console.log("fab clicked", { isHydrated, isAuthenticated })
      if (!isHydrated) return // wait for hydration
      if (!isAuthenticated) {
        setActiveScreen("auth")
      } else {
        // Tell vanilla JS to open the radial menu
        window.dispatchEvent(new CustomEvent("cc:open-menu"))
      }
    }

    const onOpen = (e: Event) => {
      const screen = (e as CustomEvent<{ screen: string }>).detail?.screen
      if (screen) setActiveScreen(screen)
    }
    const onClose = () => setActiveScreen(null)

    window.addEventListener("cc:fab-clicked", onFabClick)
    window.addEventListener(CC_OPEN, onOpen)
    window.addEventListener(CC_CLOSE, onClose)
    return () => {
      window.removeEventListener("cc:fab-clicked", onFabClick)
      window.removeEventListener(CC_OPEN, onOpen)
      window.removeEventListener(CC_CLOSE, onClose)
    }
  }, [isAuthenticated, isHydrated])

  const close = () => {
    setActiveScreen(null)
    dispatch(CC_CLOSE)
  }

  // After successful auth: close auth overlay and open the radial menu
  const handleAuthSuccess = () => {
    setActiveScreen(null)
    // Small delay so state updates propagate
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("cc:open-menu"))
    }, 120)
  }

  const screenEl = (() => {
    switch (activeScreen) {
      case "auth":
        return <AuthScreen onSuccess={handleAuthSuccess} onClose={close} />
      case "chat":
        return <ChatScreen onBack={close} />
      case "breathe":
        return <BreatheScreen onBack={close} />
      case "sounds":
        return <SoundsScreen onBack={close} />
      case "pomodoro":
        return (
          <PomodoroScreen
            onBack={() => {
              dispatch(CC_POMO_TICK, { timeLeft: 0, running: false, mode: "focus" })
              close()
            }}
            onTick={(timeLeft, running, mode) => {
              dispatch(CC_POMO_TICK, { timeLeft, running, mode })
            }}
            onMinimize={close}
          />
        )
      case "quote":
        return <QuoteScreen onBack={close} />
      default:
        return null
    }
  })()

  if (!screenEl) return null

  const isAuthScreen = activeScreen === "auth"
  return overlayRoot
    ? createPortal(
      <QueryClientProvider client={queryClient}>
        <OverlayShell onClose={close} wide={isAuthScreen}>
         
           {screenEl}
        </OverlayShell>
      </QueryClientProvider>,
      overlayRoot
    ) : null
}