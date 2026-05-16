import { useState, useRef, useEffect } from "react"
import { TopBar } from "../Topbar"
export const SOUNDS = [
  { id: "rain",    label: "Rain",        emoji: "🌧️", freq: 200, type: "noise" as const },
  { id: "ocean",   label: "Ocean",       emoji: "🌊", freq: 120, type: "noise" as const },
  { id: "forest",  label: "Forest",      emoji: "🌿", freq: 440, type: "tone"  as const },
  { id: "fire",    label: "Fireplace",   emoji: "🔥", freq: 80,  type: "noise" as const },
  { id: "bowl",    label: "Singing Bowl",emoji: "🪘", freq: 396, type: "tone"  as const },
  { id: "white",   label: "White Noise", emoji: "〰️", freq: 300, type: "noise" as const },
]

export function SoundsScreen({ onBack }: { onBack: () => void }) {
  const [playing, setPlaying] = useState<string | null>(null)
  const [volume, setVolume] = useState(0.6)
  const ctxRef = useRef<AudioContext | null>(null)
  const nodesRef = useRef<{ src: AudioBufferSourceNode | OscillatorNode; gain: GainNode } | null>(null)

  const stop = () => {
    nodesRef.current?.gain.gain.setTargetAtTime(0, ctxRef.current!.currentTime, 0.3)
    setTimeout(() => { try { nodesRef.current?.src.stop() } catch {} nodesRef.current = null }, 400)
    setPlaying(null)
  }

  const play = (s: typeof SOUNDS[0]) => {
    if (playing === s.id) { stop(); return }
    if (playing) stop()
    if (!ctxRef.current) ctxRef.current = new AudioContext()
    const ctx = ctxRef.current
    const gain = ctx.createGain(); gain.gain.value = 0
    gain.connect(ctx.destination)
    gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.5)

    if (s.type === "noise") {
      const bufLen = ctx.sampleRate * 4
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
      const data = buf.getChannelData(0)
      for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource(); src.buffer = buf; src.loop = true
      const filter = ctx.createBiquadFilter(); filter.type = "lowpass"; filter.frequency.value = s.freq
      src.connect(filter); filter.connect(gain); src.start()
      nodesRef.current = { src, gain }
    } else {
      const osc = ctx.createOscillator(); osc.type = "sine"; osc.frequency.value = s.freq
      osc.connect(gain); osc.start()
      nodesRef.current = { src: osc, gain }
    }
    setPlaying(s.id)
  }

  useEffect(() => {
    if (nodesRef.current) nodesRef.current.gain.gain.setTargetAtTime(volume, ctxRef.current!.currentTime, 0.1)
  }, [volume])

  useEffect(() => () => { stop() }, [])

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: 420 }}>
      <TopBar title="Meditate" onBack={onBack} />
      <div style={{ flex: 1, padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {SOUNDS.map(s => {
            const active = playing === s.id
            return (
              <button
                key={s.id}
                onClick={() => play(s)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 6, padding: "14px 8px", borderRadius: 14, cursor: "pointer",
                  background: active ? "#0c3e6f" : "rgba(255,255,255,.85)",
                  border: `1.5px solid ${active ? "rgba(22,183,194,.5)" : "rgba(12,62,111,.1)"}`,
                  boxShadow: active ? "0 4px 18px rgba(12,62,111,.22)" : "0 2px 8px rgba(12,62,111,.06)",
                  transition: "all .22s ease",
                }}
              >
                <span style={{ fontSize: 26 }}>{s.emoji}</span>
                <span style={{ fontSize: 10.5, fontWeight: 500, color: active ? "#16B7C2" : "#2a5a8a" }}>{s.label}</span>
                {active && (
                  <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 3, borderRadius: 2, background: "#16B7C2",
                        animation: `ccSoundBar .8s ${i * 0.15}s ease-in-out infinite alternate`,
                        height: 8,
                      }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
          <span style={{ fontSize: 11, color: "#6a8fab", minWidth: 48 }}>Volume</span>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{ flex: 1, accentColor: "#16B7C2" }}
          />
          <span style={{ fontSize: 11, color: "#6a8fab", minWidth: 28, textAlign: "right" }}>{Math.round(volume * 100)}%</span>
        </div>
        {!playing && (
          <p style={{ fontSize: 11, color: "#8aadcc", textAlign: "center", fontWeight: 300, lineHeight: 1.6 }}>
            Choose a sound to create your calm space
          </p>
        )}
      </div>
    </div>
  )
}
