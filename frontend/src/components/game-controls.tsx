import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { TrendingDown, TrendingUp } from 'lucide-react'

export const GameControls = () => {
  return (
    <div className="flex justify-center py-10">
      <ButtonGroup aria-label="Game controls">
        <Button variant="outline" size="icon-lg">
          <TrendingDown />
        </Button>
        <Button variant="outline" size="icon-lg">
          <TrendingUp />
        </Button>
      </ButtonGroup>
    </div>
  )
}
