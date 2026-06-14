import { useState, useEffect } from "react"
import { Storage } from "@plasmohq/storage"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GoogleOAuthProvider } from "@react-oauth/google"

import "~style.css"

import type { Screen } from "./lib/types"
import { QUOTES } from "./lib/constants/contant"

import { useAuthStore } from "./lib/hooks/useAuthStore"
import AuthForm from "./components/auth/AuthForm"

import { MenuScreen } from "./components/MenuScreen"
import { PomodoroScreen } from "./components/features/Pomodoro"
import { ChatScreen } from "./components/features/Ai/ChatScreen"
import { QuoteScreen } from "./components/features/Quote"
import { BreatheScreen } from "./components/features/Meditation"
import { SoundsScreen } from "./components/features/Sound"

const storage = new Storage({ area: "session" })

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000
    },
    mutations: {
      retry: 0
    }
  }
})

function App() {
  const { isAuthenticated, isHydrated, hydrate, logout } = useAuthStore()

  const [screen, setScreen] = useState<Screen>("menu")
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    hydrate()
  }, [])

  useEffect(() => {
    const init = async () => {
      const requested = await storage.get<string>("cc_initial_screen")

      if (requested) {
        await storage.remove("cc_initial_screen")

        // "auth" is handled automatically — popup shows AuthForm when !isAuthenticated
        if (requested !== "menu" && requested !== "auth") {
          if (requested === "quote") {
            setQuoteIdx(Math.floor(Math.random() * QUOTES.length))
          }

          setScreen(requested as Screen)
        }
      }

      setTimeout(() => setVisible(true), 60)
    }

    init()
  }, [])

  const go = (s: Screen) => setScreen(s)

  const openQuote = () => {
    setQuoteIdx(Math.floor(Math.random() * QUOTES.length))
    go("quote")
  }

  const handleNode = (id: string, url?: string) => {
    if (id === "therapist" && url) {
      if (
        typeof globalThis.chrome !== "undefined" &&
        globalThis.chrome.tabs
      ) {
        globalThis.chrome.tabs.create({ url })
      } else {
        window.open(url, "_blank")
      }

      return
    }

    go(id as Screen)
  }

  if (!isHydrated) {
    return (
     <div className="w-[380px] h-[600px] flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0c3e6f] to-[#16B7C2] flex items-center justify-center animate-pulse">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthForm />
  }

  return (
    <div
      className={`font-sans rounded-[32px] overflow-hidden shadow-[0_20px_60px_rgba(12,62,111,0.25)] ${
        visible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-500`}
      style={{
        width: 380,
        height: 600,
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(240,247,255,0.96) 100%)"
      }}>
      
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes popIn {
          from {
            opacity: 0;
            transform: translate(-50%,-50%) scale(0.4);
          }

          to {
            opacity: 1;
            transform: translate(-50%,-50%) scale(1);
          }
        }

        @keyframes floatY {
          0%,100% {
            transform: translate(-50%,-50%) translateY(0);
          }

          50% {
            transform: translate(-50%,-50%) translateY(-5px);
          }
        }

        @keyframes breatheRing {
          0%,100% {
            transform: translate(-50%,-50%) scale(1);
            opacity: .18;
          }

          50% {
            transform: translate(-50%,-50%) scale(1.13);
            opacity: .35;
          }
        }

        @keyframes typing {
          0%,80%,100% {
            opacity: .2;
            transform: scale(.75);
          }

          40% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(8px);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes orbPulse {
          0%,100% {
            box-shadow: 0 0 0 0 rgba(12,62,111,.15);
          }

          50% {
            box-shadow: 0 0 0 14px rgba(12,62,111,0);
          }
        }

        .au1 { animation: fadeUp .48s .05s ease both; }
        .au2 { animation: fadeUp .48s .12s ease both; }
        .au3 { animation: fadeUp .48s .19s ease both; }
        .au4 { animation: fadeUp .48s .26s ease both; }
        .au5 { animation: fadeUp .48s .33s ease both; }

        .slide-in {
          animation: slideIn .28s ease both;
        }

        .dot1 { animation: typing 1.3s 0s infinite; }
        .dot2 { animation: typing 1.3s .22s infinite; }
        .dot3 { animation: typing 1.3s .44s infinite; }

        ::-webkit-scrollbar {
          width: 3px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: #93C5FD;
          border-radius: 2px;
        }
      `}</style>

      {/* Background blobs */}
      <div className="absolute -top-24 -left-16 w-64 h-64 rounded-full bg-blue-200/40 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full bg-sky-100/40 blur-3xl" />

      {[
        {
          s: "menu" as Screen,
          node: (
           <MenuScreen
  onLogout={logout}
  onNode={handleNode}
  openQuote={openQuote}
/>
          )
        },

        {
          s: "pomodoro" as Screen,
          node: (
            <PomodoroScreen
              onBack={() => go("menu")}
            />
          )
        },

        {
          s: "chat" as Screen,
          node: (
            <ChatScreen
              onBack={() => go("menu")}
            />
          )
        },

        {
          s: "quote" as Screen,
          node: (
             <QuoteScreen onBack={() => go("menu")} />
          )
        },

        {
          s: "breathe" as Screen,
          node: (
            <BreatheScreen
              onBack={() => go("menu")}
            />
          )
        },{
          s: "sound" as Screen,
          node:(
            <SoundsScreen onBack={()=>go("menu")}/>
          )
        }
      ].map(({ s, node }) => (
        <div
          key={s}
          className="absolute inset-0 flex flex-col transition-all duration-300 ease-out"
          style={{
            opacity: screen === s ? 1 : 0,
            pointerEvents: screen === s ? "auto" : "none",
            transform:
              screen === s
                ? "scale(1)"
                : "scale(.98)"
          }}>
          {node}
        </div>
      ))}
    </div>
  )
}

export default function Popup() {
  return (
    <GoogleOAuthProvider
      clientId={process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID!}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </GoogleOAuthProvider>
  )
}