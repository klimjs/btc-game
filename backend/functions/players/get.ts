import type { APIGatewayProxyHandler } from 'aws-lambda'
import { GetCommand } from '@aws-sdk/lib-dynamodb'
import { ddb } from '../../lib/dynamodb'

const PLAYERS_TABLE = process.env.PLAYERS_TABLE || ''

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const playerId = event.pathParameters?.id

    if (!playerId) {
      return { statusCode: 400, body: 'Missing player id' }
    }

    const result = await ddb.send(
      new GetCommand({
        TableName: PLAYERS_TABLE,
        Key: { playerId },
      })
    )

    if (!result.Item) {
      return { statusCode: 404, body: 'Player not found' }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    }
  } catch (err) {
    console.error(err)
    return { statusCode: 500, body: 'Internal Server Error' }
  }
}
