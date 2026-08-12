import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PlanungsGrid } from '@/components/layout/PlanungsGrid'
import { getKalendertageFuerMonat } from '@/lib/kalendertage'
import type { TeamMember } from '../../../shared/types'

const MONATE = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember'
]

const AKTUELLES_JAHR = new Date().getFullYear()
const JAHRE = [-2, -1, 0, 1, 2].map((offset) => AKTUELLES_JAHR + offset)

const KOMPAKT_SELECT_KLASSE =
  'h-8 rounded-md border-none bg-card px-3 shadow-sm focus-visible:ring-1'

function PlanPage(): React.JSX.Element {
  const heute = new Date()
  const [monat, setMonat] = useState(heute.getMonth() + 1)
  const [jahr, setJahr] = useState(heute.getFullYear())
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const loadTeamMembers = useCallback(() => {
    window.api.team.list().then(setTeamMembers)
  }, [])

  useEffect(() => {
    loadTeamMembers()
  }, [loadTeamMembers])

  const tage = useMemo(() => getKalendertageFuerMonat(jahr, monat), [jahr, monat])

  return (
    <div className="flex h-screen flex-col px-10 py-8">
      <div className="flex w-full flex-1 flex-col gap-6 min-h-0">
        <Card>
          <CardContent className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 p-5">
            <div className="flex items-center justify-end gap-4">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="border-primary/40 text-primary hover:border-primary hover:bg-primary/10"
              >
                <Link to="/">
                  <Home className="size-4" />
                  Startseite
                </Link>
              </Button>

              <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
                <Select value={String(monat)} onValueChange={(v) => setMonat(Number(v))}>
                  <SelectTrigger aria-label="Monat" className={`${KOMPAKT_SELECT_KLASSE} w-32`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MONATE.map((name, index) => (
                      <SelectItem key={name} value={String(index + 1)}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={String(jahr)} onValueChange={(v) => setJahr(Number(v))}>
                  <SelectTrigger aria-label="Jahr" className={`${KOMPAKT_SELECT_KLASSE} w-24`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JAHRE.map((j) => (
                      <SelectItem key={j} value={String(j)}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col items-center text-center">
              <CardTitle className="text-2xl font-bold tracking-tight">
                Dienstplan erstellen
              </CardTitle>
              <CardDescription className="text-sm">
                Dienstplan für einen Monat planen
              </CardDescription>
            </div>

            <div className="flex items-center justify-start gap-4">
              <div
                role="group"
                aria-label="Planform"
                className="bg-muted inline-flex items-center gap-1 rounded-md p-1"
              >
                <button
                  type="button"
                  disabled
                  aria-pressed="true"
                  className="bg-card text-card-foreground cursor-not-allowed rounded-sm px-3 py-1 text-sm font-medium shadow-sm"
                >
                  Planung
                </button>
                <button
                  type="button"
                  disabled
                  aria-pressed="false"
                  className="text-muted-foreground cursor-not-allowed rounded-sm px-3 py-1 text-sm font-medium"
                >
                  Druckvorschau
                </button>
              </div>

              <Button disabled size="sm">
                Auswertung
              </Button>
            </div>
          </CardContent>
        </Card>

        <PlanungsGrid members={teamMembers} tage={tage} />
      </div>
    </div>
  )
}

export default PlanPage
