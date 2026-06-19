# FILES

Stand: 2026-06-19

## Shot-Alarm Backend

- `backend/modules/shot_alarm.js` – Regeln, Bus-Consumer, Runtime, Stream-Session-Anbindung, Counter, Chat/Sound/Overlay-Ausgabe.
- `config/shot_alarm.json` – Fallback/Mirror für Regeln, Zeiten, Soundpool und Anzeigeoptionen. Primär liegen viele Einstellungen in DB/Settings.

## Dashboard

- `htdocs/dashboard/modules/stream_events.js` – Event-System Dashboard inkl. Shot-Alarm-Tab/Subtabs, Status, Logs, Statistik, Overlay, Sounds.
- `htdocs/dashboard/modules/stream_events.css` – Styles für Event-System und Shot-Alarm-Bereiche.
- `htdocs/dashboard/modules/shot_alarm.js` – älterer/ergänzender Shot-Alarm-Dashboard-Modulbestand; nicht ohne Prüfung entfernen.
- `htdocs/dashboard/modules/shot_alarm.css` – Shot-Alarm Styles.

## Overlay

- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html` – OBS Shot-Alarm Overlay mit Topbar, Ergebnis-Card, Force/Debug-Modus und Heartbeat.
- `htdocs/overlays/shared/overlay_bus_client.js` – vorhandener Overlay-Bus-Client; eingebunden im Shot-Overlay.

## Verwandte Backend-Module

- `backend/modules/twitch_events.js` – zentrale Stream-State-/Stream-Session-Quelle.
- `backend/modules/twitch_presence.js` – Twitch-/Presence-Umfeld.
- `backend/modules/communication_bus.js` – zentraler Communication/EventBus.
- `backend/modules/helper_communication.js` – Helper für Communication-Bus.
- `backend/modules/media.js` – Media-System/Registry.
- `backend/modules/sound_system.js` – zentrales Sound-/Queue-System.
- `backend/modules/sound_media_bridge.js` – Media → Sound-System Bridge.
- `backend/modules/sound_output_config.js` – Sound-Ausgabeziele.
- `backend/modules/kofi.js` – Ko-fi Event/Alert/Payment-Anbindung.
- `backend/modules/tipeee.js` – Tipeee Event/Alert/Payment-Anbindung.
- `backend/modules/commands.js` – Command-Katalog inkl. `!shotdone` / `!shotgetrunken`.

## Doku / Projektstand

- `docs/modules/shot_alarm.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_2K2_READY.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Heute erzeugte relevante Step-ZIPs

- `SHOT_ALARM_2J5_test_resolve_overlay_sound_fix.zip`
- `SHOT_ALARM_2K_overlay_heartbeat_fix.zip`
- `SHOT_ALARM_2K1_fresh_stream_session.zip`
- `SHOT_ALARM_2K2_auto_stream_session_binding.zip`
- `SHOT_ALARM_2K2_docs_projectstate.zip`
