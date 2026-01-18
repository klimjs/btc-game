import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { APIGatewayProxyEvent } from 'aws-lambda'

const { mockGetCoinbasePrice } = vi.hoisted(() => {
  return {
    mockGetCoinbasePrice: vi.fn().mockResolvedValue(50000),
  }
})

vi.mock('../../lib/utils', () => ({
  buildResponse: (statusCode: number, body: Record<string, unknown>) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  getCoinbasePrice: mockGetCoinbasePrice,
}))

import { handler } from './handler'

describe('prices handler', () => {
  beforeEach(() => {
    mockGetCoinbasePrice.mockResolvedValue(50000)
  })

  it('returns price successfully', async () => {
    const result = await handler(
      {} as APIGatewayProxyEvent,
      {} as any,
      () => {},
    )

    expect(result?.statusCode).toBe(200)
    const body = JSON.parse(result?.body || '{}')
    expect(body.price).toBe(50000)
    expect(body.timestamp).toBeDefined()
  })

  it('returns 500 on API error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    mockGetCoinbasePrice.mockRejectedValue(new Error('API error'))

    const result = await handler(
      {} as APIGatewayProxyEvent,
      {} as any,
      () => {},
    )

    expect(result?.statusCode).toBe(500)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Failed to fetch BTC price')
  })
})
