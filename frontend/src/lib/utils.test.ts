import { describe, it, expect } from 'vitest'
import { formatUSD, formatDateTime, formatCountdown } from './utils'

describe('formatUSD', () => {
  it('formats currency correctly', () => {
    expect(formatUSD(50000)).toBe('$50,000.00')
    expect(formatUSD(1234.56)).toBe('$1,234.56')
    expect(formatUSD(0)).toBe('$0.00')
    expect(formatUSD(99999999.99)).toBe('$99,999,999.99')
  })
})

describe('formatDateTime', () => {
  it('formats ISO strings correctly', () => {
    const result = formatDateTime('2024-01-15T14:30:00.000Z')
    expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4} \d{2}:\d{2}:\d{2}$/)
  })
})

describe('formatCountdown', () => {
  it('returns "0:XX" format', () => {
    expect(formatCountdown(60)).toBe('0:60')
    expect(formatCountdown(45)).toBe('0:45')
    expect(formatCountdown(9)).toBe('0:09')
    expect(formatCountdown(1)).toBe('0:01')
  })

  it('returns "just a bit..." at 0', () => {
    expect(formatCountdown(0)).toBe('just a bit...')
  })
})
