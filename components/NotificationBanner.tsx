import { Send, Mail, Bell } from 'lucide-react'

interface NotificationBannerProps {
  channel?: "telegram" | "email" | "both" | null
}

export default function NotificationBanner({ channel }: NotificationBannerProps) {
  if (!channel) return null

  if (channel === 'telegram') {
    return (
      <div className="bg-sky-50 border border-sky-200 text-sky-800 rounded-xl p-3 flex gap-3 items-center mb-6 shadow-sm">
        <div className="bg-sky-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md shrink-0">
           <Send className="w-4 h-4 text-white ml-0.5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Automated Alerts via Telegram</h4>
          <p className="text-xs text-sky-700">Health results are immediately routed to @{process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}</p>
        </div>
      </div>
    )
  }

  if (channel === 'email') {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3 flex gap-3 items-center mb-6 shadow-sm">
        <div className="bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md shrink-0">
           <Mail className="w-4 h-4 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">Automated Alerts via Email</h4>
          <p className="text-xs text-blue-700">Health results are immediately routed to your connected Google Gmail account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-purple-50 border border-purple-200 text-purple-800 rounded-xl p-3 flex gap-3 items-center mb-6 shadow-sm">
      <div className="bg-purple-500 rounded-full w-8 h-8 flex items-center justify-center shadow-md shrink-0">
         <Bell className="w-4 h-4 text-white hover:animate-ping" />
      </div>
      <div>
        <h4 className="font-semibold text-sm">Dual Notifications Active</h4>
        <p className="text-xs text-purple-700">Health results dispatched securely via both Telegram (primary) and Gmail.</p>
      </div>
    </div>
  )
}
