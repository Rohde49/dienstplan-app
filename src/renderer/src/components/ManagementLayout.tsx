interface ManagementLayoutProps {
  title: string
  description?: string
  primaryAction?: React.ReactNode
  list: React.ReactNode
  detail: React.ReactNode
}

function ManagementLayout({
  title,
  description,
  primaryAction,
  list,
  detail
}: ManagementLayoutProps): React.JSX.Element {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        {primaryAction}
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_380px]">
        <div>{list}</div>
        <div>{detail}</div>
      </div>
    </div>
  )
}

export { ManagementLayout }
