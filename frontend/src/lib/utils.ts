import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import type { BTCPriceResponse, Direction, Guess } from '@/types/app'

export const API_URL = import.meta.env.VITE_API_URL || ''

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchBTCPrice = async (): Promise<BTCPriceResponse> => {
  const res = await fetch(`${API_URL}/prices`)
  return res.json()
}

// TODO: fetch -> axios
export const createGuess = async (
  playerId: string,
  direction: Direction,
): Promise<Guess> => {
  const res = await fetch(`${API_URL}/guesses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerId, direction }),
  })

  if (!res.ok) throw new Error('There is an active guess. Please wait.')

  return res.json()
}

export const resolveGuess = async (guessId: string): Promise<Guess> => {
  const res = await fetch(`${API_URL}/guesses/${guessId}/resolve`, {
    method: 'POST',
  })

  if (!res.ok) throw new Error('Failed to resolve guess')

  return res.json()
}

export const formatUSD = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const formatDateTime = (isoString: string) =>
  format(new Date(isoString), 'dd.MM.yyyy HH:mm:ss')

export const formatCountdown = (countdown: number) => {
  if (countdown === 0) return 'just a bit...'

  return `0:${countdown.toString().padStart(2, '0')}`
}
