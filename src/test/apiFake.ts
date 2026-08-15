import type { API } from '../preload/index.d'
import type {
  BemerkungAenderung,
  Dienstplan,
  Dienstplantag,
  Eintragsdefinition,
  Planeintrag,
  PlaneintragAenderung,
  Rufbereitschaft,
  RufbereitschaftAenderung,
  TeamMember
} from '../shared/types'

export interface ApiFakeStartdaten {
  teamMembers?: TeamMember[]
  eintragsdefinitionen?: Eintragsdefinition[]
  dienstplaene?: Dienstplan[]
  dienstplantage?: Dienstplantag[]
  planeintraege?: Planeintrag[]
  rufbereitschaften?: Rufbereitschaft[]
}

/**
 * Ersatz für die Preload-Brücke in Komponententests: hält die Daten im Speicher und
 * verhält sich fachlich wie die echten Handler (vergebene ids, Löschsperre bei
 * verwendeten Mitarbeitern), ohne Electron, IPC oder SQLite.
 *
 * Der Rückgabetyp ist der echte Preload-Typ `API`. Ändert sich dort eine Signatur,
 * schlägt `npm run typecheck` hier fehl — der Vertrag zwischen Renderer und Main wird
 * damit vom Compiler bewacht statt von Disziplin.
 *
 * Nicht erfasst wird der Sonderfall, dass eine Signatur nur einen zusätzlichen
 * hinteren Parameter bekommt: TypeScript erlaubt Funktionen mit weniger Parametern.
 * Diesen Fall fängt der aufrufende Anwendungscode ab.
 */
export function createApiFake(startdaten: ApiFakeStartdaten = {}): API {
  const teamMembers = [...(startdaten.teamMembers ?? [])]
  const eintragsdefinitionen = [...(startdaten.eintragsdefinitionen ?? [])]
  const dienstplaene = [...(startdaten.dienstplaene ?? [])]
  const dienstplantage = [...(startdaten.dienstplantage ?? [])]
  let planeintraege = [...(startdaten.planeintraege ?? [])]
  let rufbereitschaften = [...(startdaten.rufbereitschaften ?? [])]

  const naechsteId = (eintraege: { id: number }[]): number =>
    eintraege.reduce((groesste, eintrag) => Math.max(groesste, eintrag.id), 0) + 1

  const api = {
    team: {
      list: async () => [...teamMembers],
      add: async (data: Omit<TeamMember, 'id'>) => {
        const neu = { id: naechsteId(teamMembers), ...data }
        teamMembers.push(neu)
        return neu
      },
      update: async (id: number, data: Omit<TeamMember, 'id'>) => {
        const index = teamMembers.findIndex((member) => member.id === id)
        const aktualisiert = { id, ...data }
        if (index >= 0) teamMembers[index] = aktualisiert
        return aktualisiert
      },
      delete: async (id: number) => {
        const inVerwendung =
          planeintraege.some((eintrag) => eintrag.teamMemberId === id) ||
          rufbereitschaften.some((eintrag) => eintrag.teamMemberId === id)
        if (inVerwendung) {
          return {
            geloescht: false,
            grund:
              'Mitarbeiter kann nicht gelöscht werden, da er bereits in einem Dienstplan verwendet wird.'
          }
        }
        const index = teamMembers.findIndex((member) => member.id === id)
        if (index >= 0) teamMembers.splice(index, 1)
        return { geloescht: true }
      }
    },
    eintragsdefinition: {
      list: async () => [...eintragsdefinitionen],
      add: async (data: Omit<Eintragsdefinition, 'id'>) => {
        const neu = { id: naechsteId(eintragsdefinitionen), ...data }
        eintragsdefinitionen.push(neu)
        return neu
      },
      update: async (id: number, data: Omit<Eintragsdefinition, 'id'>) => {
        const index = eintragsdefinitionen.findIndex((definition) => definition.id === id)
        const aktualisiert = { id, ...data }
        if (index >= 0) eintragsdefinitionen[index] = aktualisiert
        return aktualisiert
      },
      delete: async (id: number) => {
        const index = eintragsdefinitionen.findIndex((definition) => definition.id === id)
        if (index >= 0) eintragsdefinitionen.splice(index, 1)
      }
    },
    dienstplan: {
      list: async () => [...dienstplaene],
      get: async (id: number) => {
        const dienstplan = dienstplaene.find((plan) => plan.id === id)
        if (!dienstplan) return null
        return {
          dienstplan,
          tage: dienstplantage.filter((tag) => tag.dienstplanId === id)
        }
      },
      create: async (data: { monat: number; jahr: number; titel: string }) => {
        const jetzt = new Date().toISOString()
        const dienstplan: Dienstplan = {
          id: naechsteId(dienstplaene),
          ...data,
          erstelltAm: jetzt,
          geaendertAm: jetzt
        }
        dienstplaene.push(dienstplan)
        const anzahlTage = new Date(data.jahr, data.monat, 0).getDate()
        const tage = Array.from({ length: anzahlTage }, (_, index) => ({
          id: naechsteId(dienstplantage) + index,
          dienstplanId: dienstplan.id,
          datum: `${data.jahr}-${String(data.monat).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`,
          bemerkung: null
        }))
        dienstplantage.push(...tage)
        return { dienstplan, tage }
      },
      speichernPlanungsstand: async (
        dienstplanId: number,
        titel: string,
        aenderungen: PlaneintragAenderung[],
        rufbereitschaftAenderungen: RufbereitschaftAenderung[],
        bemerkungAenderungen: BemerkungAenderung[]
      ) => {
        const dienstplan = dienstplaene.find((plan) => plan.id === dienstplanId)!
        dienstplan.titel = titel
        dienstplan.geaendertAm = new Date().toISOString()

        aenderungen.forEach(({ dienstplantagId, teamMemberId, eintrag }) => {
          planeintraege = planeintraege.filter(
            (vorhanden) =>
              vorhanden.dienstplantagId !== dienstplantagId ||
              vorhanden.teamMemberId !== teamMemberId
          )
          if (eintrag) {
            planeintraege.push({
              id: naechsteId(planeintraege),
              dienstplantagId,
              teamMemberId,
              ...eintrag
            })
          }
        })

        rufbereitschaftAenderungen.forEach(({ dienstplantagId, teamMemberId }) => {
          rufbereitschaften = rufbereitschaften.filter(
            (vorhanden) => vorhanden.dienstplantagId !== dienstplantagId
          )
          if (teamMemberId !== null) {
            rufbereitschaften.push({
              id: naechsteId(rufbereitschaften),
              dienstplantagId,
              teamMemberId
            })
          }
        })

        bemerkungAenderungen.forEach(({ dienstplantagId, bemerkung }) => {
          const tag = dienstplantage.find((vorhanden) => vorhanden.id === dienstplantagId)
          if (tag) tag.bemerkung = bemerkung
        })

        return {
          dienstplan,
          planeintraege: [...planeintraege],
          rufbereitschaften: [...rufbereitschaften],
          dienstplantage: dienstplantage.filter((tag) => tag.dienstplanId === dienstplanId)
        }
      },
      delete: async (id: number) => {
        const index = dienstplaene.findIndex((plan) => plan.id === id)
        if (index >= 0) dienstplaene.splice(index, 1)
      }
    },
    planeintrag: {
      listFuerDienstplan: async (dienstplanId: number): Promise<Planeintrag[]> => {
        const tagIds = new Set(
          dienstplantage.filter((tag) => tag.dienstplanId === dienstplanId).map((tag) => tag.id)
        )
        return planeintraege.filter((eintrag) => tagIds.has(eintrag.dienstplantagId))
      }
    },
    rufbereitschaft: {
      listFuerDienstplan: async (dienstplanId: number): Promise<Rufbereitschaft[]> => {
        const tagIds = new Set(
          dienstplantage.filter((tag) => tag.dienstplanId === dienstplanId).map((tag) => tag.id)
        )
        return rufbereitschaften.filter((eintrag) => tagIds.has(eintrag.dienstplantagId))
      }
    }
  }

  return api
}

/**
 * Hängt ein frisches Fake an `window.api`. In `beforeEach` aufrufen, damit kein
 * Test den Datenstand eines anderen sieht.
 */
export function installiereApiFake(startdaten: ApiFakeStartdaten = {}): API {
  const api = createApiFake(startdaten)
  window.api = api
  return api
}
