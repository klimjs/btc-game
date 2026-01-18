import { z } from 'zod'

export const directionSchema = z.enum(['up', 'down'])
export type Direction = z.infer<typeof directionSchema>

export const createGuessBodySchema = z.object({
  playerId: z.string().uuid(),
  direction: directionSchema,
})
export type CreateGuessBody = z.infer<typeof createGuessBodySchema>

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
