# STEP180 - Text-Varianten Status-/UX-Cleanup

Stand: 2026-05-05

## Ziel

STEP180 ist ein kleiner Folge-STEP nach STEP179.

Ziel war kein neuer Umbau, sondern Klarheit und Bedienbarkeit:

- Status-Ausgaben sollen die neue Varianten-Tabelle korrekt benennen.
- Der Textvarianten-Editor soll bessere Labels und Hinweise anzeigen.
- Bestehende Varianten-/DB-Logik bleibt unveraendert.
- Keine Funktionalitaet entfernen.

## Geaenderte Dateien

Backend:

- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`

Dashboard:

- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`

Doku:

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP180_TEXT_VARIANTS_STATUS_UX_CLEANUP_2026-05-05.md`

## Backend-Aenderungen

### Status-Klarheit

Tagebuch und Todo melden die neue Textvarianten-Schicht jetzt klarer:

- `textsTable: module_text_variants`
- `legacyTextsTable: module_texts`
- `textsSource: database_variants_with_json_fallback`

Die alte Tabelle `module_texts` bleibt als Legacy-/Kompatibilitaetsschicht erhalten.

## Dashboard-Aenderungen

### Bessere Labels im Varianten-Editor

Die Texte-Seiten zeigen nicht mehr nur rohe Keys wie `entrySaved` oder `added`, sondern lesbarere Labels, z. B.:

- `entrySaved` -> `Eintrag gespeichert`
- `added` -> `Todo eingetragen`
- `discordPost` -> `Discord-Post`

Die technischen Keys bleiben weiterhin sichtbar, damit nichts unklar wird.

### Hinweise je Text-Key

Wichtige Text-Keys zeigen kurze Hinweise, z. B.:

- wann der Text verwendet wird
- welche Platzhalter vorhanden sind
- ob der Text im Chat oder Discord landet

### Platzhalter fuer neue Varianten

Das Feld fuer neue Varianten nutzt jetzt den lesbaren Label-Namen statt nur den rohen Key.

## Bewusst nicht geaendert

- Keine neue DB-Tabelle.
- Keine Aenderung an bestehenden Tagebuch-/Todo-Funktionsrouten.
- Keine Loeschung von `module_texts`.
- Keine Aenderung an JSON-Seed-/Fallback-Dateien.
- Kein globaler Texteditor fuer alle Module in diesem STEP.
- Kein Audit-Logging in diesem STEP.

## Tests

Vorgesehene Tests nach Entpacken:

```powershell
node -c .ackend\modules	agebuch.js
node -c .ackend\modules	odo.js
node -c .\htdocs\dashboard\modules	agebuch.js
node -c .\htdocs\dashboard\modules	odo.js
```

Live-Routen nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/texts" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/texts" | ConvertTo-Json -Depth 30
```

## Naechster sinnvoller Schritt

STEP181 sollte kein weiterer Textsystem-Umbau sein, sondern ein gezielter Praxistest:

- eine zweite aktive Variante fuer `todo.added` anlegen
- eine zweite aktive Variante fuer `tagebuch.entrySaved` anlegen
- Live-Ausgabe pruefen
- ggf. kleine UI-Fehler korrigieren

Danach kann der Varianten-Editor als Muster fuer weitere Module geplant werden.
