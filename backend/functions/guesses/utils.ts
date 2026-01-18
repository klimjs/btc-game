import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '../../lib/dynamodb'
import type { Guess } from './types'

const GUESSES_TABLE = process.env.GUESSES_TABLE || ''
const PLAYERS_TABLE = process.env.PLAYERS_TABLE || ''

export const RESOLVE_AFTER_MS = 60000

export function isReadyToResolve(guess: Guess, currentPrice: number): boolean {
  const age = Date.now() - new Date(guess.guessedAt).getTime()

  return (
    guess.status === 'PENDING' &&
    age >= RESOLVE_AFTER_MS &&
    currentPrice !== guess.priceAtGuess
  )
}

export async function resolveGuess(
  guess: Guess,
  currentPrice: number,
): Promise<Guess> {
  const isWin =
    guess.direction === 'up'
      ? currentPrice > guess.priceAtGuess
      : currentPrice < guess.priceAtGuess

  const result = isWin ? 'WIN' : 'LOSE'
  const resolvedAt = new Date().toISOString()

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
        ':now': resolvedAt,
        ':result': result,
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

  return {
    ...guess,
    status: 'RESOLVED',
    result,
    resolvedAt,
    resolvedPrice: currentPrice,
  }
}
