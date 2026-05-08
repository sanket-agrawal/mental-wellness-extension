import cssText from "data-text:~/style.css"
import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// injects Tailwind into the shadow DOM
export const getStyle = () => {
  const style = document.createElement("style")
  style.textContent = cssText
  return style
}

export default function Widget() {
  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer">
        <span className="text-white text-xl">💬</span>
      </div>
    </div>
  )
}