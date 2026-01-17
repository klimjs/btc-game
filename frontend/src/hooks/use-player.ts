import { useQuery } from '@tanstack/react-query'

const PLAYER_ID_KEY = 'btc-game-player-id'
const API_URL = import.meta.env.VITE_API_URL

interface PlayerResponse {
  playerId: string
  score: number
}

async function createPlayer(): Promise<PlayerResponse> {
  const res = await fetch(`${API_URL}/players`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to create player')

  const data: PlayerResponse = await res.json()

  localStorage.setItem(PLAYER_ID_KEY, data.playerId)

  return data
}

async function getOrCreatePlayer(): Promise<PlayerResponse> {
  const playerId = localStorage.getItem(PLAYER_ID_KEY)

  if (playerId) {
    const res = await fetch(`${API_URL}/players/${playerId}`)

    if (res.status === 404) {
      localStorage.removeItem(PLAYER_ID_KEY)
      return createPlayer()
    }

    if (!res.ok) throw new Error('Failed to fetch player')

    return res.json()
  }

  return createPlayer()
}

export function usePlayer() {
  const {
    data: player,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['player'],
    queryFn: getOrCreatePlayer,
  })

  return {
    player: player ?? null,
    loading: isLoading,
    error: error?.message ?? null,
  }
}
