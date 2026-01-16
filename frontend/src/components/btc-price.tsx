import { CardAction, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp } from 'lucide-react'

export const BTCPrice = () => {
  return (
    <>
      <CardDescription>BTC price in USD</CardDescription>
      <CardTitle className="text-xl">$1,250.00</CardTitle>
      <CardAction>
        <Badge variant="default">
          <TrendingUp />
          +12.5%
        </Badge>
      </CardAction>
    </>
  )
}
