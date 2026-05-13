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



export  const POMO_DEFAULTS: Record<PomodoroMode, number> = { focus: 25, short: 5, long: 15 }
export const POMO_LABELS: Record<PomodoroMode, string> = { focus: "Focus", short: "Short Break", long: "Long Break" }
export const CIRC = 2 * Math.PI * 88
export const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`





export const randFrom = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)]

export const QUOTES = [
  { text: "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, annoyed, or anxious.", author: "Lori Deschene" },
  { text: "Even the darkest night will end and the sun will rise.", author: "Victor Hugo" },
  { text: "You are allowed to be both a masterpiece and a work in progress simultaneously.", author: "Sophia Bush" },
  { text: "Healing is not linear. Be gentle with yourself.", author: "Unknown" },
  { text: "The bravest thing I ever did was continuing my life when I wanted to die.", author: "Juliette Lewis" },
]
export const AFFIRMATIONS = [
  "I am worthy of love and care, especially from myself.",
  "This moment is hard, but I have survived hard moments before.",
  "My feelings are valid, and I am allowed to feel them.",
  "I am doing the best I can, and that is enough.",
]
export const FEELING_OPTIONS = [
  { symbol: "💙", label: "Seen" }, { symbol: "✨", label: "Hopeful" },
  { symbol: "🌱", label: "Calm" },  { symbol: "💭", label: "Thinking" },
]