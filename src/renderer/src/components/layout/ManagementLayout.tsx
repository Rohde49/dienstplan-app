import { ManagementHeader } from './ManagementHeader'

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
    <main className="mx-auto w-full max-w-7xl">
      <ManagementHeader
        title={title}
        description={description}
        backAction={backAction}
        primaryAction={primaryAction}
      />
      <div className="mt-6 grid gap-5 md:grid-cols-[1fr_380px]">
        <div>{list}</div>
        <div>{detail}</div>
      </div>
    </main>
  )
}

export { ManagementLayout }
