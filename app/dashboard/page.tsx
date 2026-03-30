"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  AlertTriangle, 
  ArrowRight, 
  Stethoscope, 
  Pill, 
  Bot, 
  Scale, 
  ShieldCheck, 
  Activity, 
  Server,
  Send
} from 'lucide-react'
import { getSkinHistory, getWeightHistory } from '../../lib/api'
import { useRequireAuth } from '../../lib/hooks/useAuth'
import NotificationBanner from '../../components/NotificationBanner'
export default function DashboardPage() {
  const { token, loginMethod } = useRequireAuth()
  const [skinCount, setSkinCount] = useState(0)
  const [currentWeight, setCurrentWeight] = useState<number | null>(null)
  
  useEffect(() => {
    if (!token) return
    getSkinHistory().then(data => {
      setSkinCount(data.length || 0)
    }).catch(console.error)
    getWeightHistory().then(data => {
      if (data && data.length > 0) {
        setCurrentWeight(data[0].weight_kg)
      }
    }).catch(console.error)
  }, [token])
  if (!token) return null
  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Health Hub</h1>
        <p className="text-gray-500 mt-1">Your personal AI health assistant</p>
      </div>
      <NotificationBanner channel={loginMethod as any} />
      {loginMethod === 'google' && (
        <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/30 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-sky-500 ml-0.5" />
            </div>
            <div>
              <h4 className="font-bold text-sky-900">Connect Telegram for faster notifications</h4>
              <p className="text-sm text-sky-700">Link your account to receive instant medical alerts straight to your phone.</p>
            </div>
          </div>
          
          <Link href="/profile" className="btn-primary text-sm px-5 py-2.5 shadow-sm relative z-10 whitespace-nowrap">
            Connect Telegram
          </Link>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card bg-gradient-to-br from-white to-sky-50/30">
          <div className="flex items-center gap-3 mb-2 text-sky-600">
            <Activity className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">Assessments</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{skinCount}</div>
          <p className="text-xs text-gray-500 mt-1">Lifetime skin scans</p>
        </div>
        
        <div className="card bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center gap-3 mb-2 text-amber-600">
            <Scale className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">Weight</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {currentWeight ? `${currentWeight} kg` : '--'}
          </div>
          <p className="text-xs text-gray-500 mt-1">Current logged weight</p>
        </div>
        <div className="card bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center gap-3 mb-2 text-emerald-600">
            <Server className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">AI Engine</span>
          </div>
          <div className="text-xl font-bold text-gray-900 mt-2">Gemini 3.1 Pro</div>
          <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
             <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-pulse"></span>
             Live Mapping
          </p>
        </div>
        <div className="card bg-gradient-to-br from-white to-gray-50">
          <div className="flex items-center gap-3 mb-2 text-gray-600">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-semibold text-sm uppercase tracking-wider">Security</span>
          </div>
          <div className="text-lg font-bold text-gray-900 mt-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 relative">
              <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></div>
            </div>
            Data Encrypted
          </div>
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-4 text-amber-800 shadow-sm mt-4">
        <AlertTriangle className="w-6 h-6 flex-shrink-0 text-amber-500" />
        <div className="text-sm">
          <h4 className="font-bold mb-1">Medical Disclaimer</h4>
          <p>
            DermaAssess provides AI guidance only, not medical diagnoses. Always consult a qualified healthcare professional.
          </p>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 perspective-1000">
          <Link href="/derma" className="group card flex flex-col hover:border-purple-200 shadow-sm hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 fill-mode-both delay-[100ms]">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-sky-50 rounded-2xl flex items-center justify-center mb-5 border border-sky-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774893657/Gemini_Generated_Image_muwal8muwal8muwa__1_-removebg-preview_jcjhef.png" alt="DermaAssess Icon" className="w-12 h-12 object-contain drop-shadow-md group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">DermaAssess</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
              AI triage for skin conditions. Upload a photo of a rash, mole, or skin issue for an instant initial assessment and recommended next steps.
            </p>
            <div className="flex items-center text-sky-600 text-sm font-semibold mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
              Open feature <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
          <Link href="/medisafe" className="group card flex flex-col hover:border-teal-200 shadow-sm hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 fill-mode-both delay-[200ms]">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-purple-50 rounded-2xl flex items-center justify-center mb-5 border border-purple-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774893657/Gemini_Generated_Image_8jfcry8jfcry8jfc-removebg-preview_ktnath.png" alt="MediSafe Icon" className="w-12 h-12 object-contain drop-shadow-md group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">MediSafe</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
              Scan prescriptions or medication boxes to instantly detect conflicts with your known allergies or other conditions.
            </p>
            <div className="flex items-center text-purple-600 text-sm font-semibold mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
              Open feature <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
          <Link href="/chat" className="group card flex flex-col hover:border-emerald-200 shadow-sm hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 fill-mode-both delay-[300ms]">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-emerald-50 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden">
               <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774893951/Gemini_Generated_Image_ajn9jeajn9jeajn9-removebg-preview_plnavj.png" alt="DermaBot Icon" className="w-12 h-12 object-contain drop-shadow-md group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">DermaBot</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
              Ask any health question to our specialized AI assistant. Send text or images for contextual health guidance and education.
            </p>
            <div className="flex items-center text-emerald-600 text-sm font-semibold mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
              Open feature <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
          <Link href="/weight" className="group card flex flex-col hover:border-amber-200 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-500 fill-mode-both delay-[400ms]">
            <div className="w-16 h-16 bg-gradient-to-br from-white to-amber-50 rounded-2xl flex items-center justify-center mb-5 border border-amber-100/50 shadow-inner group-hover:scale-110 transition-transform duration-500 overflow-hidden">
              <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774893657/Gemini_Generated_Image_s3cf4ms3cf4ms3cf-removebg-preview_gocvfc.png" alt="Weight AI Icon" className="w-12 h-12 object-contain drop-shadow-md group-hover:animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 tracking-tight">Weight AI Tracker</h3>
            <p className="text-gray-500 text-sm mb-6 flex-1 leading-relaxed">
              Log your weight and scan meal photos. Get instant AI insights on macro nutrients to stay on top of your dietary goals.
            </p>
            <div className="flex items-center text-amber-600 text-sm font-semibold mt-auto opacity-80 group-hover:opacity-100 transition-opacity">
              Open feature <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
