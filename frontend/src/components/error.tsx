import { Alert, AlertTitle } from '@/components/ui/alert'
import { AlertCircleIcon } from 'lucide-react'

export const Error = ({ errorMessage }: { errorMessage: string }) => {
  return (
    <Alert className="border-none" variant="destructive">
      <AlertCircleIcon />
      <AlertTitle>{errorMessage}</AlertTitle>
    </Alert>
  )
}
