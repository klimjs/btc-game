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
