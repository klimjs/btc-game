export type Direction = 'up' | 'down'

export type CreateGuessBody = {
  playerId: string
  direction: Direction
}

export type Guess = {
  playerId: string
  guessId: string
  direction: Direction
  priceAtGuess: number
  guessedAt: string
  status: 'PENDING' | 'RESOLVED'
  result?: 'WIN' | 'LOSE'
  resolvedAt?: string
  resolvedPrice?: number
}
