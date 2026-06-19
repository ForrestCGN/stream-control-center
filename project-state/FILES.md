# FILES

Stand: 2026-06-19

## Shot-Alarm Backend

- `backend/modules/shot_alarm.js` – Backend-Regeln, Bus-Consumer, Auslosung, Counter, Chat/Sound/Overlay-Ausgabe, Dashboard-Audit, History-ID-Fix.
- `config/shot_alarm.json` – Mirror/Fallback für Regeln, Zeiten, Texte, Soundpool, Chat-/Overlay-Config.

## Command-System

- `backend/modules/commands.js` – enthält `!shotdone` / `!shotgetrunken` mit Ziel `POST /api/shot-alarm/shot-done`.

## Payment-/Alert-Provider

- `backend/modules/kofi.js` – Ko-fi Alert-Provider, veröffentlicht zusätzlich `payment.kofi.received` auf den Communication Bus.
- `backend/modules/tipeee.js` – Tipeee Alert-Provider, veröffentlicht zusätzlich `payment.tipeee.received` auf den Communication Bus.

## Shot-Alarm Dashboard

- `htdocs/dashboard/modules/stream_events.js` – Event-System Dashboard, Tabs, Texte-/Config-Integration, Shot-Alarm-Tab, Safety/Audit-Infos.
- `htdocs/dashboard/modules/stream_events.css` – Event-System Styles inkl. Config-Auswahl und Shot-Alarm-Erweiterungen.
- `htdocs/dashboard/modules/shot_alarm.js` – Shot-Alarm Dashboard-Modulbestand aus früheren Steps, Safety-kompatibel.
- `htdocs/dashboard/modules/shot_alarm.css` – Shot-Alarm Styles.

## Shot-Alarm Overlay

- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html` – OBS-Overlay mit oberer Karte und unterer Statusleiste.

## Shot-Alarm Doku

- `docs/modules/shot_alarm.md` – Moduldokumentation.
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2E_FINAL.md` – Übergabe für nächsten Chat.

## Projektstand

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
