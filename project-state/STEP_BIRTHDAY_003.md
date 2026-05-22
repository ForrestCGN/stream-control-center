# STEP_BIRTHDAY_003 – Birthday Dashboard

Stand: 2026-05-22

## Ziel

Dashboard-Integration für das Birthday-System ergänzen, ohne die spätere große Show, Overlay, Video oder Sound anzufassen.

## Geänderte Dateien

- `backend/modules/birthday.js`
- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Backend

Neue Admin-/Dashboard-Routen:

- `GET /api/birthday/admin/users`
- `POST /api/birthday/admin/user`
- `POST /api/birthday/admin/user/delete`
- `GET /api/birthday/admin/settings`
- `POST /api/birthday/admin/settings`
- `GET /api/birthday/admin/texts`
- `POST /api/birthday/admin/texts`

Die Routen nutzen vorhandene Helper:

- `helper_settings` für DB-Settings
- `helper_texts` für Textvarianten
- `backend/core/database.js` für DB-Zugriffe

## Dashboard

Neue Birthday-Seite im Community-Bereich:

- Übersicht mit Modulstatus, Auto-Gratulation, heutige Geburtstage und Statistiken
- Geburtstagsliste mit Bearbeiten, Deaktivieren und Löschen
- Userformular für Twitch-Login, Anzeigename, Datum mit optionalem Jahr und Status
- Settings-Editor auf Basis der DB-Settings
- Textvarianten-Editor auf Basis von `module_text_variants`

Das Dashboard-Modul registriert sich dynamisch bei `window.CGN`, damit `app.js` nicht angefasst werden muss.

## Bewusst nicht geändert

- Keine große Birthday-Show
- Kein Overlay
- Kein Sound
- Kein Video
- Keine Änderungen an Sound-/Alert-/TTS-Queue
- Keine Änderung an `commands.js`
- Keine Entfernung bestehender Funktionalität

## Tests

Empfohlen:

```powershell
node --check backend\modules\birthday.js
node --check htdocs\dashboard\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/users"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/settings"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/texts"
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard
Community → Birthday-System
```

## Nächster sinnvoller Schritt

`STEP_BIRTHDAY_004` – manuelle Birthday-Show per `!birthday party username` mit Video, Overlay, Party-State und Song über zentrale Medienverwaltung.
