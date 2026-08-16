import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

// Zwei getrennte Projekte, weil Main-/Shared-Code in Node laufen muss (better-sqlite3,
// keine DOM-Globals) und Renderer-Tests ein DOM brauchen. Siehe docs/test/teststrategie.md.
// `globals` bleibt bewusst aus — Tests importieren describe/it/expect explizit aus 'vitest'.
export default defineConfig({
  test: {
    projects: [
      {
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src/renderer/src')
          }
        },
        test: {
          name: 'node',
          environment: 'node',
          // Alles ohne DOM-Bedarf — auch die reinen Funktionen unter renderer/src/lib.
          // Ein DOM kostet pro Testdatei spürbar Startzeit, deshalb nur dort, wo er gebraucht wird.
          include: ['src/**/*.test.ts'],
          exclude: ['src/renderer/**/*.dom.test.ts']
        }
      },
      {
        resolve: {
          alias: {
            '@': resolve(__dirname, 'src/renderer/src')
          }
        },
        test: {
          name: 'dom',
          environment: 'jsdom',
          // Komponententests tragen die Endung .test.tsx, DOM-nahe Nicht-Komponenten-Tests
          // (z. B. Hooks) die Endung .dom.test.ts — beides läuft hier, sonst nichts.
          include: ['src/renderer/**/*.test.tsx', 'src/renderer/**/*.dom.test.ts'],
          setupFiles: ['src/test/setup.renderer.ts']
        }
      }
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/renderer/src/components/ui/**']
    }
  }
})
