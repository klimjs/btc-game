import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { usePlayer } from './use-player'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('usePlayer', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('fetches existing player from localStorage', async () => {
    localStorage.setItem('btc-game-player-id', 'existing-player-123')

    const mockPlayer = { playerId: 'existing-player-123', score: 5 }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockPlayer),
    } as Response)

    const { result } = renderHook(() => usePlayer(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.player).toEqual(mockPlayer)
    expect(result.current.error).toBeNull()
  })

  it('creates new player when no localStorage', async () => {
    const mockPlayer = { playerId: 'new-player-456', score: 0 }
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: () => Promise.resolve(mockPlayer),
    } as Response)

    const { result } = renderHook(() => usePlayer(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.player).toEqual(mockPlayer)
    expect(localStorage.getItem('btc-game-player-id')).toBe('new-player-456')
  })

  it('handles 404 by creating new player', async () => {
    localStorage.setItem('btc-game-player-id', 'deleted-player-789')

    const mockNewPlayer = { playerId: 'fresh-player-000', score: 0 }
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Not found' }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve(mockNewPlayer),
      } as Response)

    const { result } = renderHook(() => usePlayer(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.player).toEqual(mockNewPlayer)
    expect(localStorage.getItem('btc-game-player-id')).toBe('fresh-player-000')
  })

  it('handles API errors', async () => {
    localStorage.setItem('btc-game-player-id', 'player-123')

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: 'Server error' }),
    } as Response)

    const { result } = renderHook(() => usePlayer(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.player).toBeNull()
    expect(result.current.error).toBe('Failed to fetch player')
  })
})
