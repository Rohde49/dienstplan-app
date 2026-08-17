import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { abonniereFehler, type Fehlermeldung } from '@/lib/fehlermeldung'

// Seitenübergreifende Anzeige für Fehler aus der Preload-Bridge. Liegt über allem, weil
// die betroffenen Aufrufe auch aus Komponenten kommen, die selbst keine Fehlerfläche
// haben (Auswahllisten, Dialoge).
//
// Bewusst kein automatisches Ausblenden: Ein fehlgeschlagenes Speichern darf nicht nach
// drei Sekunden verschwinden, während der Nutzer woanders hinsieht. Er schließt es selbst.
export function FehlerHinweis(): React.JSX.Element | null {
  const [meldungen, setMeldungen] = useState<Fehlermeldung[]>([])

  useEffect(() => {
    return abonniereFehler((meldung) => {
      // Nur die jüngsten behalten — bei einer dauerhaft unerreichbaren Datenbank feuert
      // jeder Ladevorgang erneut, und ein wachsender Stapel verdeckt die Oberfläche.
      setMeldungen((bisher) => [...bisher, meldung].slice(-3))
    })
  }, [])

  if (meldungen.length === 0) return null

  function schliesse(id: number): void {
    setMeldungen((bisher) => bisher.filter((meldung) => meldung.id !== id))
  }

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col items-center gap-2 p-4">
      {meldungen.map((meldung) => (
        <div
          key={meldung.id}
          role="alert"
          className="border-destructive/40 bg-background text-destructive flex w-full max-w-2xl items-start gap-3 rounded-md border p-4 shadow-lg"
        >
          <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium">{meldung.text}</p>
            <p className="text-muted-foreground mt-1 break-words">{meldung.ursache}</p>
          </div>
          <button
            type="button"
            onClick={() => schliesse(meldung.id)}
            className="focus-visible:ring-ring text-muted-foreground hover:text-foreground shrink-0 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
            aria-label="Meldung schließen"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
