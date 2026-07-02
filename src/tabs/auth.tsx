import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "~style.css"

import AuthFormWidget from "~components/auth/AuthFormWidget"

const queryClient = new QueryClient()

function AuthApp() {
  const handleAuthSuccess = () => {
    chrome.storage.local.set({ cc_auth_success: Date.now() }, () => {
      window.close()
    })
  }

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <AuthFormWidget onSuccess={handleAuthSuccess} />
    </div>
  )
}

export default function Auth() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Kill page-level scroll so only the widget's own (hidden) scrollbar applies */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        #__plasmo, #root, #__next {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
      `}</style>
      <AuthApp />
    </QueryClientProvider>
  )
}