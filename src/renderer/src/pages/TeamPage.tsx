import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ManagementLayout } from '@/components/ManagementLayout'
import { TeamMemberForm, type TeamMemberFormValues } from '@/components/TeamMemberForm'
import { TeamMemberTable } from '@/components/TeamMemberTable'
import { formatMinutesToHHMM, parseHHMMToMinutes } from '@/lib/time'
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
    window.api.team.list().then(setTeamMembers)
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

    request.then(() => {
      handleNewMember()
      loadTeamMembers()
    })
  }

  return (
    <div className="p-6">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Zurück zur Startseite
      </Link>

      <div className="mt-4">
        <ManagementLayout
          title="Team-Verwaltung"
          description="Mitarbeiter anlegen, bearbeiten und verwalten"
          primaryAction={
            <Button onClick={handleNewMember}>
              <Plus className="size-4" />
              Neuer Mitarbeiter
            </Button>
          }
          list={
            <TeamMemberTable members={teamMembers} selectedId={selectedId} onEdit={handleEdit} />
          }
          detail={
            <TeamMemberForm
              mode={selectedId === null ? 'create' : 'edit'}
              values={formValues}
              errors={errors}
              onChange={handleFormChange}
              onSubmit={handleSubmit}
              onCancel={handleNewMember}
            />
          }
        />
      </div>
    </div>
  )
}

export default TeamPage
