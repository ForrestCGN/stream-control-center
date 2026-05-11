# STEP191 - Clip Dashboard Textvarianten UX Cleanup

Stand: 2026-05-05

## Ziel

Textvarianten im Clip-Dashboard verständlicher und bedienbarer darstellen.

## Betroffene Dateien

- `htdocs/dashboard/modules/clips.js`
- `htdocs/dashboard/modules/clips.css`

## Backend/DB

Keine Backend-Änderung.
Keine DB-Änderung.
Keine direkten Datei-/DB-Zugriffe im Dashboard.

## Änderung

- Verständliche Labels für technische Text-Keys.
- Technischer Key bleibt klein sichtbar.
- Hilfetexte pro Textbereich.
- Platzhalter-Hinweise pro Textbereich, wo sinnvoll.
- Neue Variante wird oberhalb der bestehenden Varianten angezeigt.
- Varianten zeigen zusätzlich ihre DB-ID klein an.

## Wichtig

Alle Texte bleiben DB-basiert in `module_text_variants`.
JSON bleibt nur Seed/Fallback/Import.
