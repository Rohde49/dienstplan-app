import { Link } from 'react-router-dom'

function EintraegePage(): React.JSX.Element {
  return (
    <div className="p-6">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Zurück zur Startseite
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">Eintrag-Verwaltung</h1>
      <p className="text-muted-foreground">Noch nicht implementiert.</p>
    </div>
  )
}

export default EintraegePage
