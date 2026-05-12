import { useAuthStore } from "~src/lib/hooks/useAuthStore"

export const useIsAuthenticated = (): boolean => {
  const authToken = useAuthStore((s) => s.authToken)
  return Boolean(authToken)
}