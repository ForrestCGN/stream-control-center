# STEP276F – Alert Media-Registry Dauer/Details

## Ergebnis

Alert-Regeln werden mit Media-Registry-Details angereichert. Der Dashboard-Regel-Editor verwendet bei gesetzter `sound_media_id` jetzt die Media-Registry-Dauer statt der Legacy-Sound-Dauer.

## Betroffene Dateien

- `backend/modules/alert_system.js`
- `htdocs/dashboard/modules/alerts.js`
- `docs/backend/ALERT_RULE_MEDIA_DURATION_STEP276F.md`
- `docs/dashboard/ALERT_RULE_MEDIA_DURATION_STEP276F.md`

## Tests

- `node --check backend/modules/alert_system.js`
- `node --check htdocs/dashboard/modules/alerts.js`

## Rollback

Vorherigen STEP276E/STEP276C-Stand wiederherstellen.
