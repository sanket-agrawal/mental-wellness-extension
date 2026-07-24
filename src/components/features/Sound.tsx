import React, { useState, useRef, useEffect, useCallback } from "react"
import {
  FiZap, FiActivity, FiFeather, FiWind, FiDroplet, FiCloud,
  FiCloudRain, FiStar, FiCompass, FiCoffee, FiBookOpen, FiHome,
  FiHeadphones, FiTarget, FiCpu, FiTrendingUp, FiCircle, FiMoon,
  FiSun, FiHeart, FiVolume2,
} from "react-icons/fi"
import { GiWaterfall, GiForestCamp, GiWaves, GiFireflake } from "react-icons/gi"
import { MdSelfImprovement } from "react-icons/md"
import { sendToBackground } from "@plasmohq/messaging"
import { TopBar } from "../Topbar"
import { config } from "../../lib/config/sound"

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────
type Category = "Focus" | "Relax" | "Sleep" | "Meditation" | "Healing" | "Nature" | "Ambient" | "Space"

interface SoundDef {
  id: string
  label: string
  category: Category
  icon: React.ComponentType<{ size?: number; color?: string }>
  freq: number
  type: "noise" | "tone"
  benefit: string
  audioUrl: string
}

// ─────────────────────────────────────────────────────────────────────────
// Sound definitions
// ─────────────────────────────────────────────────────────────────────────
const CATEGORY_SOUNDS: {
  category: Category
  categoryIcon: React.ComponentType<{ size?: number; color?: string }>
  type: "noise" | "tone"
  freqs: number[]
  names: string[]
  benefits: string[]
  icons: React.ComponentType<{ size?: number; color?: string }>[]
}[] = [
    {
      category: "Focus", categoryIcon: FiZap, type: "noise",
      freqs: [400, 600, 500],
      names: ["Deep Focus", "Study Flow", "Coding Session"],
      benefits: ["Sharpens concentration", "Sustains deep work", "Eases coding flow"],
      icons: [FiTarget, FiTrendingUp, FiCpu],
      // ── Extra Focus sounds commented out — only 3 real audio files available ──
      // freqs: [450, 550, 480, 520, 470, 530, 490],
      // names: ["Productivity Boost", "Creative Mind", "Laser Focus", "Work Zone", "Concentration Flow", "Focus Pulse", "Mind Clarity"],
      // benefits: ["Boosts productivity", "Sparks creative ideas", "Razor-sharp attention", "Clears mental clutter", "Steady work rhythm", "Rhythmic focus boost", "Untangles racing thoughts"],
      // icons: [FiZap, FiActivity, FiTarget, FiHome, FiCircle, FiZap, FiFeather],
    },
    /* ── Remaining categories commented out — keeping only 3 sounds total ──
    {
      category: "Relax", categoryIcon: FiFeather, type: "noise",
      freqs: [200, 120, 300, 250, 180, 220, 160, 280, 240, 200],
      names: ["Gentle Rain", "Ocean Breeze", "Mountain Stream", "Forest Whisper", "Calm Evening", "Peaceful Meadow", "Soft Wind", "Golden Sunset", "Nature Harmony", "Quiet Escape"],
      benefits: ["Melts away tension", "Coastal calm", "Soothing water flow", "Whispers through leaves", "Unwinds the evening", "Quiets a busy mind", "Gentle breeze calm", "Warm golden stillness", "Reconnects with nature", "A moment of quiet"],
      icons: [FiCloudRain, FiWind, FiDroplet, GiForestCamp, FiMoon, FiFeather, FiWind, FiSun, GiWaves, FiCompass],
    },
    {
      category: "Sleep", categoryIcon: FiMoon, type: "noise",
      freqs: [80, 100, 150, 90, 70, 60, 110, 85, 95, 75],
      names: ["Deep Sleep", "Dream Journey", "Night Rain", "Midnight Forest", "Sleeping Cabin", "Thunder Sleep", "Moonlight Drift", "Silent Night", "Night Crickets", "Sleep Sanctuary"],
      benefits: ["Eases into deep sleep", "Drifts you to dreams", "Steady night rainfall", "Hushed midnight woods", "Cozy cabin stillness", "Distant rolling thunder", "Soft lunar drift", "Wraps you in silence", "Gentle cricket lullaby", "A sanctuary for rest"],
      icons: [FiMoon, FiStar, FiCloudRain, GiForestCamp, FiHome, FiCloud, FiMoon, FiCircle, FiFeather, FiHome],
    },
    {
      category: "Meditation", categoryIcon: MdSelfImprovement, type: "tone",
      freqs: [396, 432, 528, 417, 639, 741, 852, 963, 174, 285],
      names: ["Spiritual Meditation", "Inner Peace", "Mindful Breathing", "Zen Garden", "Sacred Journey", "Soul Reflection", "Cosmic Meditation", "Morning Mindfulness", "Temple Serenity", "Meditation Flow"],
      benefits: ["Opens spiritual awareness", "Settles inner peace", "Anchors the breath", "Stillness of the garden", "Guides a sacred journey", "Invites soul reflection", "Expands cosmic awareness", "Grounds the morning mind", "Temple-like serenity", "Flows with meditation"],
      icons: [MdSelfImprovement, FiHeart, FiActivity, GiFireflake, FiCompass, FiStar, FiCircle, FiSun, FiBookOpen, MdSelfImprovement],
    },
    {
      category: "Healing", categoryIcon: FiHeart, type: "tone",
      freqs: [528, 432, 396, 417, 285, 174, 639, 741, 852, 963],
      names: ["Healing Energy", "Self Healing", "Emotional Release", "Heart Harmony", "Soul Healing", "Inner Balance", "Energy Cleanse", "Healing Light", "Positive Vibrations", "Restorative Calm"],
      benefits: ["Restores healing energy", "Nurtures self-care", "Releases stored emotion", "Harmonizes the heart", "Mends the soul", "Restores inner balance", "Cleanses stagnant energy", "Bathes you in light", "Lifts positive vibration", "Restorative, gentle calm"],
      icons: [FiHeart, FiHeart, FiActivity, FiHeart, FiFeather, FiCircle, FiZap, FiSun, FiTrendingUp, FiFeather],
    },
    {
      category: "Nature", categoryIcon: GiWaves, type: "noise",
      freqs: [200, 120, 180, 350, 250, 80, 160, 300, 220, 100],
      names: ["Rain On Window", "Ocean Waves", "Waterfall Escape", "Forest Birds", "Jungle Sounds", "Campfire Nights", "River Journey", "Mountain Winds", "Desert Breeze", "Snowfall Ambience"],
      benefits: ["Rain tapping the glass", "Endless ocean waves", "Tumbling waterfall escape", "Birdsong at dawn", "Alive jungle chorus", "Crackling campfire nights", "Flowing river journey", "Winds across the peaks", "Dry desert breeze", "Soft falling snow"],
      icons: [FiCloudRain, GiWaves, GiWaterfall, FiFeather, GiForestCamp, FiHome, FiDroplet, FiWind, FiWind, GiFireflake],
    },
    {
      category: "Ambient", categoryIcon: FiCoffee, type: "noise",
      freqs: [300, 400, 200, 350, 250, 280, 320, 260, 380, 240],
      names: ["Cozy Cabin", "Coffee Shop", "Library Silence", "Airport Lounge", "City Rain", "Bookstore Vibes", "Fireplace Room", "Vintage Study", "Night Drive", "Peaceful Room"],
      benefits: ["Cozy cabin warmth", "Murmuring coffee shop", "Hushed library calm", "Distant airport hum", "Rain over the city", "Pages and quiet chatter", "Glowing fireplace room", "Old-world study nook", "Late-night city drive", "A peaceful room to think"],
      icons: [FiHome, FiCoffee, FiBookOpen, FiCompass, FiCloudRain, FiBookOpen, FiHome, FiBookOpen, FiMoon, FiHome],
    },
    {
      category: "Space", categoryIcon: FiStar, type: "tone",
      freqs: [174, 285, 396, 417, 528, 639, 741, 852, 963, 432],
      names: ["Cosmic Drift", "Astral Journey", "Deep Universe", "Nebula Dreams", "Galaxy Echoes", "Starlight Meditation", "Interstellar Calm", "Celestial Flow", "Astral Current", "Cosmic Sanctuary"],
      benefits: ["Drifting through the cosmos", "An astral voyage", "Vast universe stillness", "Dreaming nebula colors", "Echoes across the galaxy", "Meditation under starlight", "Interstellar calm", "Celestial flow state", "Currents of the stars", "A sanctuary among stars"],
      icons: [FiCircle, FiCompass, FiCircle, FiStar, FiActivity, FiStar, FiFeather, FiTrendingUp, FiWind, FiHome],
    },
    */
  ]

const CATEGORIES = CATEGORY_SOUNDS.map(c => c.category)

const categoryIconMap = Object.fromEntries(
  CATEGORY_SOUNDS.map(c => [c.category, c.categoryIcon])
) as Record<Category, React.ComponentType<{ size?: number; color?: string }>>

// ─────────────────────────────────────────────────────────────────────────
// Audio URLs
// ─────────────────────────────────────────────────────────────────────────
const TEST_AUDIOS = [
  `${config.audioCdn}/focus-meditation.mp3`,
  `${config.audioCdn}/sleep-meditation.mp3`,
  `${config.audioCdn}/autumn-sky-meditation.mp3`,
]

const slugify = (v: string) =>
  v.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-+|-+$)/g, "")

let globalIndex = 0

export const SOUNDS: SoundDef[] = CATEGORY_SOUNDS.flatMap(
  ({ category, type, freqs, names, benefits, icons }) =>
    names.map((label, i) => ({
      id: `${slugify(category)}-${slugify(label)}`,
      label,
      category,
      icon: icons[i],
      freq: freqs[i],
      type,
      benefit: benefits[i],
      audioUrl: TEST_AUDIOS[(globalIndex++) % TEST_AUDIOS.length],
    }))
)


const isContentScript = (() => {
  try {
    return (
      typeof window !== "undefined" &&
      !window.location.href.startsWith("chrome-extension://") &&
      !window.location.href.startsWith("moz-extension://")
    )
  } catch {
    return false
  }
})()

// base64 → ArrayBuffer helper
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

async function fetchAudioBuffer(url: string, ctx: AudioContext): Promise<AudioBuffer> {
  if (isContentScript) {

    try {
      const res = await fetch(url, { mode: "cors" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = await res.arrayBuffer()
      return ctx.decodeAudioData(buf)
    } catch {

      const result = await sendToBackground({
        name: "fetchAudio" as never,
        body: { url },
      }) as { base64?: string; error?: string }
      console.log("Background response:", result)
      if (result.error || !result.base64) {
        throw new Error(result.error ?? "Empty response from background")
      }
      const arrayBuffer = base64ToArrayBuffer(result.base64)
      return ctx.decodeAudioData(arrayBuffer)
    }
  } else {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const buf = await res.arrayBuffer()
    return ctx.decodeAudioData(buf)
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Audio types
// ─────────────────────────────────────────────────────────────────────────
interface AudioHandle {
  src: AudioBufferSourceNode | OscillatorNode | MediaElementAudioSourceNode | null
  audioEl?: HTMLAudioElement
  gain: GainNode
}

type VolumeMap = Record<string, number>
type PlayingMap = Record<string, boolean>

// ─────────────────────────────────────────────────────────────────────────
// Pink-noise buffer
// ─────────────────────────────────────────────────────────────────────────
function createPinkNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const length = ctx.sampleRate * 4
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.96900 * b2 + w * 0.1538520
    b3 = 0.86650 * b3 + w * 0.3104856
    b4 = 0.55000 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
  }
  return buffer
}

// ─────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────
const FADE_S = 0.8
const DEFAULT_VOL = 0.65

// ─────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────
export function SoundsScreen({ onBack, onMinimize, hideBackButton }: { onBack: () => void; onMinimize?: () => void; hideBackButton?: boolean }) {
  const [playing, setPlaying] = useState<PlayingMap>({})
  const [volumes, setVolumes] = useState<VolumeMap>({})
  const [masterVol, setMasterVol] = useState(0.7)
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All")

  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<Map<string, AudioHandle>>(new Map())
  const masterRef = useRef<GainNode | null>(null)

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
      masterRef.current = ctxRef.current.createGain()
      masterRef.current.gain.value = masterVol
      masterRef.current.connect(ctxRef.current.destination)
    }
    return ctxRef.current
  }, [])

  const getMaster = useCallback((): GainNode => {
    getCtx()
    return masterRef.current!
  }, [getCtx])

  const getSoundVol = useCallback(
    (id: string) => volumes[id] ?? DEFAULT_VOL,
    [volumes]
  )

  const stopSound = useCallback((id: string) => {
    const handle = nodesRef.current.get(id)
    if (!handle) return
    const ctx = ctxRef.current
    if (!ctx) return
    const { gain, src, audioEl } = handle
    const now = ctx.currentTime
    gain.gain.cancelScheduledValues(now)
    gain.gain.setValueAtTime(gain.gain.value, now)
    gain.gain.linearRampToValueAtTime(0, now + FADE_S)
    setTimeout(() => {
      if (audioEl) {
        try {
          audioEl.pause()
          audioEl.src = ""
        } catch {}
      }
      if (src) {
        try {
          if (typeof (src as any).stop === "function") {
            (src as any).stop()
          }
        } catch { /* already stopped */ }
        try {
          src.disconnect()
        } catch {}
      }
      try {
        gain.disconnect()
      } catch {}
      nodesRef.current.delete(id)
    }, (FADE_S + 0.1) * 1000)
    setPlaying(prev => { const next = { ...prev }; delete next[id]; return next })
  }, [])

  const startSound = useCallback((s: SoundDef) => {
    console.log("startSound called", s.id, "isContentScript:", isContentScript)
    if (nodesRef.current.has(s.id)) return
    const ctx = getCtx()
    const master = getMaster()
    const gain = ctx.createGain()
    gain.gain.value = 0
    gain.connect(master)

    const target = getSoundVol(s.id)
    const now = ctx.currentTime
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(target, now + FADE_S)

    nodesRef.current.set(s.id, { src: null, gain })

    const useFallback = (err?: unknown) => {
      console.warn("[CC Sound] CDN failed, fallback. Reason:", err)
      if (!nodesRef.current.has(s.id)) return
      let src: AudioBufferSourceNode | OscillatorNode
      if (s.type === "noise") {
        const bufSrc = ctx.createBufferSource()
        bufSrc.buffer = createPinkNoiseBuffer(ctx)
        bufSrc.loop = true
        const filter = ctx.createBiquadFilter()
        filter.type = "lowpass"
        filter.frequency.value = s.freq
        bufSrc.connect(filter)
        filter.connect(gain)
        bufSrc.start()
        src = bufSrc
      } else {
        const osc = ctx.createOscillator()
        osc.type = "sine"
        osc.frequency.value = s.freq
        osc.connect(gain)
        osc.start()
        src = osc
      }
      const existing = nodesRef.current.get(s.id)
      if (existing) {
        existing.src = src
        existing.audioEl = undefined
      }
    }

    const loadViaBufferFetch = () => {
      fetchAudioBuffer(s.audioUrl, ctx)
        .then(decoded => {
          if (!nodesRef.current.has(s.id)) return
          const bufSrc = ctx.createBufferSource()
          bufSrc.buffer = decoded
          bufSrc.loop = true
          bufSrc.connect(gain)
          bufSrc.start()
          const existing = nodesRef.current.get(s.id)
          if (existing) {
            existing.src = bufSrc
            existing.audioEl = undefined
          }
        })
        .catch(useFallback)
    }

    // Try HTML5 Audio Streaming first for instant playback
    const audio = new Audio(s.audioUrl)
    audio.crossOrigin = "anonymous"
    audio.loop = true

    const mediaSrc = ctx.createMediaElementSource(audio)
    mediaSrc.connect(gain)

    const handleAudioError = (err?: any) => {
      if (!nodesRef.current.has(s.id)) return
      const currentHandle = nodesRef.current.get(s.id)
      if (currentHandle && currentHandle.audioEl === audio) {
        console.warn("[CC Sound] HTML5 Audio streaming failed, trying buffer fetch. Error:", err)
        try {
          audio.pause()
          audio.src = ""
        } catch {}
        try {
          mediaSrc.disconnect()
        } catch {}
        loadViaBufferFetch()
      }
    }

    audio.addEventListener("error", handleAudioError)

    const existing = nodesRef.current.get(s.id)
    if (existing) {
      existing.src = mediaSrc
      existing.audioEl = audio
    }

    audio.play().catch(handleAudioError)

    setPlaying(prev => ({ ...prev, [s.id]: true }))
  }, [getCtx, getMaster, getSoundVol])
  
const toggle = useCallback((s: SoundDef) => {
  if (playing[s.id]) {
    stopSound(s.id)
    return
  }
  // Only one sound at a time — stop any other sound that's currently playing
  Object.keys(playing).forEach(id => {
    if (id !== s.id) stopSound(id)
  })
  startSound(s)
}, [playing, stopSound, startSound])

  const handleSoundVolume = useCallback((id: string, value: number) => {
    setVolumes(prev => ({ ...prev, [id]: value }))
    const handle = nodesRef.current.get(id)
    if (handle && ctxRef.current) {
      handle.gain.gain.setTargetAtTime(value, ctxRef.current.currentTime, 0.05)
    }
  }, [])

  const handleMasterVolume = useCallback((value: number) => {
    setMasterVol(value)
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(value, ctxRef.current.currentTime, 0.05)
    }
  }, [])

  useEffect(() => {
    const nodes = nodesRef.current
    const ctxSnap = ctxRef.current
    return () => {
      nodes.forEach(({ src, gain }) => {
        if (src) { try { if ("stop" in src) src.stop() } catch { /* already stopped */ }; src.disconnect() }
        gain.disconnect()
      })
      nodes.clear()
      ctxSnap?.close()
    }
  }, [])

  const anyPlaying = Object.keys(playing).length > 0
  const playingCount = Object.keys(playing).length

  const filteredSounds = activeCategory === "All"
    ? SOUNDS
    : SOUNDS.filter(s => s.category === activeCategory)

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <TopBar title="Meditate" onBack={onBack} showBack={!hideBackButton} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Category tabs ── */}
        <div style={{
          display: "flex", gap: 6, overflowX: "auto", padding: "12px 16px 0",
          scrollbarWidth: "none",
        }}>
          {(["All", ...CATEGORIES] as (Category | "All")[]).map(cat => {
            const isActive = activeCategory === cat
            const CatIcon = cat === "All" ? FiHeadphones : categoryIconMap[cat as Category]
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  flexShrink: 0, display: "flex", alignItems: "center", gap: 4,
                  padding: "5px 12px", borderRadius: 20, cursor: "pointer",
                  fontSize: 10.5, fontWeight: 600, whiteSpace: "nowrap",
                  background: isActive ? "#0c3e6f" : "rgba(255,255,255,.8)",
                  color: isActive ? "#ffffff" : "#4a7a9b",
                  border: `1.5px solid ${isActive ? "rgba(22,183,194,.4)" : "rgba(12,62,111,.1)"}`,
                  transition: "all .18s ease",
                }}
              >
                <CatIcon size={11} />
                <span>{cat}</span>
              </button>
            )
          })}
        </div>

        {/* ── Sound grid (scrollable) ── */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "12px 16px",
          scrollbarWidth: "thin",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10,
          }}>
            {filteredSounds.map(s => {
              const active = !!playing[s.id]
              const vol = getSoundVol(s.id)
              const SoundIcon = s.icon
              return (
                <div
                  key={s.id}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 5, padding: "12px 6px 10px", borderRadius: 14,
                    background: active ? "#0c3e6f" : "rgba(255,255,255,.85)",
                    border: `1.5px solid ${active ? "rgba(22,183,194,.5)" : "rgba(12,62,111,.1)"}`,
                    boxShadow: active ? "0 4px 18px rgba(12,62,111,.22)" : "0 2px 8px rgba(12,62,111,.06)",
                    transition: "all .22s ease",
                  }}
                >
                  <button
                    onClick={() => toggle(s)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                      padding: 0, width: "100%",
                    }}
                  >
                    <SoundIcon
                      size={22}
                      color={active ? "#ffffff" : "#4a7a9b"}
                    />
                    <span style={{
                      fontSize: 9.5, fontWeight: 500, textAlign: "center", lineHeight: 1.3,
                      color: active ? "#ffffff" : "#2a5a8a",
                    }}>
                      {s.label}
                    </span>
                    {active && (
                      <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: 3, borderRadius: 2, background: "#16B7C2", height: 7,
                            animation: `ccSoundBar .8s ${i * 0.15}s ease-in-out infinite alternate`,
                          }} />
                        ))}
                      </div>
                    )}
                  </button>

                  {active && (
                    <input
                      type="range" min={0} max={1} step={0.01} value={vol}
                      onClick={e => e.stopPropagation()}
                      onChange={e => handleSoundVolume(s.id, Number(e.target.value))}
                      style={{ width: "85%", accentColor: "#16B7C2", cursor: "pointer" }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Master volume + status ── */}
        <div style={{ padding: "8px 16px 16px", borderTop: "1px solid rgba(12,62,111,.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <FiVolume2 size={13} color="#6a8fab" />
            <input
              type="range" min={0} max={1} step={0.01} value={masterVol}
              onChange={e => handleMasterVolume(Number(e.target.value))}
              style={{ flex: 1, accentColor: "#16B7C2" }}
            />
            <span style={{ fontSize: 11, color: "#6a8fab", minWidth: 28, textAlign: "right" }}>
              {Math.round(masterVol * 100)}%
            </span>
          </div>

          {!anyPlaying && (
            <p style={{ fontSize: 11, color: "#8aadcc", textAlign: "center", fontWeight: 300, lineHeight: 1.6, marginTop: 6 }}>
              Choose a sound to create your calm space
            </p>
          )}
          {anyPlaying && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <p style={{ fontSize: 11, color: "#16B7C2", fontWeight: 500, margin: 0 }}>
                {playingCount} {playingCount === 1 ? "sound" : "sounds"} playing · tap any to stop
              </p>
              {onMinimize && (
                <button
                  onClick={onMinimize}
                  title="Minimize — music keeps playing"
                  style={{
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "4px 10px", borderRadius: 20,
                    background: "rgba(22,183,194,.12)",
                    border: "1.5px solid rgba(22,183,194,.35)",
                    color: "#16B7C2", fontSize: 10, fontWeight: 600,
                    cursor: "pointer", transition: "all .18s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(22,183,194,.22)" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(22,183,194,.12)" }}
                >
                  <span style={{ fontSize: 11 }}>–</span> Minimize
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}