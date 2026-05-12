import axios from "axios"

export const api = axios.create({
  baseURL: process.env.PLASMO_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" }
})

// attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})