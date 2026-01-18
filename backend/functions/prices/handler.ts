import type { APIGatewayProxyHandler } from 'aws-lambda'
import { buildResponse, getCoinbasePrice } from '../../lib/utils'

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const price = await getCoinbasePrice()

    return buildResponse(200, {
      price,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error(err)
    return buildResponse(500, { error: 'Failed to fetch BTC price' })
  }
}
