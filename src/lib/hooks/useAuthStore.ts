import { create } from "zustand"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export type UserRole = "CLIENT" | "THERAPIST"

export interface UserInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isTherapistProfileFilled?: boolean
  mobileNumber?: string
}

interface AuthState {
  user: UserInfo | null
  authToken: string | null
  isAuthenticated: boolean
  isHydrated: boolean

  setUser: (user: UserInfo | null) => void
  setAuthToken: (token: string | null) => void
  logout: () => void
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  authToken: null,
  isAuthenticated: false,
  isHydrated: false,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user })
    if (user) {
      storage.set("cc_user", JSON.stringify(user))
    } else {
      storage.remove("cc_user")
    }
  },

  setAuthToken: (token) => {
    set({ authToken: token })
    if (token) {
      storage.set("cc_token", token)
    } else {
      storage.remove("cc_token")
    }
  },

  logout: () => {
    set({ user: null, authToken: null, isAuthenticated: false })
    storage.remove("cc_user")
    storage.remove("cc_token")
  },

  hydrate: async () => {
    try {
      
      const token = await storage.get("cc_token")
      const userRaw = await storage.get("cc_user")
      if (token && userRaw) {
        const user = JSON.parse(userRaw as string) as UserInfo
        set({ user, authToken: token as string, isAuthenticated: true })
      }
    } catch {}
    set({ isHydrated: true })

    // Watch for cross-context storage changes (e.g. popup logout → widget updates)
    storage.watch({
      cc_token: (change) => {
        const newToken = change.newValue as string | undefined
        if (!newToken) {
          // Token was removed (logout from another context)
          set({ user: null, authToken: null, isAuthenticated: false })
        } else {
          set({ authToken: newToken })
        }
      },
      cc_user: (change) => {
        const newUserRaw = change.newValue as string | undefined
        if (!newUserRaw) {
          // User was removed (logout from another context)
          set({ user: null, authToken: null, isAuthenticated: false })
        } else {
          try {
            const user = JSON.parse(newUserRaw) as UserInfo
            set({ user, isAuthenticated: true })
          } catch {}
        }
      },
    })
  }
}))