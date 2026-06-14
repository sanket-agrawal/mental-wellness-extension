/**
 * background/messages/cc-open-auth.ts
 *
 * Plasmo messaging handler — content-script sends a message when an
 * unauthenticated user tries to use a tool. This handler stores "auth"
 * as the initial screen and opens the extension popup as a window so
 * the user can sign in / sign up.
 */

import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage({ area: "session" })

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // Store "auth" so the popup knows to show the auth screen on open
  await storage.set("cc_initial_screen", "auth")

  // Open the extension popup as a standalone window.
  // This is more reliable than chrome.action.openPopup() which has
  // strict user-gesture and version requirements.
  try {
    const popupUrl = chrome.runtime.getURL("popup.html")
    await chrome.windows.create({
      url: popupUrl,
      type: "popup",
      width: 420,
      height: 640,
      focused: true,
    })
  } catch (err) {
    console.warn("Failed to open auth window:", err)
  }

  res.send({ ok: true })
}

export default handler

