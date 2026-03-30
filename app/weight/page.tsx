"use client"

import { useState, useEffect } from 'react'
import { Scale, Loader2, TrendingDown, TrendingUp, Minus, BrainCircuit, Activity, HeartPulse } from 'lucide-react'
import NotificationBanner from '../../components/NotificationBanner'
import { logWeight, getWeightHistory, getFatLossAdvice } from '../../lib/api'
import { useRequireAuth } from '../../lib/hooks/useAuth'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts'

export default function WeightPage() {
  const { token, loginMethod } = useRequireAuth()
  const [weightInput, setWeightInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingAdvice, setGeneratingAdvice] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState<any[]>([])
  const [adviceData, setAdviceData] = useState<any>(null)
  
  const currentWeight = history.length > 0 ? history[0].weight_kg : null
  const previousWeight = history.length > 1 ? history[1].weight_kg : currentWeight

  const loadHistory = async () => {
    try {
      const data = await getWeightHistory()
      setHistory(data || [])
    } catch (err) {
      console.error(err)
    }
  }

  const loadAdvice = async () => {
    try {
      setGeneratingAdvice(true)
      const data = await getFatLossAdvice()
      setAdviceData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setGeneratingAdvice(false)
    }
  }

  useEffect(() => {
    if (token) {
       loadHistory()
       loadAdvice()
    }
  }, [token])

  if (!token) return null

  const handleLog = async () => {
    if (!weightInput) {
      setError('Please enter a weight')
      return
    }
    const weightVal = parseFloat(weightInput)
    if (isNaN(weightVal) || weightVal <= 0) {
      setError('Invalid weight format')
      return
    }

    try {
      setLoading(true)
      setError('')
      await logWeight(weightVal)
      await loadHistory()
      loadAdvice()
      setWeightInput('')
    } catch (err: any) {
      setError(err.message || 'Failed to log weight')
    } finally {
      setLoading(false)
    }
  }

  const renderTrend = () => {
    if (!currentWeight || !previousWeight) return <Minus className="w-6 h-6 text-gray-400" />
    if (currentWeight < previousWeight) {
      return <TrendingDown className="w-6 h-6 text-green-500" />
    } else if (currentWeight > previousWeight) {
      return <TrendingUp className="w-6 h-6 text-red-500" />
    }
    return <Minus className="w-6 h-6 text-gray-400" />
  }

  const chartData = [...history]
    .reverse()
    .slice(-14)
    .map(h => ({
      date: new Date(h.logged_at || h.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weight: h.weight_kg
  }))

  const minWeight = chartData.length > 0 ? Math.max(0, Math.floor(Math.min(...chartData.map(d => d.weight)) - 2)) : 0

  return (
    <div className="animate-in fade-in space-y-6">
      
      <NotificationBanner channel={loginMethod as any} />
      
      <div className="flex items-center gap-3 mb-8 border-b pb-4 border-gray-100">
        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm border border-amber-200">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Weight & Trends</h1>
          <p className="text-sm text-gray-500">Track your daily progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column */}
        <div className="space-y-6">
          <div className="card shadow-md border border-gray-100 space-y-8 relative overflow-hidden bg-white">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="relative z-10">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Today's Weight Entry (kg)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
                placeholder="0.0"
                onFocus={(e) => e.target.classList.add('ring-2', 'ring-amber-500')}
                onBlur={(e) => e.target.classList.remove('ring-2', 'ring-amber-500')}
                className="input text-3xl font-black py-5 bg-gray-50 focus:bg-white text-gray-900 placeholder:text-gray-300 transition-all border-gray-200"
              />
            </div>

            <button
              onClick={handleLog}
              disabled={loading || !weightInput}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-4 py-4 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative z-10 shadow-md transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Scale className="w-5 h-5" />}
              {loading ? 'Saving securely...' : 'Log Daily Weight'}
            </button>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 relative z-10">
                {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="card shadow-sm border border-gray-100 bg-gradient-to-br from-white to-gray-50 flex items-center justify-between p-6">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Current</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">
                    {currentWeight ? `${currentWeight} kg` : '--'}
                  </p>
               </div>
               <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                 {renderTrend()}
               </div>
             </div>
             
             <div className="card shadow-sm border border-gray-100 flex items-center justify-between p-6 bg-white">
               <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-widest">Logs</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tight">{history.length}</p>
               </div>
               <div className="w-12 h-12 rounded-full bg-gray-50 shadow-inner flex items-center justify-center text-gray-400">
                 <Activity className="w-5 h-5" />
               </div>
             </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="card shadow-sm border border-gray-100 p-6 overflow-hidden bg-white">
            <h3 className="font-bold text-gray-900 text-sm mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Progress Tracker
            </h3>
            
            {chartData.length > 0 ? (
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis 
                         dataKey="date" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fill: '#6B7280' }} 
                         dy={10} 
                      />
                      <YAxis 
                         domain={[minWeight, 'auto']} 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fill: '#6B7280' }} 
                      />
                      <Tooltip 
                         cursor={{ fill: '#FEF3C7', opacity: 0.4 }}
                         contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                         itemStyle={{ color: '#92400E', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="weight" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#F59E0B' : '#FCD34D'} />
                        ))}
                      </Bar>
                    </BarChart>
                 </ResponsiveContainer>
               </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm font-medium text-gray-400">
                Log your weight to start tracking!
              </div>
            )}
          </div>

          <div className="card shadow-md border-amber-100 bg-amber-50/50 p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
               <div className="absolute right-0 top-0 opacity-[0.03]">
                 <HeartPulse className="w-40 h-40 -mr-8 -mt-8 text-amber-900" />
               </div>
               
               <div className="flex justify-between items-start mb-6 border-b border-amber-100/50 pb-4">
                 <h3 className="font-bold text-lg text-amber-900 flex items-center gap-2">
                   <BrainCircuit className="w-5 h-5 text-amber-600" />
                   AI Fat Loss Insights
                 </h3>
               </div>

               {generatingAdvice ? (
                  <div className="flex flex-col items-center justify-center py-6 text-amber-700/60">
                     <Loader2 className="w-6 h-6 animate-spin mb-2" />
                     <p className="text-sm font-semibold">Analyzing your trends...</p>
                  </div>
               ) : adviceData ? (
                  <div className="relative z-10 space-y-4">
                     {adviceData.trend_summary && (
                       <p className="text-sm text-amber-800 font-medium bg-amber-100/50 p-3 rounded-lg border border-amber-200/50">
                         {adviceData.trend_summary}
                       </p>
                     )}
                     
                     <div className="bg-white/80 rounded-xl p-4 border border-amber-200/40 shadow-sm backdrop-blur-sm -mx-2">
                       <ul className="space-y-3">
                         {adviceData.advice_points?.map((point: string, i: number) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-800 items-start">
                               <div className="min-w-[4px] min-h-[4px] mt-2 rounded-full bg-amber-500"></div>
                               <span className="leading-snug">{point}</span>
                            </li>
                         ))}
                       </ul>
                     </div>
                     
                     {adviceData.encouragement && (
                       <p className="text-[11px] font-bold text-amber-600/80 uppercase tracking-widest text-center pt-2">
                         {adviceData.encouragement}
                       </p>
                     )}
                  </div>
               ) : (
                  <div className="text-sm text-amber-700/60 text-center py-4">
                     Complete your profile and log your weight to get personalized AI insights.
                  </div>
               )}
          </div>

        </div>
      </div>
    </div>
  )
}
