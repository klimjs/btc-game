import { Badge } from '@/components/ui/badge'

export const Score = () => {
  return (
    <>
      <div className="flex gap-2 font-medium text-2xl">
        Your score:{' '}
        <Badge className="text-2xl h-8" variant="secondary">
          0
        </Badge>
      </div>
      <div className="text-muted-foreground">
        Try to guess whether the market price of Bitcoin (BTC/USD) will be
        higher or lower after one minute.
      </div>
    </>
  )
}
