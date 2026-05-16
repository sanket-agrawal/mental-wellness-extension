export type PomodoroMode = "focus" | "short" | "long"

export const LABELS: Record<PomodoroMode, string> = {
  focus: "Focus",
  short: "Short Break",
  long:  "Long Break",
}

// ← short break default is now 5 minutes; long is 15
export const DEFAULTS: Record<PomodoroMode, number> = {
  focus: 25,
  short: 5,
  long:  15,
}

export interface PomoState {
  mode:       PomodoroMode
  timeLeft:   number
  total:      number
  running:    boolean
  sessions:   number
  customMins: Record<PomodoroMode, number>
}

type Listener = (state: PomoState) => void

// ─── Internal state ──────────────────────────────────────────────────────────
const state: PomoState = {
  mode:       "focus",
  timeLeft:   DEFAULTS.focus * 60,
  total:      DEFAULTS.focus * 60,
  running:    false,
  sessions:   0,
  customMins: { ...DEFAULTS },
}

let intervalId: ReturnType<typeof setInterval> | null = null
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach(fn => fn({ ...state }))
}

// ─── Sophisticated Chime ─────────────────────────────────────────────────────
// Uses layered harmonics, gentle vibrato, and a reverb-like exponential tail.
// "done"        → ascending pentatonic arpeggio with shimmer overtones
// "break_start" → warm descending minor-seventh interval, signals rest
function playChime(type: "done" | "break_start" = "done") {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Shared soft reverb simulation: delayed copies at lower gain
    function scheduleNote(
      freq: number,
      startTime: number,
      duration: number,
      peakGain: number,
      waveform: OscillatorType = "sine",
      vibratoHz = 5.2,
      vibratoDepth = 0.004,
    ) {
      // Primary tone
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()

      // Vibrato LFO
      const lfo  = ctx.createOscillator()
      const lfoG = ctx.createGain()
      lfo.frequency.value = vibratoHz
      lfoG.gain.value = freq * vibratoDepth
      lfo.connect(lfoG)
      lfoG.connect(osc.frequency)
      lfo.start(startTime)
      lfo.stop(startTime + duration + 0.1)

      osc.type = waveform
      osc.frequency.value = freq
      osc.connect(gain)
      gain.connect(ctx.destination)

      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.06)
      gain.gain.setValueAtTime(peakGain, startTime + duration * 0.45)
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

      osc.start(startTime)
      osc.stop(startTime + duration + 0.05)

      // Harmonic overtone at 2× frequency for shimmer
      const osc2  = ctx.createOscillator()
      const gain2 = ctx.createGain()
      osc2.type = "sine"
      osc2.frequency.value = freq * 2.001 // slight detune for warmth
      osc2.connect(gain2)
      gain2.connect(ctx.destination)
      gain2.gain.setValueAtTime(0, startTime)
      gain2.gain.linearRampToValueAtTime(peakGain * 0.08, startTime + 0.08)
      gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.7)
      osc2.start(startTime)
      osc2.stop(startTime + duration + 0.05)

      // Sub-harmonic at ½ frequency for warmth
      const osc3  = ctx.createOscillator()
      const gain3 = ctx.createGain()
      osc3.type = "sine"
      osc3.frequency.value = freq * 0.5
      osc3.connect(gain3)
      gain3.connect(ctx.destination)
      gain3.gain.setValueAtTime(0, startTime)
      gain3.gain.linearRampToValueAtTime(peakGain * 0.05, startTime + 0.1)
      gain3.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.6)
      osc3.start(startTime)
      osc3.stop(startTime + duration + 0.05)
    }

    const now = ctx.currentTime

    if (type === "done") {
      // Ascending pentatonic: C4 E4 G4 B4 E5 — joyful, expansive, resolved
      // Each note staggered with increasing duration for a "bloom" effect
      const notes = [
        { f: 261.63, t: 0.00, d: 1.1, g: 0.18 }, // C4
        { f: 329.63, t: 0.16, d: 1.1, g: 0.20 }, // E4
        { f: 392.00, t: 0.32, d: 1.1, g: 0.21 }, // G4
        { f: 493.88, t: 0.48, d: 1.2, g: 0.20 }, // B4
        { f: 659.25, t: 0.68, d: 1.6, g: 0.19 }, // E5 — held, shimmers
      ]
      notes.forEach(({ f, t, d, g }) => {
        scheduleNote(f, now + t, d, g, "sine", 5.5, 0.003)
      })
      // Final chord wash: C5 + E5 together (slight delay, softer)
      scheduleNote(523.25, now + 0.82, 1.8, 0.10, "sine", 4.8, 0.002)
    } else {
      // break_start → descending warm interval: A4 → E4, unhurried, inviting rest
      // Minor-seventh resolution feel: tension → release
      scheduleNote(440.00, now + 0.00, 1.4, 0.18, "sine", 4.2, 0.003) // A4
      scheduleNote(329.63, now + 0.32, 1.6, 0.16, "sine", 3.8, 0.003) // E4
      // Soft pad underneath: C4 barely audible, "bed" for the rest interval
      scheduleNote(261.63, now + 0.10, 1.8, 0.06, "sine", 3.0, 0.001)
    }
  } catch (e) {
    console.warn("Audio not available", e)
  }
}

// ─── Browser notification ────────────────────────────────────────────────────
async function sendNotification(title: string, body: string) {
  try {
    if (!("Notification" in window)) return
    if (Notification.permission === "default") await Notification.requestPermission()
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: (chrome as any)?.runtime?.getURL?.("assets/icon.png") ?? undefined,
        silent: true,
        tag: "cc-pomodoro",
      })
    }
  } catch (e) {
    console.warn("Notification error:", e)
  }
}

// ─── Internal: start break after focus ends ──────────────────────────────────
function _startBreak() {
  // "long" break only if user has set a long duration AND it's every 4th session
  const isLong = state.sessions % 4 === 0 && state.customMins.long > 0
  const nextMode: PomodoroMode = isLong ? "long" : "short"

  // If short break not customised it falls back to DEFAULTS.short (5 min)
  const nextMins = state.customMins[nextMode] > 0
    ? state.customMins[nextMode]
    : DEFAULTS[nextMode]          // ← guarantees 5 min if somehow 0

  const nextSecs   = nextMins * 60
  const breakLabel = isLong ? "Long Break" : "Short Break"

  state.mode     = nextMode
  state.timeLeft = nextSecs
  state.total    = nextSecs
  state.running  = false
  notify()

  // Immediate "focus done" chime, then 1.8 s later the "break starting" chime
  playChime("done")
  setTimeout(() => playChime("break_start"), 1800)

  sendNotification(
    "🎯 Focus session complete!",
    `Starting ${nextMins}-min ${breakLabel}. Great work!`
  )

  // ← Auto-toast fires immediately so it's visible even if panel is minimised
  window.dispatchEvent(new CustomEvent("cc:pomo-toast", {
    detail: {
      message: `Focus done! ${nextMins}-min ${breakLabel} starting…`,
      sub:       "Break starts in",
      countdown: 3,
    },
  }))

  // Auto-start the break after 3 s
  setTimeout(() => {
    if (state.mode !== nextMode) return // user switched manually
    state.running = true
    notify()

    intervalId = setInterval(() => {
      state.timeLeft--

      if (state.timeLeft <= 0) {
        state.timeLeft = 0
        clearInterval(intervalId!); intervalId = null
        state.running  = false

        playChime("done")
        sendNotification(`☕ ${breakLabel} over!`, "Ready for your next focus session?")

        window.dispatchEvent(new CustomEvent("cc:pomo-toast", {
          detail: { message: `${breakLabel} complete! Time to focus ` },
        }))

        notify()
        return
      }

      notify()
    }, 1000)
  }, 3000)
}

// ─── Public API ───────────────────────────────────────────────────────────────
export const pomoTimer = {
  getState(): PomoState {
    return { ...state }
  },

  subscribe(fn: Listener): () => void {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },

  toggle() {
    if (state.running) {
      if (intervalId) { clearInterval(intervalId); intervalId = null }
      state.running = false
      notify()
      return
    }
    state.running = true
    notify()
    intervalId = setInterval(() => {
      state.timeLeft--
      if (state.timeLeft <= 0) {
        state.timeLeft = 0
        if (intervalId) { clearInterval(intervalId); intervalId = null }
        state.running = false
        if (state.mode === "focus") {
          state.sessions++
          _startBreak()
        } else {
          const bl = state.mode === "long" ? "Long Break" : "Short Break"
          playChime("done")
          sendNotification("☕ Break over!", "Ready for your next focus session?")
          window.dispatchEvent(new CustomEvent("cc:pomo-toast", {
            detail: { message: `${bl} complete! Time to focus ` },
          }))
          notify()
        }
        return
      }
      notify()
    }, 1000)
  },

  reset() {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    state.running  = false
    state.timeLeft = state.customMins[state.mode] * 60
    state.total    = state.timeLeft
    notify()
  },

  skip() {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    state.running = false
    if (state.mode === "focus") {
      state.sessions++
      _startBreak()
    } else {
      this.reset()
    }
  },

  switchMode(mode: PomodoroMode) {
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    state.running  = false
    state.mode     = mode
    state.timeLeft = state.customMins[mode] * 60
    state.total    = state.timeLeft
    notify()
  },

  setCustom(mode: PomodoroMode, mins: number) {
    state.customMins = { ...state.customMins, [mode]: mins }
    if (intervalId) { clearInterval(intervalId); intervalId = null }
    state.running  = false
    state.mode     = mode
    state.timeLeft = mins * 60
    state.total    = mins * 60
    notify()
  },

  requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  },
}