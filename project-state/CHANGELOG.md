# Changelog

## RDAP Admin Notes UI Loop Fix 1

- `remote-modboard/backend/public/assets/rdap28-admin-notes.js` gegen Prelogin-/No-Write-Render-Schleife abgesichert.
- Ursache: `renderAdminNotesResult -> renderCreateAvailability -> closeUpdateEditor -> renderAdminNotesResult`.
- `closeUpdateEditor()` rendert jetzt nur noch bei echter State-Aenderung und respektiert `skipRender`.
- `renderCreateAvailability()` schliesst den Update-Editor im gesperrten Zustand ohne rekursives Re-Rendern.
- Keine Backend-, DB- oder Route-Aenderung.
- Webserver-Deploy nach `stepdone` erforderlich, weil eine Datei unter `remote-modboard/` geaendert wurde.

## RDAP Module Route Audit 1

- Echte GitHub/dev-Mounts, Routes, Services und Status-Semantik geprueft.
- Naechsten Semantik-Doku-Fix markiert.
- Keine Code-, DB- oder Webserver-Aenderungen.

## RDAP TODO Rescue 2 Final TODO Close

- `project-state/TODO.md` bereinigt: Rescue-2-Einspiel-/Pruefpunkt aus den offenen Aufgaben entfernt und als abgeschlossen dokumentiert.
- `project-state/NEXT_STEPS.md`, `CURRENT_STATUS.md` und `FILES.md` auf Abschlussstand gesetzt.
- TODO-Struktur final festgelegt: aktive Kurzfristpunkte in `TODO.md`, Langzeit-/Parkpunkte in `PARKED_TODOS.md`.
- Keine Code-, DB- oder Webserver-Aenderungen.
