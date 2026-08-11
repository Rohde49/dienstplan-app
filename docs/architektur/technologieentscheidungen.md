# Technologieentscheidungen (Begründung)

## Electron statt Tauri

Kompletter Stack in TypeScript, kein zusätzlicher Rust-Lernaufwand im Studienprojekt. Tauri wurde erwogen (kleinere Binaries, geringerer Ressourcenverbrauch), aber die Backend-Logik liefe dort in Rust, einer zusätzlichen Sprache parallel zum eigentlichen Projekt und Zeitrahmen des Studienprojekts. Diese Entscheidung wurde bewusst noch einmal geprüft und bestätigt.

## Lokale SQLite-Datenbank statt Server-Backend

Keine Mehrbenutzer-Synchronisation über Netzwerk nötig, die App läuft lokal für eine Person. `better-sqlite3` im Main-Prozess, isoliert vom Renderer, Zugriff nur über IPC/Preload-Bridge.

## Zielplattform: nur Windows

Einziges relevantes Build-Target laut Projektanforderung, Packaging über `electron-builder` als Windows-Installer.
