"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [loginMethod, setLoginMethod] = useState<"telegram" | "google" | "both" | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = localStorage.getItem("derma_token")
    const method = localStorage.getItem("derma_login_method") as any
    
    setToken(t || null)
    setLoginMethod(method || null)
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem("derma_token")
    localStorage.removeItem("derma_login_method")
    document.cookie = "derma_auth=; path=/; max-age=0"
    router.push("/")
  }

  return { token, loginMethod, loading, logout }
}

export function useRequireAuth() {
  const router = useRouter()
  const { token, loginMethod, loading } = useAuth()

  useEffect(() => {
    if (!loading && !token) {
      router.push("/")
    }
  }, [loading, token, router])

  return { token, loginMethod }
}
