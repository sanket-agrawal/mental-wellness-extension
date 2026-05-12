import type { FeelingOption, PomodoroMode, Quote } from "~src/lib/types"

export const AI_RESPONSES: Record<string, string[]> = {
  overwhelmed: [
    "That sounds like a lot to carry. What's been feeling the heaviest lately?",
    "Overwhelm usually means we're carrying more than we should alone. What's taking up the most space right now?",
  ],
  anxiety: [
    "Anxiety can feel so loud sometimes. Take a breath — what's it telling you right now?",
    "You're not your anxiety. It's just a feeling, and feelings pass. What's triggered it today?",
  ],
  sleep: [
    "Sleep struggles are exhausting in themselves. Is it your mind racing, or just restlessness?",
    "Rest is so important. What's keeping you up?",
  ],
  sad: [
    "It's okay to feel sad. You don't have to explain it or fix it right now. What's going on?",
    "Sadness deserves space, not suppression. I'm here. Tell me more.",
  ],
  lonely: [
    "Loneliness is heavy. But you reached out, and that matters. What's making you feel alone?",
    "You are not alone in this moment. I'm here. What's been making you feel disconnected?",
  ],
  motivation: [
    "Sometimes the smallest step forward is still a step. What's one tiny thing you could do right now?",
    "Motivation follows action — not the other way around. What's been holding you back?",
  ],
  default: [
    "I'm here with you. What's been on your mind today?",
    "This is a safe space — no judgment, no rush. What would you like to talk about?",
    "Sometimes just putting it into words helps. I'm listening.",
  ],
}


export const QUICK_PROMPTS = [
  "I feel overwhelmed", "I'm anxious today",
  "I can't sleep", "I feel sad",
  "I feel lonely", "I need motivation",
]


export const MEDITATE_STEPS = [
  { label: "Settle in", instruction: "Find a comfortable position. Let your hands rest gently in your lap.", duration: 8 },
  { label: "Breathe in", instruction: "Inhale slowly through your nose for 4 counts.", duration: 4 },
  { label: "Hold", instruction: "Hold gently at the top. Soft and easy.", duration: 4 },
  { label: "Breathe out", instruction: "Exhale slowly through your mouth for 6 counts. Let everything go.", duration: 6 },
  { label: "Rest", instruction: "Sit with the stillness for a moment. Notice how you feel.", duration: 4 },
]


export const POMO_DEFAULTS: Record<PomodoroMode, number> = { focus: 25, short: 5, long: 15 }
export const POMO_LABELS: Record<PomodoroMode, string> = { focus: "Focus", short: "Short Break", long: "Long Break" }
export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

export const CIRC = 2 * Math.PI * 88



export const randFrom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export const AFFIRMATIONS = [
  "You showed up today. That's enough.",
  "Progress, not perfection.",
  "One breath at a time.",
  "You are not alone in this.",
  "Rest is productive too.",
  "Your feelings are valid.",
  "You have made it through 100% of your hard days.",
]


export const QUOTES: Quote[] = [
  { text: "You don't have to be positive all the time. It's okay to feel sad, angry, or anxious. Having feelings doesn't make you negative — it makes you human.", author: "Lori Deschene" },
  { text: "Almost everything will work again if you unplug it for a few minutes — including you.", author: "Anne Lamott" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Breathe. You're going to be okay. You've survived every difficult day so far.", author: "Daniell Koepke" },
  { text: "Be gentle with yourself. You are a child of the universe, no less than the trees and the stars.", author: "Max Ehrmann" },
  { text: "You yourself, as much as anybody in the entire universe, deserve your love and affection.", author: "Buddha" },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "Healing is not linear. Be patient with yourself — every small step counts.", author: "Unknown" },
  { text: "You are braver than you believe, stronger than you seem, and smarter than you think.", author: "A.A. Milne" },
  { text: "Rest is not idle. Rest is the work of letting yourself be whole again.", author: "Unknown" },
  { text: "The present moment is the only time over which we have dominion.", author: "Thich Nhat Hanh" },
  { text: "You don't have to earn rest. You deserve it simply because you exist.", author: "Unknown" },
]

export const FEELING_OPTIONS: FeelingOption[] = [
  { label: "Seen", symbol: "◇" },
  { label: "Hopeful", symbol: "✦" },
  { label: "Calm", symbol: "○" },
  { label: "Grateful", symbol: "◈" },
]
