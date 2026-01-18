import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { RESOLVE_AFTER_MS } from './utils'
import type { Guess } from './types'

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
  getCoinbasePrice: mockGetCoinbasePrice,
}))

import { handler } from './resolve'

describe('resolve guesses handler (scheduled)', () => {
  beforeEach(() => {
    ddbMock.reset()
    mockGetCoinbasePrice.mockResolvedValue(51000)
  })

  it('resolves multiple ready guesses', async () => {
    const readyGuesses: Guess[] = [
      {
        guessId: 'guess-1',
        playerId: 'player-1',
        direction: 'up',
        priceAtGuess: 50000,
        guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS - 1000).toISOString(),
        status: 'PENDING',
      },
      {
        guessId: 'guess-2',
        playerId: 'player-2',
        direction: 'down',
        priceAtGuess: 50000,
        guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS - 2000).toISOString(),
        status: 'PENDING',
      },
    ]

    ddbMock.on(QueryCommand).resolves({ Items: readyGuesses })
    ddbMock.on(UpdateCommand).resolves({})

    const result = await handler()

    expect(result).toEqual({ resolved: true })
    expect(ddbMock.calls()).toHaveLength(5)
  })

  it('handles empty guesses list', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] })

    const result = await handler()

    expect(result).toEqual({ resolved: true })
    expect(ddbMock.calls()).toHaveLength(1)
  })

  it('skips guesses not ready yet', async () => {
    const mixedGuesses: Guess[] = [
      {
        guessId: 'guess-1',
        playerId: 'player-1',
        direction: 'up',
        priceAtGuess: 50000,
        guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS - 1000).toISOString(),
        status: 'PENDING',
      },
      {
        guessId: 'guess-2',
        playerId: 'player-2',
        direction: 'down',
        priceAtGuess: 50000,
        guessedAt: new Date(Date.now() - 30000).toISOString(), // not ready
        status: 'PENDING',
      },
    ]

    ddbMock.on(QueryCommand).resolves({ Items: mixedGuesses })
    ddbMock.on(UpdateCommand).resolves({})

    const result = await handler()

    expect(result).toEqual({ resolved: true })
    expect(ddbMock.calls()).toHaveLength(3)
  })

  it('skips guesses with unchanged price', async () => {
    const unchangedGuess: Guess[] = [
      {
        guessId: 'guess-1',
        playerId: 'player-1',
        direction: 'up',
        priceAtGuess: 50000,
        guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS - 1000).toISOString(),
        status: 'PENDING',
      },
    ]

    mockGetCoinbasePrice.mockResolvedValue(50000) // same price
    ddbMock.on(QueryCommand).resolves({ Items: unchangedGuess })
    ddbMock.on(UpdateCommand).resolves({})

    const result = await handler()

    expect(result).toEqual({ resolved: true })
    // no updates because price hasn't changed
    expect(ddbMock.calls()).toHaveLength(1)
  })

  it('handles errors gracefully', async () => {
    ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'))

    await expect(handler()).rejects.toThrow('DynamoDB error')
  })
})
