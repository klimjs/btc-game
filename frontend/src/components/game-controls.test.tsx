import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { GameControls } from './game-controls'

vi.mock('@/hooks/use-player', () => ({
  usePlayer: vi.fn(),
}))

vi.mock('@/lib/utils', async () => {
  const actual = await vi.importActual('@/lib/utils')
  return {
    ...actual,
    createGuess: vi.fn(),
    resolveGuess: vi.fn(),
  }
})

import { usePlayer } from '@/hooks/use-player'
import { createGuess } from '@/lib/utils'

const mockUsePlayer = vi.mocked(usePlayer)
const mockCreateGuess = vi.mocked(createGuess)

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('GameControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePlayer.mockReturnValue({
      player: { playerId: 'player-1', score: 0 },
      loading: false,
      error: null,
    })
  })

  it('renders up/down buttons', () => {
    render(<GameControls />, { wrapper: createWrapper() })

    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
    expect(screen.getByLabelText('Game controls')).toBeInTheDocument()
  })

  it('disables buttons when no player', () => {
    mockUsePlayer.mockReturnValue({
      player: null,
      loading: false,
      error: null,
    })

    render(<GameControls />, { wrapper: createWrapper() })

    const buttons = screen.getAllByRole('button')
    buttons.forEach((button) => {
      expect(button).toBeDisabled()
    })
  })

  it('calls createGuess on button click', async () => {
    const user = userEvent.setup()
    const mockGuess = {
      guessId: 'guess-1',
      playerId: 'player-1',
      direction: 'up' as const,
      priceAtGuess: 50000,
      guessedAt: new Date().toISOString(),
      status: 'PENDING' as const,
    }
    mockCreateGuess.mockResolvedValue(mockGuess)

    render(<GameControls />, { wrapper: createWrapper() })

    const buttons = screen.getAllByRole('button')
    const upButton = buttons[1] // second button is "up"

    await user.click(upButton)

    expect(mockCreateGuess).toHaveBeenCalledWith('player-1', 'up')
  })

  it('shows countdown while guessing', async () => {
    const user = userEvent.setup()
    const mockGuess = {
      guessId: 'guess-1',
      playerId: 'player-1',
      direction: 'up' as const,
      priceAtGuess: 50000,
      guessedAt: new Date().toISOString(),
      status: 'PENDING' as const,
    }
    mockCreateGuess.mockResolvedValue(mockGuess)

    render(<GameControls />, { wrapper: createWrapper() })

    // initial state shows countdown
    expect(screen.getByText('0:60')).toBeInTheDocument()

    const buttons = screen.getAllByRole('button')
    await user.click(buttons[1])

    // status changes to guessing
    expect(screen.getByText('Guessing...')).toBeInTheDocument()
  })

  it('shows idle status initially', () => {
    render(<GameControls />, { wrapper: createWrapper() })

    expect(screen.getByText('Try to guess!')).toBeInTheDocument()
  })
})
