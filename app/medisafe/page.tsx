"use client"
import { useState } from 'react'
import { Pill, Scan, Loader2, CheckCircle, AlertTriangle, XCircle, SearchIcon, ChevronDown, ChevronUp } from 'lucide-react'
import ImageUpload from '../../components/ImageUpload'
import EmptyState from '../../components/EmptyState'
import NotificationBanner from '../../components/NotificationBanner'
import { scanPrescription } from '../../lib/api'
import { useRequireAuth } from '../../lib/hooks/useAuth'

export default function MediSafePage() {
  const { token, loginMethod } = useRequireAuth()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [showRawText, setShowRawText] = useState(false)

  if (!token) return null

  const handleScan = async () => {
    if (!file) return
    try {
      setLoading(true)
      setError('')
      setResult(null)
      const data = await scanPrescription(file)
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Failed to scan prescription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const renderSafetyBanner = (safety: string) => {
    switch(safety.toLowerCase()) {
      case 'safe':
        return (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 flex gap-3 mb-6">
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 block">No Conflicts Detected</h4>
              <p className="text-sm">These medications appear safe given your known allergies and conditions.</p>
            </div>
          </div>
        )
      case 'dangerous':
      case 'danger':
        return (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex gap-3 mb-6">
            <XCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 block">Severe Conflict Detected</h4>
              <p className="text-sm">Do not take this medication without consulting your doctor.</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 flex gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900 block">Caution</h4>
              <p className="text-sm">Review the alerts below carefully before taking this medication.</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="animate-in fade-in space-y-6">
      
      <NotificationBanner channel={loginMethod as any} />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 shadow-sm">
          <Pill className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">MediSafe</h1>
          <p className="text-sm text-gray-500">Scan prescriptions for safety checks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="card shadow-md border-gray-100 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Upload Prescription or Box</label>
              <ImageUpload 
                onImageSelected={setFile} 
                disabled={loading}
                accentColor="teal"
              />
            </div>
            
            <button
              onClick={handleScan}
              disabled={loading || !file}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-4 py-3 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scan className="w-5 h-5" />}
              {loading ? 'Scanning...' : 'Scan & Check Safety'}
            </button>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            )}
          </div>

          {result && ((result.allergy_alerts && result.allergy_alerts.length > 0) || 
            (result.interactions && result.interactions.length > 0)) && (
            <div className="card shadow-md border-gray-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-gray-900 border-b pb-2 border-gray-100">Safety Alerts</h3>
              
              {result.allergy_alerts?.map((alert: string, i: number) => (
                <div key={`allergy-${i}`} className="bg-red-50 border border-red-200 p-3 rounded-lg text-sm text-red-800 flex gap-2 items-start shadow-sm">
                   <XCircle className="w-5 h-5 mt-0 flex-shrink-0 text-red-600" />
                   <p className="mt-0.5 flex-1">{alert}</p>
                </div>
              ))}

              {result.interactions?.map((alert: string, i: number) => (
                <div key={`interaction-${i}`} className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-sm text-amber-800 flex gap-2 items-start shadow-sm">
                   <AlertTriangle className="w-5 h-5 mt-0 flex-shrink-0 text-amber-600" />
                   <p className="mt-0.5 flex-1">{alert}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="h-full">
          {loading ? (
            <div className="card shadow-md border-0 h-full min-h-[400px] flex flex-col items-center justify-center animate-pulse bg-gray-50">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-gray-500 font-medium text-center px-8">
                Extracting text and analyzing medical associations...<br/>
                <span className="text-sm">Cross-referencing your profile.</span>
              </p>
            </div>
          ) : result ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {renderSafetyBanner(result.overall_safety || 'info')}
              
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2 border-gray-100">Extracted Medicines</h3>
                {result.medicines_found && result.medicines_found.length > 0 ? (
                  result.medicines_found.map((med: any, i: number) => (
                    <div key={i} className="card p-4 flex flex-col gap-2 border border-teal-100 shadow-sm">
                      <div className="font-bold text-lg text-teal-700">{med.name}</div>
                      <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
                        <div><span className="text-gray-400">Dosage:</span> {med.dosage || 'N/A'}</div>
                        <div><span className="text-gray-400">Frequency:</span> {med.frequency || 'N/A'}</div>
                        <div><span className="text-gray-400">Duration:</span> {med.duration || 'N/A'}</div>
                        <div><span className="text-gray-400">Route:</span> {med.route || 'N/A'}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 p-4 border border-gray-200 rounded-lg">
                    No medicines detected clearly.
                  </div>
                )}
              </div>


              
              {result.side_effects && result.side_effects.length > 0 && (
                <div className="pt-4 border-t border-gray-100 mt-4">
                  <h3 className="font-bold text-gray-900 mb-3 border-b pb-2 border-gray-100">Noticeable Side Effects</h3>
                   <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                      {result.side_effects.slice(0, 3).map((effect: string, i: number) => (
                        <li key={i}>{effect}</li>
                      ))}
                    </ul>
                </div>
              )}

              {result.raw_text && (
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <button 
                    onClick={() => setShowRawText(!showRawText)}
                    className="flex w-full items-center justify-between text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors border border-gray-200"
                  >
                    Raw OCR Text Diagnostics
                    {showRawText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  {showRawText && (
                    <div className="mt-2 text-xs text-gray-500 font-mono bg-gray-50 p-4 rounded-lg whitespace-pre-wrap max-h-40 overflow-y-auto border border-gray-200 shadow-inner">
                      {result.raw_text}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full">
              <EmptyState 
                icon={SearchIcon}
                title="Scan to verify" 
                description="Upload an image of a prescription or medication packaging to extract details and verify safety against your health profile."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
