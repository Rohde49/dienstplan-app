import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FehlerHinweis } from './FehlerHinweis'
import { meldeFehler } from '@/lib/fehlermeldung'
import TeamPage from '../pages/TeamPage'
import { installiereApiFake } from '../../../test/apiFake'

// Deckt die Fehlerklasse ab, die zuvor vollständig unsichtbar war: Ein abgelehnter
// Aufruf der Preload-Bridge führte zu gar nichts — kein Hinweis, keine Meldung, die
// Oberfläche blieb auf dem alten Stand stehen.

beforeEach(() => {
  // meldeFehler protokolliert bewusst auch dann, wenn niemand zuhört. Im Test wäre das
  // nur Rauschen.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('FehlerHinweis', () => {
  it('zeigt eine gemeldete Fehlermeldung mit Ursache an', async () => {
    render(<FehlerHinweis />)

    meldeFehler('Der Mitarbeiter konnte nicht gespeichert werden.', new Error('database is locked'))

    const hinweis = await screen.findByRole('alert')
    expect(hinweis).toHaveTextContent('Der Mitarbeiter konnte nicht gespeichert werden.')
    expect(hinweis).toHaveTextContent('database is locked')
  })

  // Electron stellt der eigentlichen Meldung einen Rahmen voran. Er sagt dem Nutzer
  // nichts und verdeckt die Ursache.
  it('entfernt den IPC-Rahmen aus der Ursache', async () => {
    render(<FehlerHinweis />)

    meldeFehler(
      'Die Mitarbeiterliste konnte nicht geladen werden.',
      new Error("Error invoking remote method 'team:list': Error: no such table: team_members")
    )

    const hinweis = await screen.findByRole('alert')
    expect(hinweis).toHaveTextContent('no such table: team_members')
    expect(hinweis).not.toHaveTextContent('invoking remote method')
  })

  it('lässt sich schließen', async () => {
    const nutzer = userEvent.setup()
    render(<FehlerHinweis />)
    meldeFehler('Etwas ist schiefgegangen.', new Error('Ursache'))
    await screen.findByRole('alert')

    await nutzer.click(screen.getByRole('button', { name: 'Meldung schließen' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('Fehler aus der Preload-Bridge', () => {
  it('macht einen fehlgeschlagenen Ladevorgang der Team-Seite sichtbar', async () => {
    const api = installiereApiFake()
    api.team.list = () => Promise.reject(new Error('database is locked'))

    render(
      <MemoryRouter>
        <FehlerHinweis />
        <TeamPage />
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Die Mitarbeiterliste konnte nicht geladen werden.'
      )
    })
  })
})
