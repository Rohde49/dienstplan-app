import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

// Registriert die jest-dom-Matcher (toBeInTheDocument, toHaveTextContent, …) und
// erweitert gleichzeitig die Typen von `expect`. Der /vitest-Einstiegspunkt ist dafür
// der vorgesehene Weg — ein manuelles expect.extend würde nur zur Laufzeit wirken und
// den Typecheck der Testdateien scheitern lassen.
import '@testing-library/jest-dom/vitest'

afterEach(() => {
  cleanup()
})

// jsdom implementiert weder die Pointer-Capture-API noch scrollIntoView. Die
// Radix-Primitives (Select, AlertDialog) rufen beides beim Öffnen auf und brechen
// sonst mit "target.hasPointerCapture is not a function" ab. Reine Testumgebungs-
// Lücke, kein Mangel der Komponenten — deshalb hier zentral aufgefüllt.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false
  Element.prototype.setPointerCapture = () => {}
  Element.prototype.releasePointerCapture = () => {}
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {}
}
