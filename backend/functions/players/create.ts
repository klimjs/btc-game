import type { APIGatewayProxyHandler } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'crypto'
import { ddb } from '../../lib/dynamodb'
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
      })
    )

    return {
      statusCode: 201,
      body: JSON.stringify(player),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: 'Internal Server Error' }
  }
}
