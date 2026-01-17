import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import type { BTCPriceResponse } from '@/types/app'

export const API_URL = import.meta.env.VITE_API_URL || ''

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchBTCPrice = async (): Promise<BTCPriceResponse> => {
  const res = await fetch(`${API_URL}/prices`)
  return res.json()
}

export const formatUSD = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

export const formatDateTime = (isoString: string) =>
  format(new Date(isoString), 'dd.MM.yyyy HH:mm:ss')
