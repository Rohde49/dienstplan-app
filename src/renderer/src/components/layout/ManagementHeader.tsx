import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

interface ManagementHeaderProps {
  title: string
  description?: string
  backAction?: React.ReactNode
  primaryAction?: React.ReactNode
}

function ManagementHeader({
  title,
  description,
  backAction,
  primaryAction
}: ManagementHeaderProps): React.JSX.Element {
  return (
    <Card>
      <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5">
        <div className="justify-self-start">{backAction}</div>
        <div className="text-center">
          <CardTitle as="h1" className="text-xl font-semibold tracking-tight">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-0.5 text-sm">{description}</CardDescription>
          )}
        </div>
        <div className="justify-self-end">{primaryAction}</div>
      </CardContent>
    </Card>
  )
}

export { ManagementHeader }
