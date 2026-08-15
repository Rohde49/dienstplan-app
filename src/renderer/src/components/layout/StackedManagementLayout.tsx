import { ManagementHeader } from './ManagementHeader'

interface StackedManagementLayoutProps {
  title: string
  description?: string
  backAction?: React.ReactNode
  primaryAction?: React.ReactNode
  list: React.ReactNode
  detail: React.ReactNode
  detailPosition?: 'top' | 'bottom'
}

function StackedManagementLayout({
  title,
  description,
  backAction,
  primaryAction,
  list,
  detail,
  detailPosition = 'bottom'
}: StackedManagementLayoutProps): React.JSX.Element {
  return (
    <main className="mx-auto w-full max-w-7xl">
      <ManagementHeader
        title={title}
        description={description}
        backAction={backAction}
        primaryAction={primaryAction}
      />
      <div className="mt-6 flex flex-col gap-5">
        {detailPosition === 'top' && <div>{detail}</div>}
        <div>{list}</div>
        {detailPosition === 'bottom' && <div>{detail}</div>}
      </div>
    </main>
  )
}

export { StackedManagementLayout }
