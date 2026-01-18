import { QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { getCoinbasePrice } from '../../lib/utils'
import { ddb } from '../../lib/dynamodb'
import type { Guess } from './types'

const GUESSES_TABLE = process.env.GUESSES_TABLE || ''
const PLAYERS_TABLE = process.env.PLAYERS_TABLE || ''

const RESOLVE_AFTER_MS = 60000

export const handler = async () => {
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

  const ready = guesses.filter((g) => {
    const age = Date.now() - new Date(g.guessedAt).getTime()
    return age >= RESOLVE_AFTER_MS && currentPrice !== g.priceAtGuess
  })

  for (const guess of ready) {
    const isWin =
      guess.direction === 'up'
        ? currentPrice > guess.priceAtGuess
        : currentPrice < guess.priceAtGuess

    await ddb.send(
      new UpdateCommand({
        TableName: GUESSES_TABLE,
        Key: { guessId: guess.guessId },
        UpdateExpression:
          'SET #s = :resolved, resolvedAt = :now, #r = :result, resolvedPrice = :price',
        ConditionExpression: '#s = :pending',
        ExpressionAttributeNames: { '#s': 'status', '#r': 'result' },
        ExpressionAttributeValues: {
          ':pending': 'PENDING',
          ':resolved': 'RESOLVED',
          ':now': new Date().toISOString(),
          ':result': isWin ? 'WIN' : 'LOSE',
          ':price': currentPrice,
        },
      }),
    )

    await ddb
      .send(
        new UpdateCommand({
          TableName: PLAYERS_TABLE,
          Key: { playerId: guess.playerId },
          UpdateExpression: 'SET score = if_not_exists(score, :zero) + :delta',
          ConditionExpression: isWin
            ? 'attribute_exists(playerId)'
            : 'score > :zero',
          ExpressionAttributeValues: { ':delta': isWin ? 1 : -1, ':zero': 0 },
        }),
      )
      .catch((err) => {
        if (err.name !== 'ConditionalCheckFailedException') throw err
      })
  }

  return { resolved: true }
}
