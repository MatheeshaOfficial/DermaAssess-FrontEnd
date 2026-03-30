"use client"
import { useState, useEffect } from 'react'
import { Save, Loader2, User, CheckCircle2, XCircle } from 'lucide-react'
import { useProfile } from '../../lib/hooks/useProfile'
import { useRequireAuth } from '../../lib/hooks/useAuth'
import { linkGoogle, telegramStart, telegramStatus } from '../../lib/api'
import clsx from 'clsx'

const ALLERGIES = [
  'Penicillin', 'Aspirin', 'Sulfa drugs', 'Latex', 
  'Nuts', 'Shellfish', 'Pollen', 'NSAIDs'
]

const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Asthma', 'Eczema', 
  'Psoriasis', 'Heart disease', 'Thyroid disorder', 'COPD'
]

export default function ProfilePage() {
  const { token, loginMethod } = useRequireAuth()
  const { profile, loading: loadingProfile, update: updateProfileSync } = useProfile()
  
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [linkingAction, setLinkingAction] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    allergies: [] as string[],
    chronic_conditions: [] as string[],
    email: '',
    notification_channel: 'telegram' as 'telegram' | 'email' | 'both'
  })

  // Load GIS script dynamically on mound if email is missing
  useEffect(() => {
    if (!loadingProfile && profile && !profile.email && !document.getElementById('google-jssdk')) {
      const loadGis = () => {
        const script = document.createElement('script')
        script.id = 'google-jssdk'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => {
          (window as any).google.accounts.id.initialize({
             client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
             callback: async (response: any) => {
                setLinkingAction('google')
                try {
                  await linkGoogle(response.credential)
                  localStorage.setItem("derma_login_method", "both")
                  alert("Google connected successfully! Page will refresh.")
                  window.location.reload()
                } catch (e: any) {
                  alert("Failed to link Google Account.")
                  console.error(e)
                } finally {
                  setLinkingAction(null)
                }
             }
          });
          const btnGContainer = document.getElementById("profile-google-login")
          if (btnGContainer) {
            (window as any).google.accounts.id.renderButton(
              btnGContainer,
              { theme: "outline", size: "large", width: "100%", text: "continue_with", shape: "rectangular" }
            )
          }
        }
        document.head.appendChild(script)
      }
      loadGis()
    }
  }, [profile, loadingProfile])

  const handleTelegramLink = async () => {
    setLinkingAction('telegram')
    try {
      const { session_token, bot_link } = await telegramStart()
      
      let finalLink = bot_link
      if (finalLink.includes('BOT_USERNAME') && process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME) {
        finalLink = finalLink.replace('BOT_USERNAME', process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME)
      }
      
      window.open(finalLink, '_blank')
      
      const startTime = Date.now()
      const pollInterval = setInterval(async () => {
        try {
          if (Date.now() - startTime > 180000) {
            clearInterval(pollInterval)
            setLinkingAction(null)
            alert("Linking timed out. Please try again.")
            return
          }
          
          const statusRes = await telegramStatus(session_token)
          if (statusRes.status === "completed") {
            clearInterval(pollInterval)
            localStorage.setItem("derma_login_method", "both")
            alert("Telegram connected! Notifications will now be sent via Telegram. Page will refresh.")
            window.location.reload()
          }
        } catch (pollErr) {
          // ignore
        }
      }, 2000)

    } catch (e: any) {
      alert("Failed to start Telegram linking. Please try again.")
      setLinkingAction(null)
    }
  }


  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        age: profile.age?.toString() || '',
        height_cm: profile.height_cm?.toString() || '',
        weight_kg: profile.weight_kg?.toString() || '',
        allergies: profile.allergies || [],
        chronic_conditions: profile.chronic_conditions || [],
        email: profile.email || '',
        notification_channel: profile.notification_channel || 'telegram'
      })
    }
  }, [profile])

  if (!token || loadingProfile) {
    return (
      <div className="flex justify-center items-center h-full min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handlePreferenceChange = async (val: 'telegram'|'email'|'both') => {
    setFormData(prev => ({ ...prev, notification_channel: val }))
    try {
      await updateProfileSync({ notification_channel: val })
    } catch {
      // Revert optimism if fail
    }
  }

  const toggleArrayItem = (field: 'allergies' | 'chronic_conditions', item: string) => {
    setFormData(prev => {
      const array = prev[field]
      if (array.includes(item)) {
        return { ...prev, [field]: array.filter(i => i !== item) }
      } else {
        return { ...prev, [field]: [...array, item] }
      }
    })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        ...formData,
        age: parseInt(formData.age) || null,
        height_cm: parseFloat(formData.height_cm) || null,
        weight_kg: parseFloat(formData.weight_kg) || null,
      }
      await updateProfileSync(payload)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      console.error(err)
      alert(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div id="profile-connect-section" className="animate-in fade-in space-y-6 pb-20">

      <div className="flex items-center justify-between border-b pb-4 border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center text-white shadow-sm border border-gray-800">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Profile</h1>
            <p className="text-sm text-gray-500">Manage your health data for better AI context</p>
          </div>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving || saveSuccess}
          className={clsx(
            "rounded-lg px-4 py-2.5 font-bold transition-all flex items-center gap-2 shadow-sm text-sm",
             saveSuccess 
              ? "bg-green-500 text-white" 
              : "bg-sky-500 hover:bg-sky-600 text-white transform active:scale-[0.98]"
          )}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saveSuccess ? 'Saved!' : 'Save changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          
          <div className="card shadow-sm border-gray-200/60 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-6 pb-3 border-b border-gray-100">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Full Name</label>
                <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="input font-medium" />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="input font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide">Height (cm)</label>
                  <input type="number" name="height_cm" value={formData.height_cm} onChange={handleInputChange} className="input font-medium" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wide flex justify-between">
                     Weight <span className="text-sky-500 font-bold">*</span>
                  </label>
                  <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleInputChange} className="input text-gray-400 bg-gray-50/50 cursor-not-allowed border-gray-100" disabled title="Update weight via Weight AI Tracker" />
                </div>
              </div>
            </div>
          </div>

          <div className="card shadow-md border-gray-200/60 bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Connected Accounts</h3>
            
            <div className="space-y-4 pt-1">
              
              {/* Google Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100 shrink-0">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">Google Account</div>
                    <div className="text-xs text-gray-500 mt-0.5">Primary email address</div>
                  </div>
                </div>
                
                <div>
                  {profile?.email ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                       <CheckCircle2 className="w-4 h-4" /> {profile.email} (Connected)
                    </div>
                  ) : (
                    linkingAction === 'google' ? (
                       <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    ) : (
                       <div className="flex flex-col items-end gap-2">
                         <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                            <XCircle className="w-3.5 h-3.5" /> Not connected
                         </div>
                         <div id="profile-google-login" className="h-10 overflow-hidden w-[200px] flex justify-end"></div>
                       </div>
                    )
                  )}
                </div>
              </div>

              {/* Telegram Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-sky-100 bg-sky-50/30">
                <div className="flex items-center gap-3">
                  <div className="bg-sky-500 p-2 rounded-lg shadow-sm border border-sky-600 shrink-0">
                     <svg className="w-6 h-6 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                       <path d="M22.0498 3.50005C21.9961 3.25752 21.854 3.04481 21.6521 2.89865C21.4503 2.7525 21.2007 2.68202 20.9451 2.6988C20.7303 2.72147 20.5218 2.78277 20.3344 2.87834L2.33436 10.3783C1.94236 10.5377 1.62128 10.8351 1.42851 11.2163C1.23573 11.5976 1.18388 12.0375 1.28256 12.4583C1.35921 12.7915 1.52835 13.0907 1.77259 13.3255C2.01683 13.5603 2.3273 13.7224 2.67311 13.795L7.64436 14.895C7.94052 14.9606 8.24974 14.9478 8.53931 14.858C8.82887 14.7682 9.08801 14.6049 9.28811 14.385L12.7881 10.885L17.2881 15.385C17.5147 15.6116 17.808 15.7677 18.1311 15.8344C18.4552 15.9069 18.7946 15.881 19.1032 15.7613C19.4118 15.6416 19.6749 15.4335 19.8569 15.165L22.8569 10.165C23.0044 9.94042 23.0857 9.68078 23.0934 9.41477C23.1011 9.14875 23.0347 8.8866 22.9015 8.65755L22.0498 3.50005Z" />
                     </svg>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-sm">Telegram Bot</div>
                    <div className="text-xs text-sky-700 mt-0.5">Secure AI Chat Access</div>
                  </div>
                </div>
                
                <div>
                  {profile?.telegram_id ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-sky-700 bg-white px-3 py-1.5 rounded-full border border-sky-200">
                       <CheckCircle2 className="w-4 h-4" /> @{profile.telegram_username} (Connected)
                    </div>
                  ) : (
                    linkingAction === 'telegram' ? (
                       <div className="flex items-center gap-2">
                         <Loader2 className="w-5 h-5 animate-spin text-sky-500" />
                         <span className="text-xs text-sky-700 font-medium">Waiting for bot...</span>
                       </div>
                    ) : (
                      <div className="flex flex-col items-end gap-2 text-right">
                         <div className="flex items-center gap-1 text-[11px] font-bold text-sky-600 uppercase tracking-wide">
                            <XCircle className="w-3.5 h-3.5" /> Not connected
                         </div>
                         <button 
                           onClick={handleTelegramLink}
                           className="bg-sky-500 hover:bg-sky-600 text-white text-[13px] font-bold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
                         >
                           Connect via Bot
                         </button>
                      </div>
                    )
                  )}
                </div>
              </div>

            </div>
          </div>

          {loginMethod === 'both' && (
            <div className="card shadow-sm border-purple-200 bg-purple-50/30">
              <h3 className="text-lg font-bold text-purple-900 mb-2">Notification Preference</h3>
              <p className="text-xs text-purple-700 mb-5 font-medium leading-relaxed">
                You have dual-authorization enabled. Choose where you want health alerts delivered.
              </p>
              
              <div className="flex flex-col gap-3">
                <label className={clsx("flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all", formData.notification_channel === 'telegram' ? 'bg-sky-50 border-sky-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                  <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", formData.notification_channel === 'telegram' ? 'border-sky-500' : 'border-gray-300')}>
                     {formData.notification_channel === 'telegram' && <div className="w-2.5 h-2.5 bg-sky-500 rounded-full"></div>}
                  </div>
                  <span className="text-gray-900 font-bold text-sm">Telegram only (recommended)</span>
                </label>
                
                <label className={clsx("flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all", formData.notification_channel === 'email' ? 'bg-blue-50 border-blue-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                  <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", formData.notification_channel === 'email' ? 'border-blue-500' : 'border-gray-300')}>
                     {formData.notification_channel === 'email' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}
                  </div>
                  <span className="text-gray-900 font-bold text-sm">Email only</span>
                </label>
                
                <label className={clsx("flex items-center gap-3 cursor-pointer p-4 rounded-xl border transition-all", formData.notification_channel === 'both' ? 'bg-purple-50 border-purple-300 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50')}>
                   <div className={clsx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", formData.notification_channel === 'both' ? 'border-purple-500' : 'border-gray-300')}>
                     {formData.notification_channel === 'both' && <div className="w-2.5 h-2.5 bg-purple-500 rounded-full"></div>}
                  </div>
                  <span className="text-gray-900 font-bold text-sm">Both channels</span>
                </label>
              </div>

              {['email', 'both'].includes(formData.notification_channel) && (
                <div className="mt-4 pt-4 border-t border-purple-100">
                  <label className="block text-[11px] font-bold text-purple-600 mb-2 uppercase tracking-wide">Backup Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input text-sm font-medium border-purple-200 focus:ring-purple-500" placeholder="your@email.com" />
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button 
                  onClick={() => handlePreferenceChange(formData.notification_channel)}
                  className="bg-purple-600 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-700 text-sm shadow-sm"
                >
                  Update Preference
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card shadow-sm border-red-200 bg-red-50/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             
             <div className="relative z-10">
              <h3 className="text-lg font-bold text-red-900 mb-1">Known Allergies</h3>
              <p className="text-[11px] font-bold text-red-600/80 uppercase tracking-wide mb-5">Checked during scanning checks</p>
              
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map(allergy => {
                  const isSelected = formData.allergies.includes(allergy)
                  return (
                    <button
                      key={allergy}
                      onClick={() => toggleArrayItem('allergies', allergy)}
                      className={clsx(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm",
                        isSelected 
                          ? "bg-red-500 border-red-600 text-white" 
                          : "bg-white border-red-200 text-red-700 hover:bg-red-100"
                      )}
                    >
                      {allergy}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-amber-200 bg-amber-50/50 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
             
             <div className="relative z-10">
              <h3 className="text-lg font-bold text-amber-900 mb-1">Chronic Conditions</h3>
              <p className="text-[11px] font-bold text-amber-600/80 uppercase tracking-wide mb-5">Vital context for AI Assistant</p>
              
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(condition => {
                  const isSelected = formData.chronic_conditions.includes(condition)
                  return (
                    <button
                      key={condition}
                      onClick={() => toggleArrayItem('chronic_conditions', condition)}
                      className={clsx(
                        "px-3.5 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm",
                        isSelected 
                          ? "bg-amber-500 border-amber-600 text-white" 
                          : "bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                      )}
                    >
                      {condition}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
