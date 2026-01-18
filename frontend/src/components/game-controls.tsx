import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
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
import { createGuess } from '@/lib/utils'
import type { Direction, Status, StatusConfig } from '@/types/app'
import { Spinner } from '@/components/ui/spinner'

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
  const { player } = usePlayer()
  const [status, setStatus] = useState<Status>('idle')

  const {
    mutate: createGuessMutation,
    isPending: isCreatingGuess,
    error: createGuessError,
  } = useMutation({
    mutationFn: (direction: Direction) =>
      createGuess(player?.playerId ?? '', direction),
    onMutate: () => setStatus('guessing'),
    onError: () => setStatus('error'),
  })

  const guessingDisabled = !player || isCreatingGuess || status === 'guessing'

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
          <ItemDescription>0:60</ItemDescription>
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
