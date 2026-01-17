import type { APIGatewayProxyHandler } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { ddb } from '../../lib/dynamodb'
import { buildResponse } from '../../lib/utils'
import { Player } from './types'

const PLAYERS_TABLE = process.env.PLAYERS_TABLE || ''

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const player: Player = {
      playerId: randomUUID(),
      score: 0,
      createdAt: new Date().toISOString(),
    }

    await ddb.send(
      new PutCommand({
        TableName: PLAYERS_TABLE,
        Item: player,
      }),
    )

    return buildResponse(201, player)
  } catch (err) {
    console.error(err)
    return buildResponse(500, { error: 'Internal Server Error' })
  }
}
