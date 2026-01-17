import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '../../lib/dynamodb'
import { buildResponse } from '../../lib/utils'

const PLAYERS_TABLE = process.env.PLAYERS_TABLE || ''

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const playerId = event.pathParameters?.id

    if (!playerId) {
      return buildResponse(400, { error: 'Missing player id' })
    }

    const result = await ddb.send(
      new GetCommand({
        TableName: PLAYERS_TABLE,
        Key: { playerId },
      }),
    )

    if (!result.Item) {
      return buildResponse(404, { error: 'Player not found' })
    }

    return buildResponse(200, result.Item)
  } catch (err) {
    console.error(err)
    return buildResponse(500, { error: 'Internal Server Error' })
  }
}
