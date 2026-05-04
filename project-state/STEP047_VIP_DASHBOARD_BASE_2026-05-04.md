# STEP047 - VIP Dashboard Base

Stand: 2026-05-04

## Zweck

Dieser STEP baut das erste VIP-Dashboard-Basismodul auf Basis des bereits vorbereiteten VIP-Backends.

Wichtig: In diesem STEP wurde kein Backend umgebaut und kein Upload gebaut. Ziel war ein kleiner, nachvollziehbarer Dashboard-STEP.

## Betroffene Dateien

Geaendert/neu:

- `htdocs/dashboard/app.js`
- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`
- `project-state/STEP047_VIP_DASHBOARD_BASE_2026-05-04.md`

Noch zu aktualisieren nach lokalem Pull/Test:

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Dashboard-Funktionen

Neu vorbereitet:

- VIP-Modul in der Community-Sektion.
- VIP-CSS und VIP-JS im Dashboard eingebunden.
- VIP-Overlay-Link auf `/overlays/vip_sound_overlay_v2.html`.
- VIP-Uebersicht mit Statuskarten.
- Anzeige von DB-Settings.
- Bearbeitung von Settings ueber vorhandene Backend-API.
- Anzeige und Bearbeitung von VIP-Texten aus `vip_sound_message_templates`.
- Textfilter nach Style, Event-Key und Suche.
- Aktivieren/Deaktivieren von Texten ueber vorhandene Backend-API.
- Anzeige und Bearbeitung von Rollen-Fallbacks aus `vip_sound_role_overrides`.
- Anzeige von Daily-Usage.
- Anzeige von Events/Statistik.
- Admin-Testausloesung vorbereitet ueber vorhandene VIP-Test-API.

## Genutzte Backend-Routen

- `GET /api/vip-sound/admin/summary`
- `GET /api/vip-sound/settings`
- `POST /api/vip-sound/settings/upsert`
- `GET /api/vip-sound/roles`
- `POST /api/vip-sound/roles/upsert`
- `POST /api/vip-sound/roles/delete`
- `GET /api/vip-sound/texts`
- `GET /api/vip-sound/texts/event-keys`
- `POST /api/vip-sound/texts/upsert`
- `POST /api/vip-sound/texts/toggle`
- `GET /api/vip-sound/daily-usage/today`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`
- `POST /api/vip-sound/admin/test`

## Verbindlicher Modulstandard

Dieser STEP haelt den kuenftigen Standard fuer Dashboard-Module fest:

1. Dashboardfaehige Settings liegen in der Datenbank.
2. Dashboardfaehige Texte liegen in der Datenbank.
3. JSON-Dateien sind nur technische Config, Import oder Fallback.
4. Dashboard greift nie direkt auf SQLite oder Dateien zu.
5. Dashboard nutzt nur Backend-APIs.
6. Chat-Ausgaben laufen zentral ueber vorhandene Helper, nicht ueber harte Streamer.bot-Texte.
7. Neue Module sollen vorhandene Helper nutzen, keine Parallelstrukturen bauen.

Aktuell relevante Helper:

- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_messages.js`
- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_chat_output.js`
- `backend/modules/helpers/helper_media.js`

Wichtiger Befund:

- `helper_settings.js` ist bereits DB-Settings-Standard.
- VIP nutzt DB-Texte ueber `vip_sound_message_templates`.
- Alerts haben bereits DB-Textbereiche (`alert_text_variants`, `alert_chat_blocks`).
- `helper_texts.js` ist aktuell noch JSON-basiert und muss spaeter entweder erweitert oder durch einen DB-Text-Helper ergaenzt werden.

## Bewusst nicht enthalten

Nicht in STEP047 enthalten:

- VIP-Song-Upload.
- Backend-Umbau.
- neuer generischer Upload-Helper.
- Migration anderer Module.
- Dashboard-Rechte-/Audit-Logging.
- Loeschen/Resetten von Daily-Usage aus der UI.

## Offene Folgearbeiten

Empfohlen als naechster Audit-STEP:

- Alle Module auf denselben Standard pruefen:
  - Settings in DB?
  - Texte in DB?
  - harte Texte im Code?
  - JSON-Texte?
  - vorhandene API?
  - vorhandene Helper genutzt?
  - Sonderlogik/Parallelstruktur?

Empfohlener Folge-STEP:

- `STEP048_MODULE_TEXT_SETTINGS_AUDIT_2026-05-04`

Danach:

- Zentralen DB-Text-Helper planen.
- VIP-Song-Upload nach Helper-/Upload-Standard bauen.
- Andere Module schrittweise angleichen.

## Tests nach lokalem Pull

Auszufuehren:

```powershell
cd D:\Git\stream-control-center
git pull origin dev

node -c .\htdocs\dashboard\modules\vip.js

Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/admin/summary" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/texts?limit=5" | ConvertTo-Json -Depth 20
```

Nach Live-Deploy im Browser pruefen:

- Dashboard oeffnen.
- Community -> VIP-System.
- Statuskarten laden.
- Settings werden angezeigt.
- Texte werden angezeigt.
- Rollen werden angezeigt.
- Events werden angezeigt.

## Hinweise

- `docs/current/CURRENT_SYSTEM_STATUS.md` war vor diesem STEP beim VIP-Stand veraltet und nannte noch `1.7.1`/STEP023.
- Massgeblich ist aktuell `project-state/CURRENT_STATUS.md` und STEP040 mit VIP-Version `1.8.5`.
- Diese Doku-Abweichung muss nach lokalem Pull/Test in `docs/current/CURRENT_SYSTEM_STATUS.md` korrigiert werden.
