import type Database from 'better-sqlite3'
import { app, shell, dialog, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { datenbankPfad, oeffneDatenbank, runDbSmokeTest } from './db'
import { registerDienstplanHandlers } from './ipc/dienstplanHandlers'
import { registerEintragsdefinitionHandlers } from './ipc/eintragsdefinitionHandlers'
import { registerPlaneintragHandlers } from './ipc/planeintragHandlers'
import { registerRufbereitschaftHandlers } from './ipc/rufbereitschaftHandlers'
import { registerTeamHandlers } from './ipc/teamHandlers'

type Db = InstanceType<typeof Database>

// Muss mit `appId` aus electron-builder.yml übereinstimmen, sonst gruppiert Windows
// Taskleisten-Anheftung und Benachrichtigungen unter einer anderen Identität als der,
// unter der die App installiert ist.
const APP_USER_MODEL_ID = 'de.rohde.dienstplan'

// Nur Web-Links dürfen an das Betriebssystem weitergereicht werden. Ohne diese Prüfung
// landet jedes beliebige Schema (file:, smb:, fremde Protokoll-Handler) beim jeweiligen
// Standardprogramm.
const ERLAUBTE_LINK_PROTOKOLLE = ['http:', 'https:']

let hauptfenster: BrowserWindow | null = null

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 640,
    minHeight: 480,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      // Die beiden folgenden Werte sind bereits die Voreinstellung von Electron. Sie
      // stehen trotzdem hier: Sie sind die Grundlage der Prozessgrenze aus
      // docs/architektur/prozessgrenzen.md und sollen ein Major-Upgrade überleben,
      // ohne von einer geänderten Voreinstellung still gekippt zu werden.
      contextIsolation: true,
      nodeIntegration: false,
      // Setzt voraus, dass das Preload-Bundle außer `electron` nichts per require lädt —
      // unter Sandbox ist kein weiteres Modul verfügbar, und das Bundle bräche beim Laden
      // ab. Siehe den Hinweis in src/preload/index.ts.
      sandbox: true
    }
  })

  hauptfenster = mainWindow

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    hauptfenster = null
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (istWebLink(url)) {
      shell.openExternal(url).catch((fehler) => {
        console.error('[main] Externer Link konnte nicht geöffnet werden:', fehler)
      })
    }

    return { action: 'deny' }
  })

  // Die App navigiert intern ausschließlich über den HashRouter; eine echte Navigation
  // käme daher von außen. Die CSP in src/renderer/index.html deckt diesen Fall nicht ab,
  // sie greift erst für Unterressourcen einer bereits geladenen Seite.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!istEigeneSeite(url, mainWindow.webContents.getURL())) {
      event.preventDefault()
    }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

function istWebLink(url: string): boolean {
  try {
    return ERLAUBTE_LINK_PROTOKOLLE.includes(new URL(url).protocol)
  } catch {
    return false
  }
}

// Vergleicht ohne Fragment: Der HashRouter wechselt die Route über den Hash, das ist
// dieselbe Seite und muss erlaubt bleiben.
function istEigeneSeite(url: string, aktuelleUrl: string): boolean {
  try {
    const ziel = new URL(url)
    const aktuell = new URL(aktuelleUrl)
    return ziel.origin === aktuell.origin && ziel.pathname === aktuell.pathname
  } catch {
    return false
  }
}

// Öffnet die Datenbank und zeigt einen Fehler an, statt den Prozess stumm sterben zu
// lassen. Ohne Datenbank ist die App funktionslos — deshalb wird sie hier beendet und
// nicht mit einem leeren Fenster fortgesetzt.
function oeffneDatenbankOderBeende(): Db | null {
  try {
    return oeffneDatenbank()
  } catch (fehler) {
    const grund = fehler instanceof Error ? fehler.message : String(fehler)

    dialog.showErrorBox(
      'Datenbank konnte nicht geöffnet werden',
      `Die Dienstplan-Datenbank ist nicht verwendbar. Die Anwendung wird beendet.\n\n` +
        `Datei: ${datenbankPfad()}\n\n` +
        `Ursache: ${grund}\n\n` +
        `Häufigste Gründe: Die Anwendung läuft bereits, das Verzeichnis ist ` +
        `schreibgeschützt, oder die Datei ist beschädigt.`
    )

    app.quit()
    return null
  }
}

// Eine zweite Instanz würde eine zweite Verbindung auf dieselbe SQLite-Datei öffnen.
// WAL macht paralleles Lesen unkritisch, paralleles Schreiben nicht. Statt zwei
// konkurrierender Fenster bekommt der Nutzer das bestehende nach vorn geholt.
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!hauptfenster) return

    if (hauptfenster.isMinimized()) hauptfenster.restore()
    hauptfenster.focus()
  })

  app.whenReady().then(() => {
    electronApp.setAppUserModelId(APP_USER_MODEL_ID)

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // IPC test
    ipcMain.on('ping', () => console.log('pong'))

    const db = oeffneDatenbankOderBeende()
    if (!db) return

    runDbSmokeTest(db)
    registerTeamHandlers(db)
    registerEintragsdefinitionHandlers(db)
    registerDienstplanHandlers(db)
    registerPlaneintragHandlers(db)
    registerRufbereitschaftHandlers(db)

    app.on('before-quit', () => {
      db.close()
    })

    createWindow()

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
