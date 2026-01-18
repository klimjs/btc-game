import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEvent } from 'aws-lambda'

const { ddbMock } = vi.hoisted(() => {
  const { mockClient } = require('aws-sdk-client-mock')
  const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
  return {
    ddbMock: mockClient(DynamoDBDocumentClient),
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
}))

import { handler } from './get'

const createEvent = (playerId?: string): APIGatewayProxyEvent =>
  ({
    body: null,
    pathParameters: playerId ? { id: playerId } : null,
    queryStringParameters: null,
  }) as APIGatewayProxyEvent

describe('get player handler', () => {
  beforeEach(() => {
    ddbMock.reset()
  })

  it('returns player successfully', async () => {
    const player = {
      playerId: 'player-1',
      score: 5,
      createdAt: '2024-01-01T00:00:00.000Z',
    }

    ddbMock.on(GetCommand).resolves({ Item: player })

    const event = createEvent('player-1')
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(200)
    const body = JSON.parse(result?.body || '{}')
    expect(body.playerId).toBe('player-1')
    expect(body.score).toBe(5)
  })

  it('returns 404 when player not found', async () => {
    ddbMock.on(GetCommand).resolves({ Item: undefined })

    const event = createEvent('nonexistent-player')
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(404)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Player not found')
  })

  it('returns 400 when playerId missing', async () => {
    const event = createEvent()
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(400)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Missing player id')
  })

  it('returns 500 on DynamoDB error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => { })
    ddbMock.on(GetCommand).rejects(new Error('DynamoDB error'))

    const event = createEvent('player-1')
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(500)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Internal Server Error')
  })
})