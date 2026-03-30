"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowRight, ArrowLeft, Send, Mail } from 'lucide-react'
import { updateProfile } from '../../lib/api'
import { useRequireAuth } from '../../lib/hooks/useAuth'
import clsx from 'clsx'

const ALLERGIES = [
  'Penicillin', 'Aspirin', 'Sulfa drugs', 'Latex', 
  'Nuts', 'Shellfish', 'Pollen', 'NSAIDs'
]

const CONDITIONS = [
  'Diabetes', 'Hypertension', 'Asthma', 'Eczema', 
  'Psoriasis', 'Heart disease', 'Thyroid disorder', 'COPD'
]

export default function OnboardingPage() {
  const router = useRouter()
  // Block rendering until token verified via localStorage
  const { token, loginMethod } = useRequireAuth() 
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    full_name: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    allergies: [] as string[],
    chronic_conditions: [] as string[]
  })

  // Prevent early render flashes
  if (!token) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
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

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')
      const payload = {
        ...formData,
        age: parseInt(formData.age) || null,
        height_cm: parseFloat(formData.height_cm) || null,
        weight_kg: parseFloat(formData.weight_kg) || null,
      }
      await updateProfile(payload)
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to save profile. Please check connection.')
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 1 && (!formData.full_name || !formData.age)) {
      setError('Name and Age are required.')
      return
    }
    setError('')
    if (step < 3) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const renderBanner = () => {
    if (loginMethod === 'telegram') {
      return (
        <div className="bg-sky-50 border border-sky-100 text-sky-800 rounded-lg p-3 text-sm flex items-center justify-center gap-2 mb-8 animate-in fade-in">
          <Send className="w-4 h-4 ml-0.5" /> Logged in via Telegram &mdash; notifications sent via bot
        </div>
      )
    }
    if (loginMethod === 'google') {
      return (
        <div className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-3 text-sm flex items-center justify-center gap-2 mb-8 animate-in fade-in">
          <Mail className="w-4 h-4" /> Logged in via Google &mdash; notifications sent via email
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl flex flex-col items-center">
        
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Complete your profile
        </h2>
        <p className="text-center text-gray-500 mb-6">
          This helps AI personalize your health guidance.
        </p>

        <div className="w-full">
          {renderBanner()}
        </div>

        <div className="flex gap-2 mb-8 w-full">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className={clsx(
                "h-2 rounded-full flex-1 transition-all",
                step >= i ? "bg-sky-500" : "bg-gray-200"
              )} 
            />
          ))}
        </div>

        <div className="card shadow-md border-0 bg-white p-8 w-full">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-500 to-sky-700">
                1. Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className="input" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                  <input type="number" name="age" value={formData.age} onChange={handleInputChange} className="input" placeholder="30" />
                </div>
                <div className="hidden sm:block"></div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                  <input type="number" name="height_cm" value={formData.height_cm} onChange={handleInputChange} className="input" placeholder="170" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                  <input type="number" name="weight_kg" value={formData.weight_kg} onChange={handleInputChange} className="input" placeholder="65" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">
                2. Known Allergies
              </h3>
              <p className="text-sm text-gray-500">Select any that apply to you. Crucial for Medisafe API validation.</p>
              
              <div className="flex flex-wrap gap-2">
                {ALLERGIES.map(allergy => {
                  const isSelected = formData.allergies.includes(allergy)
                  return (
                    <button
                      key={allergy}
                      onClick={() => toggleArrayItem('allergies', allergy)}
                      className={clsx(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        isSelected 
                          ? "bg-red-100 border-red-200 text-red-800 hover:bg-red-200" 
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      )}
                    >
                      {allergy}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-700">
                3. Chronic Conditions
              </h3>
              <p className="text-sm text-gray-500">Select any pre-existing health conditions.</p>
              
              <div className="flex flex-wrap gap-2">
                {CONDITIONS.map(condition => {
                  const isSelected = formData.chronic_conditions.includes(condition)
                  return (
                    <button
                      key={condition}
                      onClick={() => toggleArrayItem('chronic_conditions', condition)}
                      className={clsx(
                        "px-4 py-2 rounded-full text-sm font-medium transition-colors border",
                        isSelected 
                          ? "bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200" 
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                      )}
                    >
                      {condition}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={handleBack}
              disabled={step === 1 || loading}
              className={clsx(
                "btn-secondary px-4 py-2",
                (step === 1 || loading) && "opacity-0 pointer-events-none"
              )}
            >
              <ArrowLeft className="w-4 h-4 mr-2 inline" /> Back
            </button>

            {step < 3 ? (
              <button onClick={handleNext} className="btn-primary px-6 py-2">
                Next <ArrowRight className="w-4 h-4 ml-2 inline" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="btn-primary px-6 py-2 bg-green-500 hover:bg-green-600 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Saving...' : 'Go to Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
