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
      <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-8">
        <div className="justify-self-start">{backAction}</div>
        <div className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">{title}</CardTitle>
          {description && (
            <CardDescription className="mt-1 text-base leading-relaxed">
              {description}
            </CardDescription>
          )}
        </div>
        <div className="justify-self-end">{primaryAction}</div>
      </CardContent>
    </Card>
  )
}

export { ManagementHeader }
