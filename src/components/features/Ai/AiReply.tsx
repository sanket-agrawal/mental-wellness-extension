import { AI_RESPONSES } from "~src/lib/constants/contant"



export function getAIReply(text: string): string {
  const t = text.toLowerCase()
  const key =
    t.includes("overwhelm") || t.includes("too much") ? "overwhelmed" :
    t.includes("anxi") || t.includes("worry") || t.includes("stress") ? "anxiety" :
    t.includes("sleep") || t.includes("tired") ? "sleep" :
    t.includes("sad") || t.includes("depress") || t.includes("cry") ? "sad" :
    t.includes("alone") || t.includes("lonely") ? "lonely" :
    t.includes("motiv") || t.includes("stuck") ? "motivation" : "default"
  const pool = AI_RESPONSES[key]
  return pool[Math.floor(Math.random() * pool.length)]
}