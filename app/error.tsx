"use client"
import { useEffect } from 'react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong!</h2>
        <p className="text-sm text-gray-500 mb-6 bg-white p-4 rounded-xl border border-gray-200">
          {error.message || "An unexpected rendering error occurred."}
        </p>
        <button
          onClick={() => reset()}
          className="btn-primary px-6 py-2"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
