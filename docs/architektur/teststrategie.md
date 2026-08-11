# Teststrategie

Drei Testebenen, priorisiert nach Aufwand/Nutzen für ein Studienprojekt mit begrenztem Zeitrahmen.

## 1. Fachlogik als reine Funktionen (höchste Priorität)

Reine Funktionen ohne Electron-Abhängigkeit schreiben, z. B. "erzeuge leere Plantabelle für Monat X/Jahr Y" oder Validierungsregeln. Mit Vitest unit-testen, ganz ohne laufendes Electron-Fenster. Das ist der wichtigste und günstigste Test-Layer und sollte zuerst aufgebaut werden.

## 2. Repository-/DB-Layer

Gegen eine In-Memory-SQLite-Datenbank testen (`new Database(':memory:')`). Das geht mit `better-sqlite3` problemlos synchron und ohne Mocking, es wird also echte SQL-Logik getestet, ohne eine Datei auf der Platte anzulegen.

## 3. UI-/E2E-Tests (niedrige Priorität, vorerst zurückgestellt)

Für Electron z. B. mit Playwright möglich, aber Zusatzaufwand mit begrenztem Mehrwert für dieses Projekt. Stattdessen: manueller Screenshot-Vergleich der UI, wie bisher schon bei Schritt 1 praktiziert (Fenster/IPC-Test per Screenshot bestätigt).
