import { beforeEach } from 'vitest'

beforeEach(() => {
  process.env.GUESSES_TABLE = 'test-guesses-table'
  process.env.PLAYERS_TABLE = 'test-players-table'
})
