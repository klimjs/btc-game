import { Badge } from '@/components/ui/badge'
import { usePlayer } from '@/hooks/use-player'
import { Spinner } from '@/components/ui/spinner'
import { Error } from '@/components/error'

export const Score = () => {
  const { player, loading, error } = usePlayer()

  if (error) return <Error errorMessage={error} />

  return (
    <>
      <div className="flex gap-2 font-medium text-2xl">
        Your score:{' '}
        {loading ? (
          <Spinner className="size-8 text-muted-foreground" />
        ) : (
          <Badge className="text-2xl h-8">{player?.score ?? 0}</Badge>
        )}
      </div>
      <div className="text-muted-foreground">
        Try to guess whether the market price of Bitcoin (BTC/USD) will be
        higher or lower after one minute.
      </div>
    </>
  )
}
