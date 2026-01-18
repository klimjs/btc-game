import { describe, it, expect, beforeEach, vi } from 'vitest'
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import type { APIGatewayProxyEvent } from 'aws-lambda'

const { ddbMock, mockGetCoinbasePrice } = vi.hoisted(() => {
  const { mockClient } = require('aws-sdk-client-mock')
  const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
  return {
    ddbMock: mockClient(DynamoDBDocumentClient),
    mockGetCoinbasePrice: vi.fn().mockResolvedValue(50000),
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

import { handler } from './create'

const createEvent = (body?: object): APIGatewayProxyEvent =>
  ({
    body: body ? JSON.stringify(body) : null,
    pathParameters: null,
    queryStringParameters: null,
  }) as APIGatewayProxyEvent

describe('create guess handler', () => {
  beforeEach(() => {
    ddbMock.reset()
    mockGetCoinbasePrice.mockResolvedValue(50000)
  })

  it('creates guess successfully with valid input', async () => {
    ddbMock.on(QueryCommand).resolves({ Items: [] })
    ddbMock.on(PutCommand).resolves({})

    const event = createEvent({ playerId: 'player-1', direction: 'up' })
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(201)
    const body = JSON.parse(result?.body || '{}')
    expect(body.playerId).toBe('player-1')
    expect(body.direction).toBe('up')
    expect(body.status).toBe('PENDING')
    expect(body.priceAtGuess).toBe(50000)
    expect(body.guessId).toBeDefined()
  })

  it('returns 409 when active guess already exists', async () => {
    ddbMock.on(QueryCommand).resolves({
      Items: [{ guessId: 'existing-guess', status: 'PENDING' }],
    })

    const event = createEvent({ playerId: 'player-1', direction: 'up' })
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(409)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Active guess already exists')
  })

  it('returns 400 when request body is missing', async () => {
    const event = createEvent()
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(400)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Request body is required')
  })

  it('returns 500 on DynamoDB error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => { })
    ddbMock.on(QueryCommand).rejects(new Error('DynamoDB error'))

    const event = createEvent({ playerId: 'player-1', direction: 'up' })
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(500)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Internal server error')
  })

  it('captures price at guess time correctly', async () => {
    mockGetCoinbasePrice.mockResolvedValueOnce(55000)

    ddbMock.on(QueryCommand).resolves({ Items: [] })
    ddbMock.on(PutCommand).resolves({})

    const event = createEvent({ playerId: 'player-1', direction: 'down' })
    const result = await handler(event, {} as any, () => { })

    expect(result?.statusCode).toBe(201)
    const body = JSON.parse(result?.body || '{}')
    expect(body.priceAtGuess).toBe(55000)
  })
})
