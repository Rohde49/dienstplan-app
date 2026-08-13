export function planeintragSchluessel(dienstplantagId: number, teamMemberId: number): string {
  return `${dienstplantagId}:${teamMemberId}`
}

export function parsePlaneintragSchluessel(schluessel: string): {
  dienstplantagId: number
  teamMemberId: number
} {
  const [dienstplantagId, teamMemberId] = schluessel.split(':').map(Number)
  return { dienstplantagId, teamMemberId }
}
