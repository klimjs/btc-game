import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEvent } from 'aws-lambda'
import { RESOLVE_AFTER_MS } from './utils'

const { ddbMock, mockGetCoinbasePrice } = vi.hoisted(() => {
  const { mockClient } = require('aws-sdk-client-mock')
  const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
  return {
    ddbMock: mockClient(DynamoDBDocumentClient),
    mockGetCoinbasePrice: vi.fn().mockResolvedValue(51000),
  }
})

vi.mock('../../lib/dynamodb', () => ({
  ddb: ddbMock,
}))

vi.mock('../../lib/utils', () => ({
  buildResponse: (statusCode: number, body: Record<string, unknown>) => ({
    statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }),
  getCoinbasePrice: mockGetCoinbasePrice,
}))

import { handler } from './resolve-one'

const createEvent = (guessId?: string): APIGatewayProxyEvent =>
  ({
    body: null,
    pathParameters: guessId ? { id: guessId } : null,
    queryStringParameters: null,
  }) as APIGatewayProxyEvent

describe('resolve-one guess handler', () => {
  beforeEach(() => {
    ddbMock.reset()
    mockGetCoinbasePrice.mockResolvedValue(51000)
  })

  it('resolves guess when ready (60s + price changed)', async () => {
    const oldGuess = {
      guessId: 'guess-1',
      playerId: 'player-1',
      direction: 'up',
      priceAtGuess: 50000,
      guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS - 1000).toISOString(),
      status: 'PENDING',
    }

    ddbMock.on(GetCommand).resolves({ Item: oldGuess })
    ddbMock.on(UpdateCommand).resolves({})

    const event = createEvent('guess-1')
    const result = await handler(event, {} as any, () => {})

    expect(result?.statusCode).toBe(200)
    const body = JSON.parse(result?.body || '{}')
    expect(body.status).toBe('RESOLVED')
    expect(body.result).toBe('WIN')
    expect(body.resolvedPrice).toBe(51000)
  })

  it('returns guess unchanged if not ready yet', async () => {
    const recentGuess = {
      guessId: 'guess-1',
      playerId: 'player-1',
      direction: 'up',
      priceAtGuess: 50000,
      guessedAt: new Date(Date.now() - 30000).toISOString(),
      status: 'PENDING',
    }

    ddbMock.on(GetCommand).resolves({ Item: recentGuess })

    const event = createEvent('guess-1')
    const result = await handler(event, {} as any, () => {})

    expect(result?.statusCode).toBe(200)
    const body = JSON.parse(result?.body || '{}')
    expect(body.status).toBe('PENDING')
    expect(body.result).toBeUndefined()
  })

  it('returns 404 if guess not found', async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined })

    const event = createEvent('nonexistent-guess')
    const result = await handler(event, {} as any, () => {})

    expect(result?.statusCode).toBe(404)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Guess not found')
  })

  it('returns 400 if guessId missing', async () => {
    const event = createEvent()
    const result = await handler(event, {} as any, () => {})

    expect(result?.statusCode).toBe(400)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Missing guessId')
  })
})
