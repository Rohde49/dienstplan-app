import { beforeEach, describe, expect, it } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TeamPage from './TeamPage'
import { installiereApiFake } from '../../../test/apiFake'
import { neuerMitarbeiter } from '../../../test/factories'
import type { TeamMember } from '../../../shared/types'

// Muster für Komponententests (Ebene 3, siehe docs/test/teststrategie.md):
// Gerendert wird die echte Seite mit ihren echten Kindkomponenten, ersetzt wird nur
// die Prozessgrenze — window.api. Bedient wird ausschließlich über zugängliche
// Rollen und Beschriftungen, nie über CSS-Klassen oder Testids: ein Feld, das der
// Screenreader nicht findet, findet der Test auch nicht.

function rendereTeamPage(): void {
  render(
    <MemoryRouter>
      <TeamPage />
    </MemoryRouter>
  )
}

async function fuelleFormularAus(werte: {
  vorname: string
  name: string
  wochenarbeitszeit: string
}): Promise<void> {
  const nutzer = userEvent.setup()
  const felder: [string, string][] = [
    ['Vorname', werte.vorname],
    ['Nachname', werte.name],
    ['Wochenarbeitszeit', werte.wochenarbeitszeit]
  ]

  for (const [beschriftung, wert] of felder) {
    const feld = screen.getByLabelText(beschriftung)
    await nutzer.clear(feld)
    // user-event lehnt einen leeren Tippbefehl ab; leer bleiben heißt hier "nicht tippen".
    if (wert !== '') await nutzer.type(feld, wert)
  }
}

let api: ReturnType<typeof installiereApiFake>

beforeEach(() => {
  api = installiereApiFake()
})

describe('TeamPage', () => {
  it('zeigt die beim Start geladenen Mitarbeiter in der Liste', async () => {
    const bestand: TeamMember[] = [
      { id: 1, ...neuerMitarbeiter({ vorname: 'Nina', name: 'Krause' }) },
      { id: 2, ...neuerMitarbeiter({ vorname: 'Tom', name: 'Weber' }) }
    ]
    api = installiereApiFake({ teamMembers: bestand })

    rendereTeamPage()

    expect(await screen.findByText('Nina Krause')).toBeInTheDocument()
    expect(screen.getByText('Tom Weber')).toBeInTheDocument()
  })

  it('legt einen Mitarbeiter an und rechnet die Wochenarbeitszeit in Minuten um', async () => {
    const nutzer = userEvent.setup()
    rendereTeamPage()

    await fuelleFormularAus({ vorname: 'Nina', name: 'Krause', wochenarbeitszeit: '39:00' })
    await nutzer.click(screen.getByRole('radio', { name: 'Blau' }))

    // Die Rolle sitzt in einem Radix-Select; der Trigger trägt das Label.
    await nutzer.click(screen.getByLabelText('Rolle'))
    await nutzer.click(await screen.findByRole('option', { name: 'Erzieher' }))

    await nutzer.click(screen.getByRole('button', { name: 'Speichern' }))

    const gespeichert = await api.team.list()
    expect(gespeichert).toEqual([
      {
        id: 1,
        vorname: 'Nina',
        name: 'Krause',
        rolle: 'Erzieher',
        wochenarbeitszeitMinuten: 2340, // 39 × 60
        farbe: '#3A8DFF'
      }
    ])
  })

  it('zeigt die Validierungsfehler an und speichert nicht, wenn Pflichtangaben fehlen', async () => {
    const nutzer = userEvent.setup()
    rendereTeamPage()

    await fuelleFormularAus({ vorname: 'Nina', name: '', wochenarbeitszeit: '39:00' })
    await nutzer.click(screen.getByRole('button', { name: 'Speichern' }))

    const fehlerliste = await screen.findByRole('alert')
    expect(within(fehlerliste).getByText('Name darf nicht leer sein.')).toBeInTheDocument()
    expect(await api.team.list()).toEqual([])
  })

  it('meldet den Grund, wenn ein bereits verplanter Mitarbeiter gelöscht werden soll', async () => {
    const nutzer = userEvent.setup()
    api = installiereApiFake({
      teamMembers: [{ id: 1, ...neuerMitarbeiter({ vorname: 'Nina', name: 'Krause' }) }],
      dienstplaene: [
        {
          id: 1,
          monat: 9,
          jahr: 2026,
          titel: 'September',
          erstelltAm: '2026-08-01T00:00:00.000Z',
          geaendertAm: '2026-08-01T00:00:00.000Z'
        }
      ],
      dienstplantage: [{ id: 1, dienstplanId: 1, datum: '2026-09-01', bemerkung: null }],
      rufbereitschaften: [{ id: 1, dienstplantagId: 1, teamMemberId: 1 }]
    })

    rendereTeamPage()

    await nutzer.click(await screen.findByRole('button', { name: 'Nina Krause bearbeiten' }))
    await nutzer.click(screen.getByRole('button', { name: 'Löschen' }))
    // Sicherheitsabfrage im AlertDialog bestätigen.
    const dialog = await screen.findByRole('alertdialog')
    await nutzer.click(within(dialog).getByRole('button', { name: 'Löschen' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/bereits in einem Dienstplan/i)
    await waitFor(async () => expect(await api.team.list()).toHaveLength(1))
  })
})
