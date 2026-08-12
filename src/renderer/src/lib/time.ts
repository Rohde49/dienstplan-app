const HHMM_PATTERN = /^(\d{1,3}):([0-5]\d)$/

export function parseHHMMToMinutes(value: string): number {
  const match = HHMM_PATTERN.exec(value.trim())
  if (!match) {
    throw new Error(`Ungültiges Zeitformat: "${value}". Erwartet wird HH:MM.`)
  }

  const hours = Number(match[1])
  const minutes = Number(match[2])
  return hours * 60 + minutes
}

export function formatMinutesToHHMM(totalMinutes: number): string {
  if (!Number.isInteger(totalMinutes) || totalMinutes < 0) {
    throw new Error(`Ungültige Minutenzahl: ${totalMinutes}`)
  }

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
