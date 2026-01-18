import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from './use-countdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initializes with correct values', () => {
    const { result } = renderHook(() => useCountdown(60))

    expect(result.current.countdown).toBe(60)
    expect(result.current.isRunning).toBe(false)
    expect(result.current.isDone).toBe(false)
  })

  it('counts down when started', () => {
    const { result } = renderHook(() => useCountdown(60))

    act(() => {
      result.current.start()
    })

    expect(result.current.isRunning).toBe(true)
    expect(result.current.countdown).toBe(60)

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(result.current.countdown).toBe(59)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.countdown).toBe(54)
  })

  it('stops at 0 and sets isDone to true', () => {
    const { result } = renderHook(() => useCountdown(3))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(3000)
    })

    expect(result.current.countdown).toBe(0)
    expect(result.current.isDone).toBe(true)
  })

  it('reset restores initial value and stops', () => {
    const { result } = renderHook(() => useCountdown(60))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(10000)
    })

    expect(result.current.countdown).toBe(50)

    act(() => {
      result.current.reset()
    })

    expect(result.current.countdown).toBe(60)
    expect(result.current.isRunning).toBe(false)
  })

  it('stop pauses countdown', () => {
    const { result } = renderHook(() => useCountdown(60))

    act(() => {
      result.current.start()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.countdown).toBe(55)

    act(() => {
      result.current.stop()
    })

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.countdown).toBe(55)
    expect(result.current.isRunning).toBe(false)
  })
})
