import { useCallback, useEffect, useMemo, useState } from 'react'
import { Home, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { PlanungsGrid } from '@/components/layout/PlanungsGrid'
import { DienstplanLadenDialog } from '@/components/DienstplanLadenDialog'
import { getKalendertageFuerMonat } from '../../../shared/kalendertage'
import type { Dienstplan, Dienstplantag, TeamMember } from '../../../shared/types'

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
  const navigate = useNavigate()
  const heute = new Date()
  const [monat, setMonat] = useState(heute.getMonth() + 1)
  const [jahr, setJahr] = useState(heute.getFullYear())
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])

  const [aktiverDienstplan, setAktiverDienstplan] = useState<Dienstplan | null>(null)
  const [dienstplantage, setDienstplantage] = useState<Dienstplantag[]>([])
  const [titelEntwurf, setTitelEntwurf] = useState('')
  const [letzterGespeicherterTitel, setLetzterGespeicherterTitel] = useState('')
  const [titelWirdBearbeitet, setTitelWirdBearbeitet] = useState(false)
  const [ladenDialogOffen, setLadenDialogOffen] = useState(false)
  const [ausstehendeAktion, setAusstehendeAktion] = useState<
    'laden' | 'neuAnlegen' | 'startseite' | null
  >(null)

  const loadTeamMembers = useCallback(() => {
    window.api.team.list().then(setTeamMembers)
  }, [])

  useEffect(() => {
    loadTeamMembers()
  }, [loadTeamMembers])

  const tage = useMemo(() => getKalendertageFuerMonat(jahr, monat), [jahr, monat])

  const gibtUngespeicherteAenderung =
    aktiverDienstplan !== null && titelEntwurf !== letzterGespeicherterTitel

  function handleErstellen(): void {
    window.api.dienstplan
      .create({ monat, jahr, titel: titelEntwurf })
      .then(({ dienstplan, tage: neueTage }) => {
        setAktiverDienstplan(dienstplan)
        setDienstplantage(neueTage)
        setTitelEntwurf(dienstplan.titel)
        setLetzterGespeicherterTitel(dienstplan.titel)
        setTitelWirdBearbeitet(false)
      })
  }

  function fuehreNeuAnlegenAus(): void {
    setAktiverDienstplan(null)
    setDienstplantage([])
    setTitelEntwurf('')
    setLetzterGespeicherterTitel('')
    setTitelWirdBearbeitet(false)
  }

  function handleNeuAnlegen(): void {
    if (gibtUngespeicherteAenderung) {
      setAusstehendeAktion('neuAnlegen')
      return
    }
    fuehreNeuAnlegenAus()
  }

  function handleSpeichern(): void {
    if (aktiverDienstplan === null) return

    window.api.dienstplan.updateTitel(aktiverDienstplan.id, titelEntwurf).then((aktualisiert) => {
      setAktiverDienstplan(aktualisiert)
      setLetzterGespeicherterTitel(aktualisiert.titel)
      setTitelWirdBearbeitet(false)
    })
  }

  function handleLaden(): void {
    if (gibtUngespeicherteAenderung) {
      setAusstehendeAktion('laden')
      return
    }
    setLadenDialogOffen(true)
  }

  function handleStartseite(): void {
    if (gibtUngespeicherteAenderung) {
      setAusstehendeAktion('startseite')
      return
    }
    navigate('/')
  }

  function handleWarnungFortfahren(): void {
    if (ausstehendeAktion === 'laden') {
      setLadenDialogOffen(true)
    } else if (ausstehendeAktion === 'neuAnlegen') {
      fuehreNeuAnlegenAus()
    } else if (ausstehendeAktion === 'startseite') {
      navigate('/')
    }
    setAusstehendeAktion(null)
  }

  function handleDienstplanAuswaehlen(id: number): void {
    window.api.dienstplan.get(id).then((geladen) => {
      if (geladen === null) return

      setAktiverDienstplan(geladen.dienstplan)
      setDienstplantage(geladen.tage)
      setMonat(geladen.dienstplan.monat)
      setJahr(geladen.dienstplan.jahr)
      setTitelEntwurf(geladen.dienstplan.titel)
      setLetzterGespeicherterTitel(geladen.dienstplan.titel)
      setTitelWirdBearbeitet(false)
      setLadenDialogOffen(false)
    })
  }

  return (
    <div className="flex h-screen flex-col px-10 py-8">
      <div className="flex w-full flex-1 flex-col gap-6 min-h-0">
        <Card>
          <CardContent className="flex flex-col gap-4 p-5">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="flex items-center justify-end gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartseite}
                  className="border-primary/40 text-primary hover:border-primary hover:bg-primary/10"
                >
                  <Home className="size-4" />
                  Startseite
                </Button>

                <div className="bg-muted flex items-center gap-1 rounded-lg p-1">
                  <Select
                    value={String(monat)}
                    onValueChange={(v) => setMonat(Number(v))}
                    disabled={aktiverDienstplan !== null}
                  >
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
                  <Select
                    value={String(jahr)}
                    onValueChange={(v) => setJahr(Number(v))}
                    disabled={aktiverDienstplan !== null}
                  >
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
            </div>

            <div className="flex items-center justify-center gap-3 border-t pt-4">
              {aktiverDienstplan === null || titelWirdBearbeitet ? (
                <Input
                  autoFocus={titelWirdBearbeitet}
                  placeholder="Titel (optional)"
                  value={titelEntwurf}
                  onChange={(e) => setTitelEntwurf(e.target.value)}
                  className="h-8 w-64"
                />
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium">{titelEntwurf || 'Ohne Titel'}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Titel bearbeiten"
                    onClick={() => setTitelWirdBearbeitet(true)}
                  >
                    <Pencil className="size-3.5" />
                  </Button>
                </div>
              )}
              {gibtUngespeicherteAenderung && (
                <span className="text-muted-foreground text-xs">· ungespeicherte Änderung</span>
              )}

              <Button
                size="sm"
                onClick={aktiverDienstplan === null ? handleErstellen : handleNeuAnlegen}
              >
                {aktiverDienstplan === null ? 'Erstellen' : 'Neu anlegen'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={aktiverDienstplan === null}
                onClick={handleSpeichern}
              >
                Speichern
              </Button>
              <Button size="sm" variant="outline" onClick={handleLaden}>
                Laden
              </Button>
            </div>
          </CardContent>
        </Card>

        <PlanungsGrid members={teamMembers} tage={tage} dienstplantage={dienstplantage} />
      </div>

      <DienstplanLadenDialog
        open={ladenDialogOffen}
        onOpenChange={setLadenDialogOffen}
        onSelect={handleDienstplanAuswaehlen}
      />

      <AlertDialog
        open={ausstehendeAktion !== null}
        onOpenChange={(open) => {
          if (!open) setAusstehendeAktion(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ungespeicherte Änderungen</AlertDialogTitle>
            <AlertDialogDescription>
              Der Titel wurde geändert, ohne dass seitdem gespeichert wurde. Änderungen gehen
              verloren, wenn du fortfährst.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleWarnungFortfahren}>Fortfahren</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default PlanPage
