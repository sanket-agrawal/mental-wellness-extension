import type { PlasmoMessaging } from "@plasmohq/messaging"

export interface ApiProxyRequest {
  url: string
  method?: string
  headers?: Record<string, string>
  body?: unknown
}

export interface ApiProxyResponse {
  ok: boolean
  status: number
  data?: unknown
  error?: string
}

const handler: PlasmoMessaging.MessageHandler<
  ApiProxyRequest,
  ApiProxyResponse
> = async (req, res) => {
  try {
    const { url, method = "GET", headers = {}, body } = req.body!

    const response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })

    const data = await response.json().catch(() => null)

    res.send({ ok: response.ok, status: response.status, data })
  } catch (err) {
    res.send({
      ok: false,
      status: 0,
      error: err instanceof Error ? err.message : "Unknown error",
    })
  }
}

export default handler
