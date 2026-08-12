import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card'

interface ManagementLayoutProps {
  title: string
  description?: string
  backAction?: React.ReactNode
  primaryAction?: React.ReactNode
  list: React.ReactNode
  detail: React.ReactNode
}

function ManagementLayout({
  title,
  description,
  backAction,
  primaryAction,
  list,
  detail
}: ManagementLayoutProps): React.JSX.Element {
  return (
    <div className="mx-auto w-full max-w-7xl">
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
      <div className="mt-10 grid gap-6 md:grid-cols-[1fr_380px]">
        <div>{list}</div>
        <div>{detail}</div>
      </div>
    </div>
  )
}

export { ManagementLayout }
