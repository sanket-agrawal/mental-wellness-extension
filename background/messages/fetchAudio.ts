import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const { url } = req.body as { url: string }
    
    const response = await fetch(url)
    if (!response.ok) {
      return res.send({ error: `HTTP ${response.status}` })
    }
    
    const arrayBuffer = await response.arrayBuffer()
    const uint8 = new Uint8Array(arrayBuffer)
    
    let binary = ""
    const chunkSize = 8192
    for (let i = 0; i < uint8.length; i += chunkSize) {
      binary += String.fromCharCode(...uint8.subarray(i, i + chunkSize))
    }
    const base64 = btoa(binary)
    
    res.send({ base64 })
  } catch (err) {
    res.send({ error: err instanceof Error ? err.message : "Unknown error" })
  }
}

export default handler