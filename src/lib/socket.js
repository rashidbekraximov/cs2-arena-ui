import { useEffect, useRef } from 'react'
import { Client } from '@stomp/stompjs'

/**
 * Bitta umumiy STOMP ulanishi. Sahifalar faqat obuna bo'ladi —
 * backend o'zgarish bo'lganda xabar yuboradi, sahifa ma'lumotni qayta yuklaydi.
 */
let client = null
const subscribers = new Map() // topic -> Set<handler>
const active = new Map() // topic -> StompSubscription

function ensureClient() {
  if (client) return client
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  client = new Client({
    brokerURL: `${proto}://${window.location.host}/ws`,
    reconnectDelay: 3000,
    onConnect: () => {
      active.clear()
      for (const topic of subscribers.keys()) subscribeRemote(topic)
    },
  })
  client.activate()
  return client
}

function subscribeRemote(topic) {
  if (!client?.connected || active.has(topic)) return
  const sub = client.subscribe(topic, (frame) => {
    let payload = null
    try {
      payload = JSON.parse(frame.body)
    } catch {
      payload = frame.body
    }
    subscribers.get(topic)?.forEach((h) => h(payload))
  })
  active.set(topic, sub)
}

function subscribe(topic, handler) {
  ensureClient()
  if (!subscribers.has(topic)) subscribers.set(topic, new Set())
  subscribers.get(topic).add(handler)
  subscribeRemote(topic)
  return () => {
    const set = subscribers.get(topic)
    set?.delete(handler)
    if (set && set.size === 0) {
      subscribers.delete(topic)
      active.get(topic)?.unsubscribe()
      active.delete(topic)
    }
  }
}

/** React hook: topic === null bo'lsa obuna bo'linmaydi. */
export function useTopic(topic, handler) {
  const ref = useRef(handler)
  ref.current = handler
  useEffect(() => {
    if (!topic) return undefined
    return subscribe(topic, (p) => ref.current(p))
  }, [topic])
}
