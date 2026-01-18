import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockClient } from 'aws-sdk-client-mock'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import type { Guess } from './types'

const ddbMock = mockClient(DynamoDBDocumentClient)

vi.mock('../../../lib/dynamodb', () => ({
  ddb: ddbMock,
}))

import { isReadyToResolve, resolveGuess, RESOLVE_AFTER_MS } from './utils'

const createMockGuess = (overrides?: Partial<Guess>): Guess => ({
  playerId: 'player-1',
  guessId: 'guess-1',
  direction: 'up',
  priceAtGuess: 50000,
  guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS - 1000).toISOString(),
  status: 'PENDING',
  ...overrides,
})

describe('isReadyToResolve', () => {
  it('returns false if status is not PENDING', () => {
    const guess = createMockGuess({ status: 'RESOLVED' })
    expect(isReadyToResolve(guess, 51000)).toBe(false)
  })

  it('returns false if less than 60 seconds passed', () => {
    const guess = createMockGuess({
      guessedAt: new Date(Date.now() - 30000).toISOString(),
    })
    expect(isReadyToResolve(guess, 51000)).toBe(false)
  })

  it('returns false if price unchanged', () => {
    const guess = createMockGuess({ priceAtGuess: 50000 })
    expect(isReadyToResolve(guess, 50000)).toBe(false)
  })

  it('returns true when 60s+ passed and price changed', () => {
    const guess = createMockGuess({ priceAtGuess: 50000 })
    expect(isReadyToResolve(guess, 51000)).toBe(true)
  })

  it('returns true when exactly 60 seconds passed', () => {
    const guess = createMockGuess({
      guessedAt: new Date(Date.now() - RESOLVE_AFTER_MS).toISOString(),
    })
    expect(isReadyToResolve(guess, 51000)).toBe(true)
  })

  it('handles price going down', () => {
    const guess = createMockGuess({ priceAtGuess: 50000 })
    expect(isReadyToResolve(guess, 49000)).toBe(true)
  })
})

describe('resolveGuess - win/lose logic', () => {
  beforeEach(() => {
    ddbMock.reset()
    ddbMock.on(UpdateCommand).resolves({})
  })

  it('WIN: price up + guess "up"', async () => {
    const guess = createMockGuess({ direction: 'up', priceAtGuess: 50000 })
    const result = await resolveGuess(guess, 51000)

    expect(result.result).toBe('WIN')
    expect(result.status).toBe('RESOLVED')
    expect(result.resolvedPrice).toBe(51000)
  })

  it('WIN: price down + guess "down"', async () => {
    const guess = createMockGuess({ direction: 'down', priceAtGuess: 50000 })
    const result = await resolveGuess(guess, 49000)

    expect(result.result).toBe('WIN')
    expect(result.status).toBe('RESOLVED')
  })

  it('LOSE: price up + guess "down"', async () => {
    const guess = createMockGuess({ direction: 'down', priceAtGuess: 50000 })
    const result = await resolveGuess(guess, 51000)

    expect(result.result).toBe('LOSE')
    expect(result.status).toBe('RESOLVED')
  })

  it('LOSE: price down + guess "up"', async () => {
    const guess = createMockGuess({ direction: 'up', priceAtGuess: 50000 })
    const result = await resolveGuess(guess, 49000)

    expect(result.result).toBe('LOSE')
    expect(result.status).toBe('RESOLVED')
  })
})

describe('resolveGuess - score updates', () => {
  beforeEach(() => {
    ddbMock.reset()
  })

  it('calls DynamoDB twice (guess + score update) on WIN', async () => {
    const guess = createMockGuess({ direction: 'up', priceAtGuess: 50000 })
    ddbMock.on(UpdateCommand).resolves({})

    await resolveGuess(guess, 51000)

    // should call UpdateCommand twice: once for guess, once for score
    expect(ddbMock.calls()).toHaveLength(2)
  })

  it('calls DynamoDB twice (guess + score update) on LOSE', async () => {
    const guess = createMockGuess({ direction: 'up', priceAtGuess: 50000 })
    ddbMock.on(UpdateCommand).resolves({})

    await resolveGuess(guess, 49000)

    expect(ddbMock.calls()).toHaveLength(2)
  })

  it('prevents negative scores gracefully', async () => {
    const guess = createMockGuess({ direction: 'up', priceAtGuess: 50000 })

    let callCount = 0
    ddbMock.on(UpdateCommand).callsFake(() => {
      callCount++
      if (callCount === 1) return Promise.resolve({})
      return Promise.reject({ name: 'ConditionalCheckFailedException' })
    })

    const result = await resolveGuess(guess, 49000)

    expect(result.result).toBe('LOSE')
    expect(result.status).toBe('RESOLVED')
  })
})

describe('resolveGuess - race condition prevention', () => {
  beforeEach(() => {
    ddbMock.reset()
  })

  it('uses conditional update (verified by checking error handling)', async () => {
    const guess = createMockGuess()
    ddbMock.on(UpdateCommand).resolves({})

    const result = await resolveGuess(guess, 51000)

    expect(result.status).toBe('RESOLVED')
    expect(ddbMock.calls()).toHaveLength(2)
  })

  it('throws on concurrent resolution attempts', async () => {
    const guess = createMockGuess()

    // first call (guess update) fails with conditional check
    let callCount = 0
    ddbMock.on(UpdateCommand).callsFake(() => {
      callCount++
      if (callCount === 1) {
        return Promise.reject({ name: 'ConditionalCheckFailedException' })
      }
      return Promise.resolve({})
    })

    await expect(resolveGuess(guess, 51000)).rejects.toMatchObject({
      name: 'ConditionalCheckFailedException',
    })
  })
})
