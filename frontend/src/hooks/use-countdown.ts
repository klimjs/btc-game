import { useState, useEffect, useCallback } from 'react'

export function useCountdown(initialSeconds: number) {
  const [countdown, setCountdown] = useState(initialSeconds)
  const [isRunning, setIsRunning] = useState(false)

  const start = useCallback(() => {
    setCountdown(initialSeconds)
    setIsRunning(true)
  }, [initialSeconds])

  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setCountdown(initialSeconds)
    setIsRunning(false)
  }, [initialSeconds])

  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning])

  return { countdown, isRunning, isDone: countdown === 0, start, stop, reset }
}
