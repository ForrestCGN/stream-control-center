# CURRENT CHAT HANDOFF – SHOT-ALARM 2B

Stand: 2026-06-18
STEP: SHOT-ALARM-2B DB Texts Config Helpers

## Kurzstand

Shot-Alarm wurde nach STEP 2A erweitert:

- Modulversion: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`
- Dashboard-Pfad: `Community / Community / Event-System / Shot-Alarm`
- Config wird über zentrale DB-Settings gespeichert (`module_settings`, Key `shot_alarm.config`).
- JSON `config/shot_alarm.json` bleibt Mirror/Fallback.
- Texte laufen über den vorhandenen `helper_texts` und `module_text_variants`.
- Chat-/Overlay-Texte sind kategorisiert in `Chat-Texte` und `Overlay-Texte`.
- History wird zusätzlich in `shot_alarm_history` persistiert.
- Statistikroute ergänzt.

## Relevante Routen

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/config`
- `GET /api/shot-alarm/texts`
- `POST /api/shot-alarm/texts`
- `GET /api/shot-alarm/stats`
- `GET /api/shot-alarm/history`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/reset-state`

## Genutzte Helper

- `backend/modules/helpers/helper_texts.js`
  - `seedModuleTextVariants`
  - `listModuleTextEditor`
  - `handleModuleTextEditorPayload`
  - `renderModuleText`
- `backend/modules/helpers/helper_settings.js`
  - `module_settings`
  - JSON-Setting `shot_alarm.config`
- `backend/core/database.js`
  - zentrale DB-Schicht, SQLite aktiv, MySQL/MariaDB-Dialekt vorbereitet
- `backend/modules/helpers/helper_chat_output.js`
  - Chat-Ausgabe
- `backend/modules/communication_bus.js`
  - Bus-Events und Overlay-Status

## Noch offen

- `!shotdone` Chatbefehl über bestehendes Commands-/Chat-System anbinden.
- Ko-fi/Tipeee Payment-Bus sauber ergänzen.
- Soundpool-Auswahl im Dashboard an vorhandene Media/Sound-Systeme anbinden.
- Persistente Counter ggf. aus DB nach Neustart wiederherstellen.
- Rechte/Audit für produktive Dashboard-Aktionen prüfen.


## Ergänzung: Dashboard-Placement
Shot-Alarm wurde im Dashboard fachlich dem Bereich Events zugeordnet. Config und Texte werden im Shot-Alarm-Modul im Events-Kontext geführt. Die eigentliche Backend-Version bleibt 0.2.1.


## STEP SHOT-ALARM-2B.2 Dashboard Community Event-System Placement

- Separater linker Hauptnavigationspunkt `Events` entfernt.
- `Event-System` liegt wieder als Karte im Bereich `Community`.
- `Shot-Alarm` bleibt als Event-Untermodul vorhanden, aber nicht als eigener Hauptnavigationspunkt.
- Texte/Config sollen im Event-System-Kontext über vorhandene Modul-/Bereichs-Dropdowns weitergeführt werden.
- Backend, Regeln, DB-Texte, DB-Config, Overlay und Counter wurden nicht geändert.

---

## STEP SHOT-ALARM-2B.3 – Event-System Modul-Dropdowns

Dashboard-Fix: Shot-Alarm bleibt unter `Community → Event-System`. Die Tabs `Texte` und `Config` im Event-System besitzen nun eine Modul-Auswahl:

- Event-System
- Shot-Alarm

Wenn `Shot-Alarm` gewählt ist, werden die Shot-Alarm-DB-Texte und die Shot-Alarm-DB-Config direkt im Event-System-Bereich angezeigt und gespeichert. Es wurde keine neue Hauptnavigation eingeführt.

Geändert:
- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- Doku/Projektstand

Nicht geändert:
- Backend-Regeln
- Shot-Auslosung
- DB-Schema
- Overlay
- Counter
- Sound-System
