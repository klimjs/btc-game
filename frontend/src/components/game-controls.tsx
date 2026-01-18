import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import {
  AlertCircle,
  PartyPopper,
  Dice2,
  TrendingDown,
  TrendingUp,
  Frown,
} from 'lucide-react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import { usePlayer } from '@/hooks/use-player'
import { useCountdown } from '@/hooks/use-countdown'
import { createGuess, resolveGuess, formatCountdown } from '@/lib/utils'
import type { Direction, Guess, Status, StatusConfig } from '@/types/app'
import { Spinner } from '@/components/ui/spinner'

const COUNTDOWN_SECONDS = 60
const POLLING_INTERVAL = 5000

const statusConfig: Record<Status, StatusConfig> = {
  idle: { icon: <Dice2 />, title: 'Try to guess!' },
  guessing: { icon: <Spinner />, title: 'Guessing...' },
  error: {
    icon: <AlertCircle />,
    title: 'Something went wrong. Please try again.',
    className: 'text-red-500',
  },
  win: {
    icon: <PartyPopper />,
    title: 'Yay! You won.',
    className: 'text-green-600',
  },
  lose: {
    icon: <Frown />,
    title: 'Oh no! You lost. Try again.',
    className: 'text-blue-600',
  },
}

export const GameControls = () => {
  const queryClient = useQueryClient()
  const { player } = usePlayer()
  const [status, setStatus] = useState<Status>('idle')
  const [currentGuess, setCurrentGuess] = useState<Guess | null>(null)
  const { countdown, isDone, start, reset } = useCountdown(COUNTDOWN_SECONDS)

  const {
    mutate: createGuessMutation,
    isPending: isCreatingGuess,
    error: createGuessError,
  } = useMutation({
    mutationFn: (direction: Direction) =>
      createGuess(player?.playerId ?? '', direction),
    onMutate: () => {
      setStatus('guessing')
      start()
    },
    onSuccess: (guess) => {
      setCurrentGuess(guess)
    },
    onError: () => setStatus('error'),
  })

  // TODO: ? move to a separate component together with Item block
  const { mutate: resolveGuessMutation } = useMutation({
    mutationFn: (guessId: string) => resolveGuess(guessId),
    onSuccess: (data) => {
      if (data.status === 'RESOLVED') {
        setStatus(data.result === 'WIN' ? 'win' : 'lose')
        setCurrentGuess(null)
        reset()
        queryClient.invalidateQueries({ queryKey: ['player'] })
      }
    },
  })

  useEffect(() => {
    if (!currentGuess || !isDone) return

    resolveGuessMutation(currentGuess.guessId)

    // guess resolution polling in case of the same price
    const interval = setInterval(() => {
      resolveGuessMutation(currentGuess.guessId)
    }, POLLING_INTERVAL)

    return () => clearInterval(interval)
  }, [currentGuess, isDone, resolveGuessMutation])

  const guessingDisabled = !player || isCreatingGuess || status === 'guessing'

  // TODO: show the guess while it is resolving

  // TODO: Kbd shortcuts for up/down in tooltips

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-10">
      <Item variant="muted">
        <ItemMedia variant="icon" className={statusConfig[status].className}>
          {statusConfig[status].icon}
        </ItemMedia>
        <ItemContent>
          <ItemTitle className={statusConfig[status].className}>
            {createGuessError
              ? createGuessError.message
              : statusConfig[status].title}
          </ItemTitle>
        </ItemContent>
        <ItemContent>
          <ItemDescription>{formatCountdown(countdown)}</ItemDescription>
        </ItemContent>
      </Item>

      <ButtonGroup aria-label="Game controls">
        <Button
          variant="outline"
          className="size-12"
          disabled={guessingDisabled}
          onClick={() => createGuessMutation('down')}
        >
          <TrendingDown />
        </Button>
        <Button
          variant="outline"
          className="size-12"
          disabled={guessingDisabled}
          onClick={() => createGuessMutation('up')}
        >
          <TrendingUp />
        </Button>
      </ButtonGroup>
    </div>
  )
}
