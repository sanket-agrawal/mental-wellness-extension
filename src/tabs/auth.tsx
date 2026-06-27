import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import "~style.css"

import AuthForm from "../components/auth/AuthForm"
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
  }}
>
  <AuthFormWidget onSuccess={handleAuthSuccess}  />
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