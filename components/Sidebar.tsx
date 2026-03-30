"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Stethoscope, 
  Pill, 
  Bot, 
  Scale, 
  User, 
  LogOut,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '../lib/hooks/useAuth'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, iconSrc: null },
  { href: '/derma', label: 'DermaAssess', icon: null, iconSrc: 'https://res.cloudinary.com/df6y9uilz/image/upload/v1774895743/Gemini_Generated_Image_s6pkgqs6pkgqs6pk_bdy7wj.png' },
  { href: '/medisafe', label: 'MediSafe', icon: null, iconSrc: 'https://res.cloudinary.com/df6y9uilz/image/upload/v1774895739/Gemini_Generated_Image_2o6p4j2o6p4j2o6p_heuxap.png' },
  { href: '/chat', label: 'DermaBot', icon: null, iconSrc: 'https://res.cloudinary.com/df6y9uilz/image/upload/v1774895740/Gemini_Generated_Image_ggakkpggakkpggak_jctvln.png' },
  { href: '/weight', label: 'Weight AI', icon: null, iconSrc: 'https://res.cloudinary.com/df6y9uilz/image/upload/v1774895766/Gemini_Generated_Image_iwwn30iwwn30iwwn_wzyklz.png' },
  { href: '/profile', label: 'Profile', icon: User, iconSrc: null },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { logout, loginMethod } = useAuth()

  const renderIndicator = () => {
    switch(loginMethod) {
      case 'telegram':
        return <div className="text-[10px] bg-sky-100 text-sky-800 px-2 py-1 rounded w-max mt-1 font-bold">Telegram notifications</div>
      case 'google':
        return <div className="text-[10px] bg-blue-100 text-blue-800 px-2 py-1 rounded w-max mt-1 font-bold">Email notifications</div>
      case 'both':
        return <div className="text-[10px] bg-purple-100 text-purple-800 px-2 py-1 rounded w-max mt-1 font-bold">Telegram + Email</div>
      default:
        return null
    }
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-100 flex flex-col z-20">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-[1.05] transition-transform duration-300 overflow-hidden transform-gpu border border-gray-100">
            <img src="https://res.cloudinary.com/df6y9uilz/image/upload/v1774892465/Gemini_Generated_Image_ukl7otukl7otukl7_dgq6kr.png" className="w-full h-full object-cover" alt="App Logo" />
          </div>
          <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-700 to-sky-900 text-xl group-hover:from-sky-500 group-hover:to-sky-700 transition-colors">DermaAssess</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer group",
                isActive 
                  ? "bg-gradient-to-r from-sky-50 to-white shadow-sm border border-sky-100/50 text-sky-800 translate-x-1" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 hover:translate-x-1"
              )}
            >
              {item.iconSrc ? (
                <div className={clsx("flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 overflow-hidden shrink-0", isActive ? "scale-110 shadow-md ring-2 ring-sky-100" : "group-hover:scale-110 group-hover:shadow-md")}>
                  <img src={item.iconSrc} alt={item.label} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className={clsx("flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 shrink-0", isActive ? "scale-110 bg-white drop-shadow-sm text-sky-600" : "group-hover:scale-110 text-gray-400 group-hover:text-gray-600 group-hover:bg-white group-hover:shadow-sm")}>
                  {item.icon && <item.icon className="w-4 h-4" />}
                </div>
              )}
              <span className="tracking-wide">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-5 mb-4 border-b border-gray-50 pb-4">
        <label className="text-xs text-gray-400 font-semibold uppercase tracking-wider block mb-1">
          Active Sync
        </label>
        {renderIndicator()}
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={logout}
          className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          Sign out
        </button>
      </div>
    </aside>
  )
}
