# TODO: Dienstplan-Desktop-App

Entwicklung erfolgt mit Claude Code (Electron + Vite + React + TypeScript).

## Schritt 1: Grundgerüst aufsetzen (aktueller Schritt)

- [x] Projekt mit `electron-vite` scaffolden (Template: Electron + React + TypeScript)
- [x] Node.js LTS, Git-Repository und ESLint/Prettier einrichten
- [x] Minimale Fensterstruktur starten (leeres Fenster, Hot Reload funktioniert) — per Screenshot bestätigt: Fenster startet, zeigt die electron-vite-Startseite
- [x] IPC zwischen Renderer- und Main-Prozess testen (einfache Testkommunikation über Preload-Skript) — "Send IPC"-Button im Template geklickt, Main-Prozess loggt `pong`
- [x] Erst nach erfolgreichem IPC-Test mit weiteren Schritten fortfahren

## Geplante nächste Schritte (noch nicht im Detail geplant)

- [x] SQLite-Anbindung über `better-sqlite3` im Main-Prozess isoliert testen — `src/main/db.ts` legt DB in `app.getPath('userData')` an, Smoke-Test (Tabelle anlegen, Insert, Select) beim App-Start bestätigt per Log und Datei auf Disk
- [ ] Grundlayout mit React Router aufbauen (Startseite, Team-Verwaltung, Plan-Verwaltung, Monats-/Jahres-Auswahl)
- [ ] Team-Verwaltung umsetzen (Datenbasis für Planung)
- [ ] Planungsansicht: dynamische Erzeugung je Monat/Jahr
- [ ] Packaging mit `electron-builder` (Windows-Installer)

## Technologieentscheidungen (Begründung)

- Electron statt Tauri: kompletter Stack in TypeScript, kein zusätzlicher Rust-Lernaufwand im Studienprojekt
- Lokale SQLite-Datenbank statt Server-Backend: keine Mehrbenutzer-Synchronisation über Netzwerk nötig
- Zielplattform: nur Windows
