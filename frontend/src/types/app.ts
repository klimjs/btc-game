import type { ReactNode } from 'react'

export interface BTCPriceResponse {
  price: number
  timestamp: string
}

export type Direction = 'up' | 'down'

export type Status = 'idle' | 'guessing' | 'error' | 'win' | 'lose'

export interface StatusConfig {
  icon: ReactNode
  title: string
  className?: string
}

export interface Guess {
  guessId: string
  playerId: string
  direction: Direction
  priceAtGuess: number
  guessedAt: string
  status: 'PENDING' | 'RESOLVED'
  result?: 'WIN' | 'LOSE'
  resolvedAt?: string
  resolvedPrice?: number
}
