'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Send, X, MessageCircle } from 'lucide-react'
import type { ChatMessage } from '@/hooks/useTracking'
import { cn } from '@/utils'

interface Props {
  messages: ChatMessage[]
  currentUserId: string
  typingUser: { senderId: string; senderName: string } | null
  onSend: (text: string) => void
  onTyping: (isTyping: boolean) => void
  onClose: () => void
  otherName: string
}

export default function ChatWindow({
  messages,
  currentUserId,
  typingUser,
  onSend,
  onTyping,
  onClose,
  otherName,
}: Props) {
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const typingDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTypingRef = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUser])

  const handleTextChange = useCallback(
    (value: string) => {
      setText(value)
      if (value.trim() && !isTypingRef.current) {
        isTypingRef.current = true
        onTyping(true)
      }
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
      typingDebounceRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          isTypingRef.current = false
          onTyping(false)
        }
      }, 1500)
    },
    [onTyping],
  )

  useEffect(() => {
    return () => {
      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
      if (isTypingRef.current) onTyping(false)
    }
  }, [onTyping])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    // Stop typing indicator before sending
    if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current)
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTyping(false)
    }
    onSend(trimmed)
    setText('')
  }

  // Only show typing indicator from the other person (not ourselves)
  const showTyping = typingUser && typingUser.senderId !== currentUserId

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
            <MessageCircle size={16} className="text-green-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Chat with {otherName}</p>
            <p className="text-[10px] text-slate-400">Trip chat</p>
          </div>
        </div>
        <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {messages.length === 0 && !showTyping && (
          <p className="py-8 text-center text-sm text-slate-400">
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === currentUserId
          const initial = msg.senderName?.[0]?.toUpperCase() ?? '?'

          return (
            <div
              key={i}
              className={cn('flex items-end gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}
            >
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm',
                  isMe ? 'bg-green-500' : 'bg-blue-500',
                )}
              >
                {initial}
              </div>
              <div className={cn('flex max-w-[65%] flex-col gap-0.5', isMe ? 'items-end' : 'items-start')}>
                <span className="px-1 text-[10px] font-medium text-slate-400">
                  {isMe ? 'You' : msg.senderName}
                </span>
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    isMe
                      ? 'rounded-tr-sm bg-green-500 text-white'
                      : 'rounded-tl-sm bg-slate-100 text-slate-800',
                  )}
                >
                  {msg.text}
                </div>
                <span className="px-1 text-[10px] text-slate-300">
                  {new Date(msg.sentAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          )
        })}

        {/* Typing indicator */}
        {showTyping && (
          <div className="flex items-end gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white shadow-sm">
              {typingUser.senderName?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex flex-col gap-0.5 items-start">
              <span className="px-1 text-[10px] font-medium text-slate-400">{typingUser.senderName}</span>
              <div className="rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                <div className="flex items-center gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={submit} className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
        <input
          value={text}
          onChange={(e) => handleTextChange(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-black outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500 text-white shadow-sm transition hover:bg-green-400 disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  )
}
