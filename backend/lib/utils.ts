const coinbaseApiUrl = process.env.COINBASE_API_URL || ''

export const buildResponse = (
  statusCode: number,
  body: Record<string, unknown>,
) => {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
}

export const getCoinbasePrice = async (): Promise<number> => {
  if (!coinbaseApiUrl) {
    throw new Error('COINBASE_API_URL is not configured')
  }

  const response = await fetch(coinbaseApiUrl)

  if (!response.ok) {
    throw new Error(
      `Coinbase API error: ${response.status} ${response.statusText}`,
    )
  }

  const data = await response.json()

  const amount = Number(data?.data?.amount)

  if (isNaN(amount)) {
    throw new Error('Invalid price data from Coinbase API')
  }

  return amount
}
