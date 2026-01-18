import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { buildResponse, getCoinbasePrice } from '../../lib/utils'
import { ddb } from '../../lib/dynamodb'
import { createGuessBodySchema } from './types'

const GUESSES_TABLE = process.env.GUESSES_TABLE || ''

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    if (!event.body) {
      return buildResponse(400, { error: 'Request body is required' })
    }

    const parsed = createGuessBodySchema.safeParse(JSON.parse(event.body))

    if (!parsed.success) {
      return buildResponse(400, {
        error: 'Invalid request body',
        details: parsed.error.flatten().fieldErrors,
      })
    }

    const { playerId, direction } = parsed.data

    const price = await getCoinbasePrice()

    // check for existing guess right before creating (minimizes race condition window)
    const { Items = [] } = await ddb.send(
      new QueryCommand({
        TableName: GUESSES_TABLE,
        IndexName: 'player-index',
        KeyConditionExpression: 'playerId = :pid',
        FilterExpression: '#s = :pending',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':pid': playerId, ':pending': 'PENDING' },
      }),
    )

    if (Items.length > 0) {
      return buildResponse(409, { error: 'Active guess already exists' })
    }

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
