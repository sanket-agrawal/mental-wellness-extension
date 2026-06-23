/**
 * background/messages/cc-open-screen.ts
 *
 * Plasmo messaging handler — content-script se message aata hai,
 * screen id session storage mein save hota hai,
 * Popup.tsx ka useEffect isko read karke sahi screen pe jump karta hai.
 */

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "session" })

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const screen: string = req.body?.screen ?? "menu"
  await storage.set("cc_initial_screen", screen)
  res.send({ ok: true })
}

export default handler