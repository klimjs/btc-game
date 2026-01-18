import { Card, CardHeader, CardFooter } from '@/components/ui/card'
import { Score } from '@/components/score'
import { GameControls } from '@/components/game-controls'
import { BTCPrice } from '@/components/btc-price'

// TODO: dark mode

export const GameBoard = () => {
  return (
    <div className="flex flex-col gap-1 mx-auto max-w-lg min-w-sm p-4">
      <div className="text-muted-foreground px-1.5 py-2 text-xs font-medium">
        BTC Guess Game
      </div>
      <div className="border border-dashed p-6">
        <Card>
          <CardHeader>
            <BTCPrice />
          </CardHeader>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <Score />
          </CardFooter>
        </Card>

        <GameControls />
      </div>
    </div>
  )
}
