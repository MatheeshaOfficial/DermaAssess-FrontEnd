"use client"
import { useState, useRef, useEffect } from 'react'
import { Bot, User, Send, Paperclip, X, Image as ImageIcon } from 'lucide-react'
import { sendChatMessage } from '../../lib/api'
import { useRequireAuth } from '../../lib/hooks/useAuth'
import clsx from 'clsx'
import NotificationBanner from '../../components/NotificationBanner'
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  imageUrl?: string 
}
export default function ChatPage() {
  const { token, loginMethod } = useRequireAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  if (!token) return null
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }
  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  const sendMessage = async () => {
    if ((!input.trim() && !imageFile) || loading) return
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      imageUrl: imagePreview || undefined
    }
    setMessages(prev => [...prev, newMessage])
    setInput('')
    const currentImageFile = imageFile
    clearImage()
    setLoading(true)
    try {
      const resp = await sendChatMessage(newMessage.content, sessionId, currentImageFile)
      if (resp.session_id) {
        setSessionId(resp.session_id)
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: resp.reply,
      }
      setMessages(prev => [...prev, botMessage])
    } catch (err: any) {
      console.error(err)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I encountered an error communicating with the DermaBot server.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  const handleSuggestedClick = (text: string) => {
    setInput(text)
  }
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] relative bg-gray-50/50">
      <div className="bg-emerald-50 border-b border-emerald-100 p-4 shrink-0 flex items-center justify-between shadow-sm z-10">
         <div className="flex items-center gap-3 text-emerald-900">
          <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center shadow-md">
             <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-none tracking-tight">DermaBot Assistant</h1>
            <p className="text-sm font-medium text-emerald-700 mt-1 leading-none">Powered by Gemini 3.1 Pro</p>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto animate-in fade-in">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 shadow-sm border border-emerald-200">
              <Bot className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">How can I help you today?</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
              Ask me questions about symptoms, medications, or share a photo for context.
            </p>
            
            <div className="space-y-3 w-full">
              {[
                "What could cause a red itchy rash?",
                "Is this bruise normal?",
                "What are signs of an allergic reaction?",
                "How do I treat a minor burn at home?"
              ].map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestedClick(q)}
                  className="block w-full p-4 text-left text-sm bg-white border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm rounded-xl transition-all font-medium text-gray-700"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={clsx(
                "flex max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                msg.role === 'user' ? "ml-auto" : ""
              )}
            >
              <div 
                className={clsx(
                  "flex items-end gap-3",
                  msg.role === 'user' ? "flex-row-reverse" : ""
                )}
              >
                <div 
                  className={clsx(
                    "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm border",
                    msg.role === 'user' ? "bg-sky-500 text-white border-sky-600" : "bg-emerald-500 text-white border-emerald-600"
                  )}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                
                <div 
                  className={clsx(
                    "relative overflow-hidden group shadow-sm text-[15px] leading-relaxed",
                    msg.role === 'user' 
                      ? "bg-sky-500 text-white rounded-t-2xl rounded-bl-2xl py-3 px-4 border border-sky-600/50" 
                      : "bg-white text-gray-800 rounded-t-2xl rounded-br-2xl py-4 px-5 border border-gray-200"
                  )}
                >
                  {msg.imageUrl && (
                    <img 
                      src={msg.imageUrl} 
                      alt="Uploaded" 
                      className="max-w-[200px] mb-3 rounded-lg border border-black/10 shadow-sm" 
                    />
                  )}
                  {msg.content && (
                    <p className="whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {loading && (
          <div className="flex max-w-[80%] animate-in fade-in">
            <div className="flex items-end gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white px-5 py-4 rounded-t-2xl rounded-br-2xl border border-gray-200 shadow-sm flex gap-1 items-center h-[52px]">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* Input Area */}
      <div className="shrink-0 bg-white border-t border-gray-200 p-4 pb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <div className="max-w-4xl mx-auto">
          {imagePreview && (
            <div className="mb-3 relative inline-block group">
              <img src={imagePreview} className="w-16 h-16 object-cover rounded-lg border shadow-sm" alt="Preview"/>
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-gray-800 text-white p-1 rounded-full shadow invisible group-hover:visible transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl p-2 border border-gray-200 shadow-inner focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-xl transition-colors shrink-0"
              title="Attach Image"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a medical question..."
              className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 px-2 text-gray-800 placeholder:text-gray-400 max-h-32 min-h-[44px] outline-none"
              rows={1}
            />
            
            <button 
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !imageFile)}
              className="p-3 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl transition-colors shrink-0 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-sm block text-center"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
