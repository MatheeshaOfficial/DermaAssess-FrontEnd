"use client"
import { useState } from 'react'
import { Stethoscope, Camera, Loader2, CheckCircle, AlertTriangle, XCircle, SearchIcon } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'
import Badge from '../../components/Badge'
import SeverityBar from '../../components/SeverityBar'
import EmptyState from '../../components/EmptyState'
import NotificationBanner from '../../components/NotificationBanner'
import { assessSkin } from '../../lib/api'
import { useRequireAuth } from '../../lib/hooks/useAuth'

export default function DermaPage() {
  const { token, loginMethod } = useRequireAuth()
  const [file, setFile] = useState<File | null>(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  if (!token) return null

  const handleAssess = async () => {
    if (!file) return
    try {
      setLoading(true)
      setError('')
      setResult(null)
      const data = await assessSkin(file, symptoms)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to analyze image.')
    } finally {
      setLoading(false)
    }
  }

  const renderActionBanner = (action: string) => {
    switch(action.toLowerCase()) {
      case 'self-care':
        return (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex gap-3 mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 block">Self Care</h4>
              <p className="text-sm">Condition appears low risk. See AI advice below.</p>
            </div>
          </div>
        )
      case 'emergency':
        return (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3 mb-6">
            <XCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 block">Seek Emergency Care</h4>
              <p className="text-sm">Signs point to a severe condition. Please visit an emergency room.</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 block">Consult Provider</h4>
              <p className="text-sm">We recommend showing this to a medical professional soon.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="animate-in fade-in space-y-6">
      
      <NotificationBanner channel={loginMethod as any} />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 shadow-sm">
          <Stethoscope className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">DermaAssess</h1>
          <p className="text-sm text-gray-500">AI triage for skin conditions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card shadow-md border border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Photo</label>
              <ImageUpload 
                onImageSelected={setFile} 
                disabled={loading}
                accentColor="sky"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Symptoms describing the issue</label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                disabled={loading}
                className="input min-h-[100px] resize-none"
                placeholder="e.g. It's very itchy and spreading. Started 2 days ago..."
              />
            </div>

            <button
              onClick={handleAssess}
              disabled={loading || !file}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white rounded-lg px-4 py-3 font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              {loading ? 'Analyzing...' : 'Assess Skin'}
            </button>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="h-full">
          {loading ? (
            <div className="card shadow-md border-0 h-full min-h-[400px] flex flex-col items-center justify-center animate-pulse bg-gray-50">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-center px-8">
                Analyzing photo and running through clinical datasets...<br/>
                <span className="text-sm">This may take a few seconds.</span>
              </p>
            </div>
          ) : result ? (
            <div className="card shadow-md border-0 space-y-6 h-full animate-in fade-in slide-in-from-bottom-4">
              {renderActionBanner(result.recommended_action || 'clinic')}
              
              <SeverityBar score={result.severity_score || 0} />
              
              <div className="flex gap-4 border-b border-gray-100 pb-6">
                <div className="flex-1">
                  <span className="block text-xs text-gray-500 uppercase font-semibold mb-1">Contagion Risk</span>
                  <Badge level={(result.contagion_risk || 'low').toLowerCase() as any} showIcon>
                    {result.contagion_risk}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Possible Conditions</h4>
                <div className="flex flex-wrap gap-2">
                  {result.possible_conditions?.map((c: string, i: number) => (
                    <span key={i} className="bg-sky-50 text-sky-700 rounded-full px-3 py-1 text-sm font-medium border border-sky-100">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">AI Advice</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100 leading-relaxed shadow-inner">
                  {result.ai_advice || "No specific advice generated."}
                </p>
              </div>

              {(result.warning_signs && result.warning_signs.length > 0) && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                  <h4 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Watch out for
                  </h4>
                  <ul className="list-disc pl-5 text-sm text-amber-800 space-y-1">
                    {result.warning_signs.map((sign: string, i: number) => (
                      <li key={i}>{sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-[10px] text-gray-400 mt-4 leading-tight italic border-t border-gray-50 pt-3">
                 {result.disclaimer || "Disclaimer: The analysis is generated by AI and may be inaccurate. Always consult a healthcare professional for diagnosis and treatment."}
              </p>
            </div>
          ) : (
            <div className="h-full">
              <EmptyState 
                icon={SearchIcon}
                title="No assessment yet" 
                description="Upload an image and describe your symptoms to receive an AI generated assessment."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
