export type Screen =
  | "home"
  | "menu"
  | "pomodoro"
  | "chat"
  | "quote"
  | "meditate"

export type PomodoroMode =
  | "focus"
  | "short"
  | "long"

export interface Quote {
  text: string
  author: string
}

export interface Message {
  id: string
  role: "user" | "ai"
  text: string
}

export interface FeelingOption {
  label: string
  symbol: string
}