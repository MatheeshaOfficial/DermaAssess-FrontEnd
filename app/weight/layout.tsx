import Sidebar from '../../components/Sidebar'

export default function WeightLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50/50">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
