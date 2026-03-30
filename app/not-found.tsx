import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-sky-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/" className="btn-primary px-6 py-3 inline-block">
          Return to Hub
        </Link>
      </div>
    </div>
  )
}
