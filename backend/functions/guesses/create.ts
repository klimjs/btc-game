import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { buildResponse, getCoinbasePrice } from '../../lib/utils'
import { ddb } from '../../lib/dynamodb'
import { CreateGuessBody } from './types'

const GUESSES_TABLE = process.env.GUESSES_TABLE || ''

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return buildResponse(400, { error: 'Request body is required' })
    }

    const body = JSON.parse(event.body) as CreateGuessBody
    const { playerId, direction } = body

    const existing = await ddb.send(
      new GetCommand({
        TableName: GUESSES_TABLE,
        Key: { playerId },
      }),
    )

    if (existing.Item?.status === 'PENDING') {
      return buildResponse(409, { error: 'Active guess already exists' })
    }

    const price = await getCoinbasePrice()

    const guess = {
      playerId,
      guessId: randomUUID(),
      direction,
      priceAtGuess: price,
      guessedAt: new Date().toISOString(),
      status: 'PENDING',
    }

    await ddb.send(
      new PutCommand({
        TableName: GUESSES_TABLE,
        Item: guess,
      }),
    )

    return buildResponse(201, guess)
  } catch (err) {
    console.error(err)
    return buildResponse(500, { error: 'Internal server error' })
  }
}
