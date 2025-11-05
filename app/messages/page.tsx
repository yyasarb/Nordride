'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { ArrowRight, Calendar, MapPin, Send, Users, Loader2, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

type UserSummary = {
  id: string
  first_name: string | null
  last_name: string | null
  full_name: string | null
  profile_picture_url: string | null
  photo_url: string | null
} | null

type RawThreadData = {
  id: string
  ride: {
    id: string
    origin_address: string
    destination_address: string
    departure_time: string
    status: string
    driver: UserSummary[]
    booking_requests: Array<{
      id: string
      status: 'pending' | 'approved' | 'declined' | 'cancelled'
      rider_id: string
      rider: UserSummary[]
    } | null> | null
  }[] | null
}

type ThreadRecord = {
  id: string
  ride: {
    id: string
    origin_address: string
    destination_address: string
    departure_time: string
    status: string
    driver: UserSummary
    booking_requests: Array<{
      id: string
      status: 'pending' | 'approved' | 'declined' | 'cancelled'
      rider_id: string
      rider: UserSummary
    } | null> | null
  }
}

type ChatMessage = {
  id: string
  thread_id: string
  sender_id: string
  body: string
  created_at: string
  is_read: boolean
}

function getDisplayName(user: UserSummary) {
  if (!user) return 'Nordride user'
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ')
  return name || user.full_name || 'Nordride user'
}

function getAvatarSrc(user: UserSummary) {
  if (!user) return null
  return user.profile_picture_url || user.photo_url || null
}

function formatDateTime(date: string) {
  const d = new Date(date)
  return `${d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })} · ${d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })}`
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [threads, setThreads] = useState<ThreadRecord[]>([])
  const [messagesByThread, setMessagesByThread] = useState<Record<string, ChatMessage[]>>({})
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const { data } = await supabase.auth.getUser()
        if (!data.user) {
          router.push('/auth/login?redirect=/messages')
          return
        }
        setUser(data.user)

        const { data: threadData, error: threadError } = await supabase
          .from('message_threads')
          .select(
            `
              id,
              ride:rides(
                id,
                origin_address,
                destination_address,
                departure_time,
                status,
                driver:users!rides_driver_id_fkey(
                  id,
                  first_name,
                  last_name,
                  full_name,
                  profile_picture_url,
                  photo_url
                ),
                booking_requests(
                  id,
                  status,
                  rider_id,
                  rider:users!booking_requests_rider_id_fkey(
                    id,
                    first_name,
                    last_name,
                    full_name,
                    profile_picture_url,
                    photo_url
                  )
                )
              )
            `
          )
          .order('created_at', { ascending: false })

        if (threadError) throw threadError

        // Normalize the data structure from Supabase
        const normalizedThreads: ThreadRecord[] = (threadData as any[] ?? [])
          .filter(thread => !!thread?.ride && Array.isArray(thread.ride) && thread.ride.length > 0)
          .map(thread => {
            const ride = thread.ride[0]
            return {
              id: thread.id,
              ride: {
                ...ride,
                driver: Array.isArray(ride.driver) && ride.driver.length > 0 ? ride.driver[0] : null,
                booking_requests: ride.booking_requests?.map((req: any) => {
                  if (!req) return null
                  return {
                    ...req,
                    rider: Array.isArray(req.rider) && req.rider.length > 0 ? req.rider[0] : null
                  }
                }) ?? null
              }
            }
          })

        setThreads(normalizedThreads)

        const threadIds = normalizedThreads.map((thread) => thread.id)
        if (threadIds.length > 0) {
          const { data: messagesData, error: messagesError } = await supabase
            .from('messages')
            .select('id, thread_id, sender_id, body, created_at, is_read')
            .in('thread_id', threadIds)
            .order('created_at', { ascending: true })

          if (messagesError) throw messagesError

          const grouped: Record<string, ChatMessage[]> = {}
          for (const message of messagesData ?? []) {
            grouped[message.thread_id] = grouped[message.thread_id] ?? []
            grouped[message.thread_id].push(message)
          }
          setMessagesByThread(grouped)
        } else {
          setMessagesByThread({})
        }
      } catch (err: any) {
        console.error('Failed to load messages', err)
        setError(err?.message || 'Failed to load your messages. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  useEffect(() => {
    if (loading) return
    if (!threads.length) {
      setSelectedThreadId(null)
      return
    }

    const rideParam = searchParams?.get('ride')
    if (rideParam) {
      const threadForRide = threads.find((thread) => thread.ride?.id === rideParam)
      if (threadForRide) {
        setSelectedThreadId(threadForRide.id)
        return
      }
    }

    if (!selectedThreadId) {
      setSelectedThreadId(threads[0].id)
    }
  }, [loading, threads, searchParams, selectedThreadId])

  useEffect(() => {
    if (!selectedThreadId) return
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [selectedThreadId, messagesByThread])

  useEffect(() => {
    if (!threads.length) return
    const channels = threads.map((thread) =>
      supabase
        .channel(`messages-thread-${thread.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `thread_id=eq.${thread.id}` },
          (payload) => {
            setMessagesByThread((prev) => {
              const existing = prev[thread.id] ?? []
              const alreadyExists = existing.some((msg) => msg.id === payload.new.id)
              if (alreadyExists) return prev
              return {
                ...prev,
                [thread.id]: [...existing, payload.new as ChatMessage]
              }
            })
          }
        )
        .subscribe()
    )

    return () => {
      channels.forEach((channel) => {
        supabase.removeChannel(channel)
      })
    }
  }, [threads])

  const threadMeta = useMemo(() => {
    return threads.map((thread) => {
      const messages = messagesByThread[thread.id] ?? []
      const lastMessage = messages.length ? messages[messages.length - 1] : null
      const unreadCount =
        user?.id
          ? messages.filter((message) => message.sender_id !== user.id && !message.is_read).length
          : 0
      return { thread, messages, lastMessage, unreadCount }
    })
  }, [threads, messagesByThread, user?.id])

  const handleSelectThread = async (threadId: string) => {
    if (threadId === selectedThreadId) return
    setSelectedThreadId(threadId)
    await markThreadAsRead(threadId)
  }

  const markThreadAsRead = useCallback(
    async (threadId: string) => {
      if (!user) return
      const unread = (messagesByThread[threadId] ?? []).some(
        (message) => message.sender_id !== user.id && !message.is_read
      )
      if (!unread) return

      try {
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('thread_id', threadId)
          .neq('sender_id', user.id)
          .is('is_read', false)

        setMessagesByThread((prev) => {
          const existing = prev[threadId] ?? []
          return {
            ...prev,
            [threadId]: existing.map((message) =>
              message.sender_id === user.id ? message : { ...message, is_read: true }
            )
          }
        })
      } catch (err) {
        console.error('Failed to mark messages as read', err)
      }
    },
    [messagesByThread, user]
  )

  const handleSend = async () => {
    if (!user || !selectedThreadId) return
    const trimmed = newMessage.trim()
    if (!trimmed) return

    setSending(true)
    try {
      const { data: message, error: sendError } = await supabase
        .from('messages')
        .insert({
          thread_id: selectedThreadId,
          sender_id: user.id,
          body: trimmed
        })
        .select('id, thread_id, sender_id, body, created_at, is_read')
        .single()

      if (sendError) throw sendError

      if (message) {
        setMessagesByThread((prev) => {
          const existing = prev[selectedThreadId] ?? []
          return {
            ...prev,
            [selectedThreadId]: [...existing, message]
          }
        })
      }
      setNewMessage('')
    } catch (err: any) {
      console.error('Failed to send message', err)
      setError(err?.message || 'Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  useEffect(() => {
    if (selectedThreadId) {
      setLoadingMessages(true)
      markThreadAsRead(selectedThreadId).finally(() => setLoadingMessages(false))
    }
  }, [selectedThreadId, markThreadAsRead])

  useEffect(() => {
    if (!selectedThreadId || !user) return
    const messages = messagesByThread[selectedThreadId] ?? []
    const unread = messages.some(
      (message) => message.sender_id !== user.id && !message.is_read
    )
    if (unread) {
      markThreadAsRead(selectedThreadId)
    }
  }, [messagesByThread, selectedThreadId, user, markThreadAsRead])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-6xl space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-4xl md:text-5xl font-bold">Messages</h1>
          <p className="text-gray-600">
            Coordinate trip details with drivers and riders. New ride requests will appear here.
          </p>
        </div>

        {error && (
          <Card className="border-2 border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </Card>
        )}

        {threads.length === 0 ? (
          <Card className="p-10 text-center border-2 border-dashed">
            <p className="text-gray-600">
              You have no conversations yet. Request to join a ride or create a trip to start chatting.
            </p>
            <div className="mt-6 flex items-center justify-center gap-4">
              <Button asChild className="rounded-full">
                <Link href="/rides/search" className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Find a ride
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-2">
                <Link href="/rides/create" className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Offer a ride
                </Link>
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <Card className="border-2 p-0 overflow-hidden">
              <div className="border-b px-5 py-4">
                <h2 className="text-lg font-semibold">Conversations</h2>
              </div>
              <div className="divide-y">
                {threadMeta.map(({ thread, lastMessage, unreadCount }) => {
                  const ride = thread.ride
                  if (!ride) return null
                  const counterpart =
                    ride.driver?.id === user?.id
                      ? ride.booking_requests?.find(
                          (request) =>
                            request?.status === 'approved' ||
                            request?.status === 'pending'
                        )?.rider
                      : ride.driver
                  const counterpartName = getDisplayName(counterpart ?? null)
                  const lastMessagePreview = lastMessage?.body || 'No messages yet'

                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => handleSelectThread(thread.id)}
                      className={`w-full px-5 py-4 text-left transition-colors ${
                        selectedThreadId === thread.id ? 'bg-gray-100' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-900">
                            {ride.origin_address} &rarr; {ride.destination_address}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDateTime(ride.departure_time)}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">With {counterpartName}</p>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {lastMessagePreview}
                          </p>
                        </div>
                        {unreadCount > 0 && (
                          <span className="ml-2 rounded-full bg-black px-2 py-1 text-xs font-semibold text-white">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </Card>

            <Card className="border-2 flex flex-col overflow-hidden">
              {!selectedThreadId ? (
                <div className="flex flex-1 items-center justify-center p-10 text-center text-gray-500">
                  Select a conversation to start chatting.
                </div>
              ) : (
                <>
                  <ChatHeader
                    thread={threads.find((thread) => thread.id === selectedThreadId) ?? null}
                    currentUserId={user?.id ?? ''}
                  />

                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {loadingMessages ? (
                      <div className="flex h-full items-center justify-center text-gray-500">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading messages...
                      </div>
                    ) : (
                      (messagesByThread[selectedThreadId] ?? []).map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={message.sender_id === user?.id}
                        />
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="border-t px-6 py-4">
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(event) => setNewMessage(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault()
                            handleSend()
                          }
                        }}
                        className="flex-1 rounded-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                        disabled={sending}
                      />
                      <Button
                        className="rounded-full"
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                      >
                        {sending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function ChatHeader({
  thread,
  currentUserId
}: {
  thread: ThreadRecord | null
  currentUserId: string
}) {
  if (!thread || !thread.ride) {
    return (
      <div className="border-b px-6 py-4">
        <h2 className="text-lg font-semibold">Conversation</h2>
      </div>
    )
  }

  const ride = thread.ride
  const isDriver = ride.driver?.id === currentUserId
  const riders =
    ride.booking_requests
      ?.filter((request) => request && request.rider && request.status !== 'declined')
      .map((request) => request?.rider)
      .filter(Boolean) ?? []
  const counterpart = isDriver ? null : ride.driver

  return (
    <div className="border-b px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Ride</p>
          <p className="text-lg font-semibold">
            {ride.origin_address} &rarr; {ride.destination_address}
          </p>
          <p className="text-sm text-gray-500 mt-1">{formatDateTime(ride.departure_time)}</p>
        </div>
        <Button asChild variant="outline" className="rounded-full border-2" size="sm">
          <Link href={`/rides/${ride.id}`} className="flex items-center gap-2 text-xs font-medium">
            View ride
            <ArrowRight className="h-3 w-3" />
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold text-gray-900">Participants:</div>
          {isDriver ? (
            <div className="flex flex-wrap items-center gap-3">
              {riders.length === 0 ? (
                <span className="text-sm text-gray-500">No confirmed riders yet</span>
              ) : (
                riders.filter(Boolean).map((rider) => (
                  <ParticipantBadge key={rider?.id ?? Math.random()} user={rider!} />
                ))
              )}
            </div>
          ) : (
            <ParticipantBadge user={counterpart} />
          )}
        </div>
      </div>
    </div>
  )
}

function ParticipantBadge({ user }: { user: UserSummary }) {
  const name = getDisplayName(user ?? null)
  const avatar = getAvatarSrc(user ?? null)

  return (
    <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={28}
          height={28}
          className="h-7 w-7 rounded-full object-cover"
        />
      ) : (
        <span className="h-7 w-7 rounded-full bg-black text-white text-xs font-semibold flex items-center justify-center">
          {name.charAt(0)}
        </span>
      )}
      <span>{name}</span>
    </span>
  )
}

function MessageBubble({ message, isOwn }: { message: ChatMessage; isOwn: boolean }) {
  const time = new Date(message.created_at).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${
          isOwn
            ? 'bg-black text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
        }`}
      >
        <p className="whitespace-pre-line">{message.body}</p>
        <p className={`mt-1 text-xs ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>{time}</p>
      </div>
    </div>
  )
}
