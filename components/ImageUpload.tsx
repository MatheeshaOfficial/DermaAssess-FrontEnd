"use client"
import { useState, useRef } from 'react'
import { UploadCloud, X, ImageIcon, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface ImageUploadProps {
  onImageSelected: (file: File | null) => void
  disabled?: boolean
  maxMB?: number
  accentColor?: 'sky' | 'purple' | 'amber' | 'emerald' | 'teal'
}

export default function ImageUpload({ 
  onImageSelected, 
  disabled = false, 
  maxMB = 10,
  accentColor = 'sky' 
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string>('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (disabled) return
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (disabled) return
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0])
    }
  }

  const handleFiles = (file: File) => {
    setError('')
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.')
      return
    }
    if (file.size > maxMB * 1024 * 1024) {
      setError(`File size must be less than ${maxMB}MB.`)
      return
    }

    const nextPreview = URL.createObjectURL(file)
    setPreview(nextPreview)
    onImageSelected(file)
  }

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    setPreview(null)
    onImageSelected(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const colorMap = {
    sky: 'border-sky-300 bg-sky-50 text-sky-600',
    purple: 'border-purple-300 bg-purple-50 text-purple-600',
    amber: 'border-amber-300 bg-amber-50 text-amber-600',
    emerald: 'border-emerald-300 bg-emerald-50 text-emerald-600',
    teal: 'border-teal-300 bg-teal-50 text-teal-600'
  }

  const activeColorClass = colorMap[accentColor]

  return (
    <div className="w-full">
      <div 
        className={clsx(
          "relative w-full border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer overflow-hidden",
          disabled 
            ? "bg-gray-50 border-gray-200 cursor-not-allowed opacity-60" 
            : dragActive 
              ? activeColorClass 
              : "bg-gray-50 border-gray-300 hover:bg-gray-100",
          preview && "border-transparent bg-gray-900 p-0"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !preview && !disabled && inputRef.current?.click()}
      >
        <input 
          ref={inputRef}
          type="file" 
          accept="image/*"
          className="hidden"
          onChange={handleChange}
          disabled={disabled}
        />

        {preview ? (
          <div className="relative w-full h-full min-h-[250px] group flex items-center justify-center bg-gray-100">
            <img 
              src={preview} 
              alt="Preview" 
              className="max-h-[300px] object-contain"
            />
            {!disabled && (
              <button
                onClick={clearImage}
                className="absolute top-4 right-4 bg-gray-900/80 hover:bg-red-600 text-white p-2 rounded-full backdrop-blur transition-colors shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={clsx(
              "w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
              dragActive ? "bg-white/50" : "bg-white shadow-sm"
            )}>
              <UploadCloud className={clsx("w-8 h-8", dragActive ? "" : "text-gray-400")} />
            </div>
            <p className="font-semibold text-gray-700 mb-1 text-center">
              Click or drag to upload photo
            </p>
            <p className="text-xs text-gray-500 mb-4 text-center">
              JPG, PNG or WEBP (max {maxMB}MB)
            </p>
          </>
        )}
      </div>
      
      {error && (
        <p className="text-red-500 text-sm mt-2 font-medium bg-red-50 px-3 py-1.5 rounded inline-block">
          {error}
        </p>
      )}
    </div>
  )
}
