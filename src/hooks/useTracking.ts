'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { socket } from '@/lib/socket'

export interface LocationUpdate {
  tripId: string
  lat: number
  lng: number
  heading?: number
  senderId?: string
}

export interface ChatMessage {
  tripId: string
  senderId: string
  senderName: string
  text: string
  sentAt: string
}

export interface TypingPayload {
  tripId: string
  senderId: string
  senderName: string
  isTyping: boolean
}

interface UseTrackingOptions {
  userId?: string
  driverId?: string
}

export const useTracking = (tripId: string, options: UseTrackingOptions = {}) => {
  const { userId, driverId } = options

  const [driverLocation, setDriverLocation] = useState<LocationUpdate | null>(null)
  const [passengerLocation, setPassengerLocation] = useState<LocationUpdate | null>(null)
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [tripStatus, setTripStatus] = useState<'idle' | 'started' | 'completed'>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [typingUser, setTypingUser] = useState<{ senderId: string; senderName: string } | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    socket.auth = { token }
    socket.connect()

    const onConnect = () => setIsConnected(true)
    const onDisconnect = () => setIsConnected(false)
    const onLocation = (data: LocationUpdate) => {
      if (data.tripId !== tripId) return
      // If we know who the driver is, route by senderId; otherwise fall back to driverLocation
      if (driverId && data.senderId) {
        if (data.senderId === driverId) setDriverLocation(data)
        else setPassengerLocation(data)
      } else {
        setDriverLocation(data)
      }
    }
    const onStarted = () => setTripStatus('started')
    const onCompleted = () => setTripStatus('completed')
    const onMessage = (msg: ChatMessage) => {
      if (msg.tripId !== tripId) return
      setMessages((prev) => {
        const isDupe = prev.some(
          (m) => m.senderId === msg.senderId && m.sentAt === msg.sentAt && m.text === msg.text,
        )
        return isDupe ? prev : [...prev, msg]
      })
    }
    const onTyping = (payload: TypingPayload) => {
      if (payload.tripId !== tripId) return
      if (payload.isTyping) {
        setTypingUser({ senderId: payload.senderId, senderName: payload.senderName })
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
        typingTimerRef.current = setTimeout(() => setTypingUser(null), 3000)
      } else {
        setTypingUser(null)
        if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
      }
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.emit('join_trip', { tripId })
    socket.on('trip_location_update', onLocation)
    socket.on('trip_started', onStarted)
    socket.on('trip_completed', onCompleted)
    socket.on('new_message', onMessage)
    socket.on('typing', onTyping)

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('trip_location_update', onLocation)
      socket.off('trip_started', onStarted)
      socket.off('trip_completed', onCompleted)
      socket.off('new_message', onMessage)
      socket.off('typing', onTyping)
      socket.disconnect()
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current)
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current)
    }
  }, [tripId, driverId])

  const startSharingLocation = useCallback(
    (isDriver: boolean) => {
      if (!navigator.geolocation) return
      if (watchIdRef.current !== null) return // already watching
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const update: LocationUpdate = {
            tripId,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: pos.coords.heading ?? undefined,
            senderId: userId,
          }
          socket.emit('trip_location_update', update)
          // Optimistic local update so the sender sees themselves immediately
          if (isDriver) setDriverLocation(update)
          else setPassengerLocation(update)
          setMyLocation({ lat: update.lat, lng: update.lng })
        },
        undefined,
        { enableHighAccuracy: true, maximumAge: 3000 },
      )
    },
    [tripId, userId],
  )

  const stopSharingLocation = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
  }, [])

  const emitTripStarted = useCallback(() => {
    socket.emit('trip_started', { tripId })
    setTripStatus('started')
  }, [tripId])

  const emitTripCompleted = useCallback(() => {
    socket.emit('trip_completed', { tripId })
    setTripStatus('completed')
  }, [tripId])

  const sendMessage = useCallback(
    (senderId: string, senderName: string, text: string) => {
      const msg: ChatMessage = { tripId, senderId, senderName, text, sentAt: new Date().toISOString() }
      socket.emit('send_message', msg)
    },
    [tripId],
  )

  const sendTyping = useCallback(
    (senderId: string, senderName: string, isTyping: boolean) => {
      socket.emit('typing', { tripId, senderId, senderName, isTyping })
    },
    [tripId],
  )

  return {
    driverLocation,
    passengerLocation,
    myLocation,
    isConnected,
    tripStatus,
    messages,
    typingUser,
    startSharingLocation,
    stopSharingLocation,
    emitTripStarted,
    emitTripCompleted,
    sendMessage,
    sendTyping,
  }
}
