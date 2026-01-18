import { describe, it, expect, beforeEach, vi } from 'vitest'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
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

import { handler } from './create'

describe('create player handler', () => {
  beforeEach(() => {
    ddbMock.reset()
  })

  it('creates player successfully', async () => {
    ddbMock.on(PutCommand).resolves({})

    const result = await handler(
      {} as APIGatewayProxyEvent,
      {} as any,
      () => {},
    )

    expect(result?.statusCode).toBe(201)
    const body = JSON.parse(result?.body || '{}')
    expect(body.playerId).toBeDefined()
    expect(body.score).toBe(0)
    expect(body.createdAt).toBeDefined()
  })

  it('returns 500 on DynamoDB error', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    ddbMock.on(PutCommand).rejects(new Error('DynamoDB error'))

    const result = await handler(
      {} as APIGatewayProxyEvent,
      {} as any,
      () => {},
    )

    expect(result?.statusCode).toBe(500)
    const body = JSON.parse(result?.body || '{}')
    expect(body.error).toBe('Internal Server Error')
  })
})
