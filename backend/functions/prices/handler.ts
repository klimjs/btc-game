import type { APIGatewayProxyHandler } from 'aws-lambda'

const coinbaseApiUrl = process.env.COINBASE_API_URL || ''

export const handler: APIGatewayProxyHandler = async () => {
  try {
    const response = await fetch(coinbaseApiUrl)
    const data = await response.json()

    const price = Number(data.data.amount)

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        price,
        timestamp: new Date().toISOString(),
      }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch BTC price' }),
    }
  }
}
