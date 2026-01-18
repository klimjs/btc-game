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

export const getCoinbasePrice = async () => {
  const response = await fetch(coinbaseApiUrl)
  const data = await response.json()

  return Number(data.data.amount)
}
