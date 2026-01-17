import { CardAction, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { fetchBTCPrice, formatUSD, formatDateTime } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Spinner } from './ui/spinner'

const BTC_REFRESH_INTERVAL = 15000

export const BTCPrice = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['price'],
    queryFn: fetchBTCPrice,
    refetchInterval: BTC_REFRESH_INTERVAL,
  })

  return (
    <>
      <CardDescription>BTC price</CardDescription>
      <CardTitle className="text-xl">
        {isLoading ? (
          <Skeleton className="h-7 w-32" />
        ) : (
          formatUSD(data?.price ?? 0)
        )}
      </CardTitle>
      <CardAction>
        <Badge variant="secondary">
          {isLoading ? (
            <>
              <Spinner /> Syncing
            </>
          ) : (
            <>
              <Clock />
              {data && formatDateTime(data.timestamp)}
            </>
          )}
        </Badge>
      </CardAction>
    </>
  )
}
