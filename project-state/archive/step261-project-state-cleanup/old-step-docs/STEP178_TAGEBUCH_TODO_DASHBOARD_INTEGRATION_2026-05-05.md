# STEP178 Tagebuch/Todo Dashboard Integration

Stand: 2026-05-05

## Ziel

Tagebuch und Todo werden als echte Dashboard-Module im Community-Bereich aktiviert.

Dieser STEP nutzt die in STEP177 gebauten Backend-Routen fuer DB-Settings und DB-Texte. Es werden keine Backend-Routen, keine Datenbankdateien und keine bestehenden Streamer.bot-/Discord-Funktionen entfernt.

## Betroffene Dateien

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/controlhome.js`
- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Umsetzung

### Dashboard Navigation

- `tagebuch` und `todo` sind im Community-Bereich aktiviert.
- `index.html` bindet die neuen CSS-/JS-Dateien und Panels ein.
- `app.js` registriert beide Module mit Reload-Funktion.
- `controlhome.js` markiert Community als teilaktiv und kann direkt zu Tagebuch springen.

### Tagebuch Dashboard

Neues Modul:

- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`

Funktionen:

- Status anzeigen
- DB-Settings anzeigen und einzeln speichern
- DB-Texte anzeigen und einzeln speichern
- Statistik anzeigen
- Backend-Reload ausloesen

Genutzte Backend-Routen:

- `GET /api/tagebuch/status`
- `GET /api/tagebuch/admin/settings`
- `POST /api/tagebuch/admin/settings`
- `GET /api/tagebuch/admin/texts`
- `POST /api/tagebuch/admin/texts`
- `GET /api/tagebuch/stats`
- `GET /api/tagebuch/stats/today`
- `POST /api/tagebuch/reload`

### Todo Dashboard

Neues Modul:

- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`

Funktionen:

- Status anzeigen
- Ziele und Discord-Channel-Konfiguration anzeigen
- DB-Settings anzeigen und einzeln speichern
- DB-Texte anzeigen und einzeln speichern
- Statistik anzeigen
- Backend-Reload ausloesen

Genutzte Backend-Routen:

- `GET /api/todo/status`
- `GET /api/todo/admin/settings`
- `POST /api/todo/admin/settings`
- `GET /api/todo/admin/texts`
- `POST /api/todo/admin/texts`
- `GET /api/todo/stats`
- `GET /api/todo/stats/today`
- `POST /api/todo/reload`

## Bewusst nicht umgesetzt

- Keine Reset-/Hardreset-UI fuer Tagebuch.
- Keine direkte Bearbeitung von SQLite im Dashboard.
- Keine direkte Bearbeitung von JSON-Dateien im Dashboard.
- Keine neue Berechtigungslogik.
- Keine Backend-Aenderung.
- Keine Entfernung bestehender Routen oder Funktionen.

## Tests

Lokal im Paket geprueft:

```powershell
node -c htdocs/dashboard/app.js
node -c htdocs/dashboard/modules/controlhome.js
node -c htdocs/dashboard/modules/tagebuch.js
node -c htdocs/dashboard/modules/todo.js
```

Nach Deploy live pruefen:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/admin/texts" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/admin/texts" | ConvertTo-Json -Depth 20
```

Dashboard pruefen:

- Community oeffnen
- Tagebuch oeffnen
- Todo oeffnen
- Tabs `Uebersicht`, `Settings`, `Texte`, `Statistik` pruefen
- Einen ungefaehrlichen Text testweise aendern und wieder zuruecksetzen

## Naechster sinnvoller Schritt

STEP179 kann die UX vorsichtig verbessern:

- bessere Labels/Beschreibungen fuer bekannte Settings
- Schutz fuer sensible/technische Settings
- optional Sammel-Speichern statt Einzel-Speichern
- optional bessere JSON-Editor-Darstellung fuer Todo-Ziele
