import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "~style.css"

import AuthForm from "../components/auth/AuthForm"

const queryClient = new QueryClient()

function AuthApp() {
  const handleAuthSuccess = () => {
    chrome.storage.local.set({ cc_auth_success: Date.now() }, () => {
      window.close()
    })
  }

  return (
    <div style={{ width: 420, minHeight: 600, display: "flex", flexDirection: "column", background: "#fff" }}>
      <AuthForm onSuccess={handleAuthSuccess} />
    </div>
  )
}

export default function Auth() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthApp />
    </QueryClientProvider>
  )
}