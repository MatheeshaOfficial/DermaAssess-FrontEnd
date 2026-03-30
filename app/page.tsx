"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { telegramStart, telegramStatus, googleLogin } from '../lib/api'
import { Stethoscope, Pill, Bot, Shield, Loader2, Send } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [error, setError] = useState("")

  const handleTelegramLogin = async () => {
    setLoading(true)
    setError("")
    setLoadingMessage("Starting Telegram login...")
    try {
      const { session_token, bot_link } = await telegramStart()
      
      let finalLink = bot_link;
      if (finalLink.includes('BOT_USERNAME') && process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME) {
        finalLink = finalLink.replace('BOT_USERNAME', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME);
      }
      
      window.open(finalLink, '_blank')
      setLoadingMessage("Waiting for Telegram... Please complete login in the bot.")
      
      const startTime = Date.now()
      const pollInterval = setInterval(async () => {
        try {
          if (Date.now() - startTime > 180000) {
            clearInterval(pollInterval)
            setLoading(false)
            setLoadingMessage("")
            setError("Login timed out. Please try again.")
            return
          }
          
          const statusRes = await telegramStatus(session_token)
          if (statusRes.status === "completed" && statusRes.access_token) {
            clearInterval(pollInterval)
            localStorage.setItem("derma_token", statusRes.access_token)
            localStorage.setItem("derma_login_method", statusRes.login_method || "telegram")
            document.cookie = `derma_auth=1;path=/;max-age=2592000`
            
            if (statusRes.is_new_user || !statusRes.profile_complete) {
              router.push("/onboarding")
            } else {
              router.push("/dashboard")
            }
          }
        } catch (pollErr) {
          // ignore polling errors
        }
      }, 2000)
    } catch (e: any) {
      setError("Failed to start Telegram login. Please try again.")
      setLoading(false)
      setLoadingMessage("")
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("derma_token")
    if (token) {
      router.push("/dashboard")
      return
    }

    // --- GOOGLE GIS LOGIC ---
    const handleGoogle = async (response: any) => {
      setLoading(true)
      setError("")
      try {
        const res = await googleLogin(response.credential)
        localStorage.setItem("derma_token", res.access_token)
        localStorage.setItem("derma_login_method", res.login_method)
        document.cookie = `derma_auth=1;path=/;max-age=2592000`
        
        if (res.is_new_user || !res.profile_complete) {
          router.push("/onboarding")
        } else {
          router.push("/dashboard")
        }
      } catch (e: any) {
        setError("Google authentication failed. Please try again.")
        setLoading(false)
      }
    };
    (window as any).handleGoogleCredential = handleGoogle

    const gScript = document.createElement("script")
    gScript.src = "https://accounts.google.com/gsi/client"
    gScript.async = true
    gScript.onload = () => {
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: (window as any).handleGoogleCredential,
      })
      const gContainer = document.getElementById("google-login-widget")
      if (gContainer) {
        (window as any).google.accounts.id.renderButton(
          gContainer,
          { theme: "outline", size: "large", width: "100%", text: "signin_with", shape: "rectangular" }
        )
      }
    }
    document.head.appendChild(gScript)

    return () => {
      delete (window as any).handleGoogleCredential
    }
  }, [router])

  return (
    <div className="min-h-screen flex text-gray-900 bg-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-sky-600 to-sky-800 p-12 text-white flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        <div className="relative z-10 flex items-center gap-4 mb-12 group">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-[1.05] transition-transform duration-300 overflow-hidden bg-white/10 p-0.5 border border-white/20">
            <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774892465/Gemini_Generated_Image_ukl7otukl7otukl7_dgq6kr.png" alt="DermaAssess Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight drop-shadow-sm">DermaAssess</span>
        </div>
        
        <div className="relative z-10 max-w-lg mb-auto">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            AI-powered health guidance, at your fingertips
          </h1>
          <p className="text-sky-100 text-lg mb-12 leading-relaxed">
            Your personal hub for skin triage, medicine safety checks, 
            health monitoring, and intelligent chat synchronized straight to Telegram.
          </p>
          
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 group hover:-translate-y-1 shadow-lg overflow-hidden relative">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden ring-2 ring-white/30 z-10 relative">
                <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774895743/Gemini_Generated_Image_s6pkgqs6pkgqs6pk_bdy7wj.png" className="w-full h-full object-cover" alt="DermaAssess" />
              </div>
              <h3 className="font-semibold text-white tracking-tight text-lg relative z-10">DermaAssess</h3>
              <p className="text-sm text-sky-200 mt-1 opacity-90 relative z-10">Skin triage</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 group hover:-translate-y-1 shadow-lg overflow-hidden relative">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden ring-2 ring-white/30 z-10 relative">
                <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774895739/Gemini_Generated_Image_2o6p4j2o6p4j2o6p_heuxap.png" className="w-full h-full object-cover" alt="MediSafe" />
              </div>
              <h3 className="font-semibold text-white tracking-tight text-lg relative z-10">MediSafe</h3>
              <p className="text-sm text-sky-200 mt-1 opacity-90 relative z-10">Prescription OCR</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 group hover:-translate-y-1 shadow-lg overflow-hidden relative">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden ring-2 ring-white/30 z-10 relative">
                <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774895740/Gemini_Generated_Image_ggakkpggakkpggak_jctvln.png" className="w-full h-full object-cover" alt="DermaBot" />
              </div>
              <h3 className="font-semibold text-white tracking-tight text-lg relative z-10">DermaBot</h3>
              <p className="text-sm text-sky-200 mt-1 opacity-90 relative z-10">24/7 AI chat</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 group hover:-translate-y-1 shadow-lg overflow-hidden relative">
               <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-500 overflow-hidden ring-2 ring-white/30 z-10 relative">
                <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774895766/Gemini_Generated_Image_iwwn30iwwn30iwwn_wzyklz.png" className="w-full h-full object-cover" alt="Weight AI" />
              </div>
              <h3 className="font-semibold text-white tracking-tight text-lg relative z-10">Weight AI</h3>
              <p className="text-sm text-sky-200 mt-1 opacity-90 relative z-10">Macro insights</p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-sm text-sky-200 mt-12">
          &copy; {new Date().getFullYear()} AI Health Hub. All rights reserved.
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 relative bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl border border-gray-100 animate-in fade-in zoom-in-[0.98] slide-in-from-bottom-4 duration-700 ease-out fill-mode-forwards">
          <div className="text-center mb-8">
            <div className="lg:hidden w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6 overflow-hidden ring-4 ring-white">
              <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774892465/Gemini_Generated_Image_ukl7otukl7otukl7_dgq6kr.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Welcome to DermaAssess</h2>
            <p className="text-gray-500">Choose how to sign in</p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center relative min-h-[100px] animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-forwards">
            {loading ? (
              <div className="flex flex-col items-center gap-3 py-10 animate-in fade-in zoom-in-95 duration-500">
                 <div className="relative">
                   <div className="absolute inset-0 bg-sky-200 rounded-full blur animate-ping opacity-50"></div>
                   <Loader2 className="w-10 h-10 animate-spin text-sky-500 relative z-10" />
                 </div>
                 <span className="text-sm font-medium text-gray-600 block max-w-[250px] text-center mt-2 animate-pulse">
                   {loadingMessage || "Verifying signature..."}
                 </span>
              </div>
            ) : (
              <div className="w-full space-y-6">
                
                {/* Telegram Block */}
                <div className="relative bg-gradient-to-br from-white to-sky-50 p-6 sm:p-7 rounded-2xl border border-sky-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(14,165,233,0.1)] transition-all duration-300 transform hover:-translate-y-1 group">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-max">
                    <span className="bg-gradient-to-r from-sky-400 to-blue-500 text-white text-[11px] uppercase tracking-wider font-bold px-3 py-1 rounded-full shadow-md animate-pulse">
                      Highly Recommended
                    </span>
                  </div>
                  
                  <div className="flex flex-col items-center text-center mt-2">
                    <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300 ease-out">
                      <Send className="w-7 h-7 text-white ml-0.5 group-hover:animate-bounce" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Login with Telegram</h3>
                    <p className="text-sm text-gray-500 mb-6 px-2 leading-relaxed">
                      Instant access. Receive smart health alerts and analysis directly via secure DM.
                    </p>
                    <button 
                      onClick={handleTelegramLogin}
                      className="relative overflow-hidden flex justify-center items-center gap-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-3.5 px-4 rounded-xl font-semibold transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98] group/btn"
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                      <Send className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">Connect via Telegram</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 py-1 opacity-60">
                  <div className="h-px bg-gray-200 flex-1"></div>
                  <span className="text-xs tracking-widest uppercase text-gray-400 font-semibold">alternatively</span>
                  <div className="h-px bg-gray-200 flex-1"></div>
                </div>

                {/* Google Block */}
                <div className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-gray-200 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-white transition-colors">
                      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                    <div className="flex flex-col text-left">
                      <h3 className="font-semibold text-gray-800 text-sm">Google Account</h3>
                      <p className="text-[11px] text-gray-500 leading-tight hidden sm:block">Secondary option</p>
                    </div>
                  </div>
                  
                  <div className="shrink-0 flex items-center justify-end w-[200px] overflow-hidden rounded-md">
                    <div id="google-login-widget" className="w-full flex justify-end transition-opacity duration-300"></div>
                  </div>
                </div>

              </div>
            )}
            
            {error && (
              <p className="mt-6 text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg font-medium border border-red-100 max-w-full text-center">
                {error}
              </p>
            )}
          </div>
          
          <p className="text-center text-xs text-gray-400 mt-8 leading-relaxed px-4">
            You can connect both accounts later in your profile to enable Telegram notifications even if you sign in with Google now.
          </p>
        </div>
      </div>
    </div>
  )
}
