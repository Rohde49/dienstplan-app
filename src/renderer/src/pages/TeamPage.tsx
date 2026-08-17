import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { ArrowLeft, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ManagementLayout } from '@/components/layout/ManagementLayout'
import { TeamMemberForm, type TeamMemberFormValues } from '@/components/TeamMemberForm'
import { TeamMemberTable } from '@/components/TeamMemberTable'
import { formatMinutesToHHMM, parseHHMMToMinutes } from '../../../shared/time'
import { fehlerMelder } from '@/lib/fehlermeldung'
import { validateTeamMemberInput } from '@/lib/validateTeamMember'
import type { TeamMember } from '../../../shared/types'

const emptyFormValues: TeamMemberFormValues = {
  vorname: '',
  name: '',
  rolle: '',
  wochenarbeitszeit: '',
  farbe: ''
}

function TeamPage(): React.JSX.Element {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [formValues, setFormValues] = useState<TeamMemberFormValues>(emptyFormValues)
  const [errors, setErrors] = useState<string[]>([])

  const loadTeamMembers = useCallback(() => {
    window.api.team
      .list()
      .then(setTeamMembers)
      .catch(fehlerMelder('Die Mitarbeiterliste konnte nicht geladen werden.'))
  }, [])

  useEffect(() => {
    loadTeamMembers()
  }, [loadTeamMembers])

  function handleNewMember(): void {
    setSelectedId(null)
    setFormValues(emptyFormValues)
    setErrors([])
  }

  function handleEdit(member: TeamMember): void {
    setSelectedId(member.id)
    setFormValues({
      vorname: member.vorname,
      name: member.name,
      rolle: member.rolle,
      wochenarbeitszeit: formatMinutesToHHMM(member.wochenarbeitszeitMinuten),
      farbe: member.farbe
    })
    setErrors([])
  }

  function handleFormChange(patch: Partial<TeamMemberFormValues>): void {
    setFormValues((prev) => ({ ...prev, ...patch }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()

    let wochenarbeitszeitMinuten: number
    try {
      wochenarbeitszeitMinuten = parseHHMMToMinutes(formValues.wochenarbeitszeit)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Ungültige Wochenarbeitszeit.'])
      return
    }

    const input = {
      vorname: formValues.vorname,
      name: formValues.name,
      rolle: formValues.rolle,
      wochenarbeitszeitMinuten,
      farbe: formValues.farbe
    }

    const validationErrors = validateTeamMemberInput(input)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors([])
    const data = { ...input, rolle: input.rolle as TeamMember['rolle'] }
    const request =
      selectedId === null ? window.api.team.add(data) : window.api.team.update(selectedId, data)

    request
      .then(() => {
        handleNewMember()
        loadTeamMembers()
      })
      .catch(fehlerMelder('Der Mitarbeiter konnte nicht gespeichert werden.'))
  }

  function handleDelete(): void {
    if (selectedId === null) return

    window.api.team
      .delete(selectedId)
      .then((result) => {
        if (result.geloescht) {
          handleNewMember()
          loadTeamMembers()
        } else {
          setErrors(result.grund ? [result.grund] : ['Löschen nicht möglich.'])
        }
      })
      .catch(fehlerMelder('Der Mitarbeiter konnte nicht gelöscht werden.'))
  }

  return (
    <div className="p-6 pt-12">
      <ManagementLayout
        title="Team-Verwaltung"
        description="Mitarbeiter anlegen, bearbeiten und verwalten"
        backAction={
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Zurück zur Startseite
            </Link>
          </Button>
        }
        primaryAction={
          <Button onClick={handleNewMember}>
            <Plus className="size-4" />
            Neuer Mitarbeiter
          </Button>
        }
        list={<TeamMemberTable members={teamMembers} selectedId={selectedId} onEdit={handleEdit} />}
        detail={
          <TeamMemberForm
            mode={selectedId === null ? 'create' : 'edit'}
            values={formValues}
            errors={errors}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            onCancel={handleNewMember}
            onDelete={handleDelete}
          />
        }
      />
    </div>
  )
}

export default TeamPage
