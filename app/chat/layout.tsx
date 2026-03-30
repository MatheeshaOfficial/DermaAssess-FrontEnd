import Sidebar from '../../components/Sidebar'

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 ml-60 overflow-hidden">
        {children}
      </main>
    </div>
  )
}
