import { ButtonGroup } from '@/components/ui/button-group'
import { Button } from '@/components/ui/button'
import { Dice2, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from './ui/item'

export const GameControls = () => {
  return (
    <div className="flex flex-col items-center justify-center py-10 gap-10">
      <Item variant="muted">
        <ItemMedia variant="icon">
          <Dice2 />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Try to guess!</ItemTitle>
        </ItemContent>
        <ItemContent>
          <ItemDescription>0:60</ItemDescription>
        </ItemContent>
      </Item>

      <ButtonGroup aria-label="Game controls">
        <Button variant="outline" className="size-12">
          <TrendingDown />
        </Button>
        <Button variant="outline" className="size-12">
          <TrendingUp />
        </Button>
      </ButtonGroup>
    </div>
  )
}
