import type { APIGatewayProxyHandler } from 'aws-lambda'
import { buildResponse } from '../../lib/utils'

const coinbaseApiUrl = process.env.COINBASE_API_URL || ''

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const response = await fetch(coinbaseApiUrl)
    const data = await response.json()

    const price = Number(data.data.amount)

    return buildResponse(200, {
      price,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error(err)
    return buildResponse(500, { error: 'Failed to fetch BTC price' })
  }
}
