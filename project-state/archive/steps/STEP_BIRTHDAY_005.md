# STEP_BIRTHDAY_005 – Party-Presets und User-Partys

## Ziel

Birthday-Show erweitert von "User-Song" zu echten Party-Presets:

- globale Standard-Party als Fallback
- optionale eigene Party pro User
- mehrere Styles/Party-Arten
- Herzflug, Konfetti, Ballons, Glitzer, Lichtstrahlen
- mehrere visuelle Szenen während der Songphase, damit die Celebration nicht statisch wirkt
- Vorbereitung für spätere Bilder pro Party

## Wichtiges Verhalten

Wenn für einen User eine aktive Party zugeordnet ist, wird diese genutzt.
Wenn keine Party zugeordnet ist, läuft immer:

- globales Intro-Video
- Standardsong bzw. vorhandener Fallback
- Standard-Party

Die automatische Geburtstagsgrüße bleiben klein: Chat + optional Tagebuch. Keine automatische Show.

## Neue DB-Struktur

Neue Tabelle:

- `birthday_parties`

Erweiterung:

- `birthday_show_profiles.party_key`

## Neue API-Routen

- `GET /api/birthday/admin/show/parties`
- `POST /api/birthday/admin/show/parties`
- `POST /api/birthday/admin/show/profile`

## Erste Styles

- `classic_party`
- `cgn_neon`
- `epic_party`
- `heimaufsicht_fun`
- `cute_soft`

## Dateien

Geändert:

- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/overlays/_overlay-birthday.html`

Doku aktualisiert:

- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Tests

```powershell
node --check backend\modules\birthday.js
node --check htdocs\dashboard\modules\birthday.js
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets"
```
