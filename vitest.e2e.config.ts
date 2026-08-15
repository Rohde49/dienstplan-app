import { defineConfig } from 'vitest/config'

// Getrennte Konfiguration, weil E2E eine gebaute App (npm run build) voraussetzt und
// deutlich langsamer ist als die Ebenen 1–4. `npm run test` bleibt dadurch schnell
// genug, um nach jeder Änderung zu laufen. Siehe docs/architektur/teststrategie.md.
export default defineConfig({
  test: {
    name: 'e2e',
    environment: 'node',
    include: ['e2e/**/*.e2e.test.ts'],
    testTimeout: 60_000,
    hookTimeout: 60_000,
    // Electron-Instanzen teilen sich Ports und Benutzerverzeichnisse — nacheinander starten.
    fileParallelism: false
  }
})
