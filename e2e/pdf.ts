import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

/**
 * Auswertung der von Chromium erzeugten Druck-PDFs.
 *
 * Chromium bettet Schriften als Teilmengen mit eigener Kodierung ein — ein naiver
 * Regex über die Streams liefert deshalb Binärmüll aus den Bilddaten statt Text.
 * pdfjs-dist wertet die ToUnicode-Tabellen korrekt aus und ist Mozillas eigener
 * PDF-Parser, also derselbe, mit dem der Nutzer die Datei später ansieht.
 */

interface PdfInhalt {
  seiten: number
  text: string
}

export async function lesePdf(pdf: Buffer): Promise<PdfInhalt> {
  const aufgabe = getDocument({
    data: new Uint8Array(pdf),
    // Ohne Worker im Node-Testlauf; die Dokumente sind klein genug.
    useSystemFonts: true
  })
  const dokument = await aufgabe.promise

  const seitentexte: string[] = []
  for (let nummer = 1; nummer <= dokument.numPages; nummer++) {
    const seite = await dokument.getPage(nummer)
    const inhalt = await seite.getTextContent()
    seitentexte.push(
      inhalt.items
        .map((eintrag) => ('str' in eintrag ? eintrag.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
    )
  }

  const seiten = dokument.numPages
  await aufgabe.destroy()

  return { seiten, text: seitentexte.join('\n') }
}
