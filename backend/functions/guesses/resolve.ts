import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { getCoinbasePrice } from '../../lib/utils'
import { ddb } from '../../lib/dynamodb'
import type { Guess } from './types'
import { isReadyToResolve, resolveGuess } from './utils'

const GUESSES_TABLE = process.env.GUESSES_TABLE || ''

export const handler = async () => {
  // fetch current Coinbase price and all PENDING guesses in parallel using the status GSI
  const [currentPrice, { Items = [] }] = await Promise.all([
    getCoinbasePrice(),
    ddb.send(
      new QueryCommand({
        TableName: GUESSES_TABLE,
        IndexName: 'status-index',
        KeyConditionExpression: '#s = :pending',
        ExpressionAttributeNames: { '#s': 'status' },
        ExpressionAttributeValues: { ':pending': 'PENDING' },
      }),
    ),
  ])

  const guesses = Items as Guess[]
  const ready = guesses.filter((g) => isReadyToResolve(g, currentPrice))

  for (const guess of ready) {
    await resolveGuess(guess, currentPrice)
  }

  return { resolved: true }
}
