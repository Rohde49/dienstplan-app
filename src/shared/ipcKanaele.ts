// Einzige Quelle der IPC-Kanalnamen. Preload (src/preload/index.ts) und die Handler
// (src/main/ipc/*.ts) greifen beide hierauf zu, statt denselben String zweimal zu
// schreiben. Der Vertragstest in src/main/ipc/ipcVertrag.test.ts prüft, dass zu jedem
// Kanal genau ein registrierter Handler existiert und umgekehrt.
export const IPC_KANAELE = {
  team: {
    list: 'team:list',
    add: 'team:add',
    update: 'team:update',
    delete: 'team:delete'
  },
  eintragsdefinition: {
    list: 'eintragsdefinition:list',
    add: 'eintragsdefinition:add',
    update: 'eintragsdefinition:update',
    delete: 'eintragsdefinition:delete'
  },
  dienstplan: {
    list: 'dienstplan:list',
    get: 'dienstplan:get',
    create: 'dienstplan:create',
    speichernPlanungsstand: 'dienstplan:speichernPlanungsstand',
    delete: 'dienstplan:delete'
  },
  planeintrag: {
    listFuerDienstplan: 'planeintrag:listFuerDienstplan'
  },
  rufbereitschaft: {
    listFuerDienstplan: 'rufbereitschaft:listFuerDienstplan'
  }
} as const

// Flache Liste aller Kanalnamen, für den Vertragstest.
export const ALLE_IPC_KANAELE: string[] = Object.values(IPC_KANAELE).flatMap((bereich) =>
  Object.values(bereich)
)
