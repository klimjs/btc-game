import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '../../lib/dynamodb'
import type { APIGatewayProxyHandler } from 'aws-lambda'
import { buildResponse, getCoinbasePrice } from '../../lib/utils'
import type { Guess } from './types'
import { isReadyToResolve, resolveGuess } from './utils'

const GUESSES_TABLE = process.env.GUESSES_TABLE || ''

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const guessId = event.pathParameters?.id

    if (!guessId) {
      return buildResponse(400, { error: 'Missing guessId' })
    }

    const { Item } = await ddb.send(
      new GetCommand({
        TableName: GUESSES_TABLE,
        Key: { guessId },
      }),
    )

    if (!Item) {
      return buildResponse(404, { error: 'Guess not found' })
    }

    const guess = Item as Guess

    if (guess.status === 'PENDING') {
      const currentPrice = await getCoinbasePrice()
      if (isReadyToResolve(guess, currentPrice)) {
        const resolved = await resolveGuess(guess, currentPrice)
        return buildResponse(200, resolved)
      }
    }

    return buildResponse(200, guess)
  } catch (err) {
    console.error(err)
    return buildResponse(500, { error: 'Internal server error' })
  }
}
