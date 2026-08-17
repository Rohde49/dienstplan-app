// Fehler aus der Preload-Bridge sichtbar machen.
//
// Jeder Aufruf von window.api landet über IPC im Main-Prozess. Wirft dort etwas — eine
// gesperrte Datenbank, eine verletzte Fremdschlüsselbedingung —, kommt die abgelehnte
// Promise im Renderer an. Ohne `.catch` passiert dann nichts: keine Meldung, kein
// Protokolleintrag, die Oberfläche bleibt einfach auf dem alten Stand stehen und der
// Nutzer hält das Ergebnis für gespeichert.
//
// Diese Datei ist bewusst kein React-Context: Sie wird aus Callbacks heraus aufgerufen,
// die keine Hooks verwenden dürfen. Die Anzeige hängt sich über `abonniereFehler` daran,
// siehe components/FehlerHinweis.tsx.

export interface Fehlermeldung {
  id: number
  text: string
  ursache: string
}

type Zuhoerer = (meldung: Fehlermeldung) => void

const zuhoerer = new Set<Zuhoerer>()
let naechsteId = 1

export function abonniereFehler(fn: Zuhoerer): () => void {
  zuhoerer.add(fn)
  return () => {
    zuhoerer.delete(fn)
  }
}

export function meldeFehler(text: string, fehler: unknown): void {
  const meldung: Fehlermeldung = { id: naechsteId++, text, ursache: lesbareUrsache(fehler) }

  // Auch dann protokollieren, wenn gerade niemand zuhört — sonst wäre ein Fehler während
  // des ersten Renderns spurlos verschwunden.
  console.error(`[renderer] ${text}`, fehler)

  zuhoerer.forEach((fn) => fn(meldung))
}

// Für den Anhang an einen Bridge-Aufruf: `.catch(fehlerMelder('… fehlgeschlagen.'))`.
// Der Text beschreibt, was aus Sicht des Nutzers nicht geklappt hat, nicht die technische
// Ursache — die hängt die Anzeige selbst an.
export function fehlerMelder(text: string): (fehler: unknown) => void {
  return (fehler) => meldeFehler(text, fehler)
}

// Electron stellt der eigentlichen Meldung einen Rahmen voran, etwa
// "Error invoking remote method 'team:list': Error: …". Für die Anzeige interessiert nur
// der hinterste Teil.
function lesbareUrsache(fehler: unknown): string {
  if (!(fehler instanceof Error)) return String(fehler)

  const ohneRahmen = fehler.message.replace(/^Error invoking remote method '[^']*':\s*/, '')
  return ohneRahmen.replace(/^Error:\s*/, '')
}
