import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardList, Users, type LucideIcon } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface NavCard {
  to: string
  title: string
  description: string
  icon: LucideIcon
}

const navCards: NavCard[] = [
  {
    to: '/team',
    title: 'Team-Verwaltung',
    description: 'Mitarbeiter anlegen und verwalten',
    icon: Users
  },
  {
    to: '/eintraege',
    title: 'Eintrag-Verwaltung',
    description: 'Dienstarten und Einträge definieren',
    icon: ClipboardList
  },
  {
    to: '/dienstplan',
    title: 'Dienstplan erstellen',
    description: 'Dienstplan für Monat/Jahr erstellen',
    icon: CalendarDays
  }
]

function StartPage(): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-8 lg:p-10">
      <div className="mx-auto w-full max-w-5xl">
        <Card className="mb-12">
          <CardHeader className="items-center text-center">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Planung der Dienstpläne
            </CardTitle>
            <CardDescription className="text-base leading-relaxed">
              Team, Einträge und Dienstpläne an einem Ort verwalten
            </CardDescription>
          </CardHeader>
        </Card>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {navCards.map((navCard) => (
            <Link
              key={navCard.to}
              to={navCard.to}
              className="block rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full bg-muted/60">
                <CardHeader>
                  <div className="mb-2 w-fit rounded-md bg-primary/10 p-2 text-primary">
                    <navCard.icon className="size-5" />
                  </div>
                  <CardTitle className="text-lg tracking-tight">{navCard.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {navCard.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default StartPage
