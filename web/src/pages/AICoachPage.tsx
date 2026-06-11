import { useState, useRef, useEffect } from 'react'
import api from '../lib/api'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const QUICK_PROMPTS = [
  'Create a beginner workout plan',
  'Best exercises for weight loss',
  'How to build muscle fast',
  'Nutrition tips for gym goers',
]

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hi! I'm your AI fitness coach 💪 Ask me anything about workouts, nutrition, or gym tips!",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages
        .filter((m) => m.id !== '0')
        .map((m) => ({ role: m.role, content: m.content }))

      const res = await api.post('/ai/chat', { message: text.trim(), history })

      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.data.reply,
      }])
    } catch (e) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-120px)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI Fitness Coach</h1>
        <p className="text-[#6C63FF] text-sm mt-1">Powered by Gemini</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-[#6C63FF] text-white rounded-br-sm'
                : 'bg-[#1a1a1a] border border-[#2a2a2a] text-gray-200 rounded-bl-sm'
            }`}>
              {msg.role === 'assistant' && (
                <p className="text-[#6C63FF] text-xs font-bold mb-1">💪 Coach</p>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl px-4 py-3">
              <p className="text-gray-400 text-sm">AI Coach is thinking...</p>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length === 1 && (
        <div className="mb-4">
          <p className="text-gray-500 text-sm mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="bg-[#1a1a1a] border border-[#333] text-gray-400 text-sm px-4 py-2 rounded-full hover:text-white hover:border-[#6C63FF] transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Ask your fitness coach..."
          className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-3 text-white outline-none placeholder-gray-600 focus:border-[#6C63FF]"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="bg-[#6C63FF] text-white w-12 h-12 rounded-xl flex items-center justify-center text-xl hover:bg-[#5a52d5] transition disabled:opacity-40"
        >
          ↑
        </button>
      </div>
    </div>
  )
}