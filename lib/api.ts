const API = process.env.NEXT_PUBLIC_API_URL || ''

export type TelegramUser = {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

export type GoogleCredential = {
  credential: string
}

export type LoginResponse = {
  access_token: string
  token_type: "bearer"
  user_id: string
  first_name: string
  email: string | null
  telegram_id: number | null
  login_method: "telegram" | "google" | "both"
  is_new_user: boolean
  profile_complete: boolean
  notification_channel: "telegram" | "email" | "both"
}

export type Profile = {
  id: string
  full_name: string | null
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  allergies: string[]
  chronic_conditions: string[]
  telegram_id: number | null
  telegram_username: string | null
  email: string | null
  notification_channel: "telegram" | "email" | "both"
  login_method: "telegram" | "google" | "both"
}

export type SkinResult = {
  assessment_id: string
  image_url: string
  severity_score: number
  contagion_risk: "low" | "medium" | "high"
  recommended_action: "self-care" | "clinic" | "emergency"
  possible_conditions: string[]
  ai_diagnosis: string
  ai_advice: string
  warning_signs: string[]
  disclaimer: string
}

export type PrescriptionResult = {
  prescription_id: string
  image_url: string
  medicines: Medicine[]
  prescriber: string | null
  raw_text: string
  confidence: string
  safety: SafetyResult
  disclaimer: string
}

export type Medicine = {
  name: string
  dosage: string
  frequency: string
  duration: string
  route: string
}

export type SafetyResult = {
  interactions: string[]
  allergy_alerts: string[]
  condition_warnings: string[]
  side_effects: string[]
  overall_safety: "safe" | "caution" | "dangerous"
  advice: string
}

export type ChatResponse = {
  reply: string
  session_id: string
}

export type WeightLog = {
  id: string
  weight_kg: number
  meal_description: string | null
  calories_estimate: number | null
  ai_advice: string | null
  logged_at: string
}

export type MealAnalysis = {
  food_items: string[]
  estimated_calories: number
  macros: { protein_g: number; carbs_g: number; fat_g: number }
  health_score: number
  advice: string
  alternatives: string[]
}

export type WeightLogResult = {
  log_id: string
  weight_kg: number
  meal_analysis: MealAnalysis | null
}

function getToken(): string {
  if (typeof window === 'undefined') return ''
  const token = localStorage.getItem("derma_token")
  if (!token) {
    window.location.href = "/"
    throw new Error("Not authenticated")
  }
  return token
}

function authHeader(): Record<string, string> {
  return { Authorization: `Bearer ${getToken()}` }
}

export function getLoginMethod(): "telegram" | "google" | "both" | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem("derma_login_method") as any || null
}

// -------------------------------------------------------------
// Auth & Link Routes
// -------------------------------------------------------------

export type TelegramStartResponse = {
  success: boolean
  session_token: string
  bot_link: string
}

export type TelegramStatusResponse = {
  success: boolean
  status: "pending" | "completed"
  access_token?: string
  token_type?: "bearer"
  user_id?: string
  first_name?: string
  email?: string | null
  telegram_id?: number | null
  login_method?: "telegram" | "google" | "both"
  is_new_user?: boolean
  profile_complete?: boolean
  notification_channel?: "telegram" | "email" | "both"
}

export async function telegramStart(): Promise<TelegramStartResponse> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  try {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem("derma_token")
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
  } catch (e) {}

  const response = await fetch(`${API}/api/auth/telegram-start`, {
    method: 'POST',
    headers
  })
  if (!response.ok) throw new Error('Failed to start Telegram login')
  return response.json()
}

export async function telegramStatus(sessionToken: string): Promise<TelegramStatusResponse> {
  const response = await fetch(`${API}/api/auth/telegram-status/${sessionToken}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })
  if (!response.ok) throw new Error('Failed to check Telegram login status')
  return response.json()
}

export async function telegramLogin(user: TelegramUser): Promise<LoginResponse> {
  const response = await fetch(`${API}/api/auth/telegram-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  if (!response.ok) throw new Error('Telegram login sequence failed')
  return response.json()
}

export async function googleLogin(credential: string): Promise<LoginResponse> {
  const response = await fetch(`${API}/api/auth/google-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  })
  if (!response.ok) throw new Error('Google login sequence failed')
  return response.json()
}

export async function linkTelegram(user: TelegramUser): Promise<void> {
  const response = await fetch(`${API}/api/auth/link-telegram`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  if (!response.ok) throw new Error('Failed to link Telegram account')
}

export async function linkGoogle(credential: string): Promise<void> {
  const response = await fetch(`${API}/api/auth/link-google`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential })
  })
  if (!response.ok) throw new Error('Failed to link Google account')
}

export async function getMe(): Promise<Profile> {
  const response = await fetch(`${API}/api/auth/me`, {
    headers: authHeader(),
  })
  if (!response.ok) throw new Error('Failed to fetch me bounds')
  return response.json()
}

// -------------------------------------------------------------
// Profile Routes
// -------------------------------------------------------------

export async function getProfile(): Promise<Profile> {
  const response = await fetch(`${API}/api/profile/me`, {
    headers: authHeader(),
  })
  if (!response.ok) throw new Error('Failed to fetch profile array')
  return response.json()
}

export async function updateProfile(data: Partial<Profile>): Promise<Profile> {
  const response = await fetch(`${API}/api/profile/me`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!response.ok) throw new Error('Failed to update profile')
  return response.json()
}

// -------------------------------------------------------------
// DermaAssess Routes
// -------------------------------------------------------------

export async function assessSkin(imageFile: File, symptoms: string): Promise<SkinResult> {
  const formData = new FormData()
  formData.append('image', imageFile)
  formData.append('symptoms', symptoms)

  const response = await fetch(`${API}/api/derma/assess`, {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to calculate risk algorithm';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}

export async function getSkinHistory(): Promise<SkinResult[]> {
  const response = await fetch(`${API}/api/derma/history`, {
    headers: authHeader(),
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to fetch derma history arrays';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}

// -------------------------------------------------------------
// MediSafe Routes
// -------------------------------------------------------------

export async function scanPrescription(imageFile: File): Promise<PrescriptionResult> {
  const formData = new FormData()
  formData.append('image', imageFile)

  const response = await fetch(`${API}/api/medisafe/scan-prescription`, {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to scan label texts via OCR mapping';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}

// -------------------------------------------------------------
// DermaBot Route
// -------------------------------------------------------------

export async function sendChatMessage(message: string, sessionId: string | null, imageFile?: File | null): Promise<ChatResponse> {
  const formData = new FormData()
  formData.append('message', message)
  if (sessionId) {
    formData.append('session_id', sessionId)
  }
  if (imageFile) {
    formData.append('image', imageFile)
  }

  const response = await fetch(`${API}/api/chat/message`, {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to stream from DermaBot instances';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}

// -------------------------------------------------------------
// Weight AI Route
// -------------------------------------------------------------

export async function logWeight(weightKg: number): Promise<WeightLogResult> {
  const formData = new FormData()
  formData.append('weight_kg', weightKg.toString())

  const response = await fetch(`${API}/api/weight/log`, {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to record weight AI metrics';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}

export async function getWeightHistory(): Promise<WeightLog[]> {
  const response = await fetch(`${API}/api/weight/history`, {
    headers: authHeader(),
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to load weight internal logs';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}

export async function getFatLossAdvice(): Promise<any> {
  const response = await fetch(`${API}/api/weight/fat-loss-advice`, {
    headers: authHeader(),
  })
  
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    let detail = 'Failed to load fat loss advice';
    try { detail = JSON.parse(text).detail || text; } catch(e) {}
    throw new Error(detail);
  }
  return response.json()
}
