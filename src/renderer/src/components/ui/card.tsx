import { cn } from '@/lib/utils'

function Card({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return (
    <div
      className={cn('bg-card text-card-foreground rounded-lg border shadow-sm', className)}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
}

type CardTitleProps = React.ComponentProps<'h2'> & {
  // Überschriftenebene der Aufrufstelle. Default h2, weil die Seiten-Card den
  // h1-Rang trägt; Screenreader brauchen echte Überschriften statt div.
  as?: 'h1' | 'h2' | 'h3'
}

function CardTitle({ className, as: Tag = 'h2', ...props }: CardTitleProps): React.JSX.Element {
  return (
    <Tag
      className={cn('text-base font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return <div className={cn('text-muted-foreground text-sm', className)} {...props} />
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element {
  return <div className={cn('flex items-center p-6 pt-0', className)} {...props} />
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
