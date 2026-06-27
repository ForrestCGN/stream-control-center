# CURRENT CHAT HANDOFF – EVS-24a Dashboard Status Simplify

Stand: 2026-06-13

## Kontext

EVS-24 war fachlich richtig, aber im Dashboard war weiterhin der alte technische Block „Chat-Ausgabe Sicherheit“ sichtbar. Das war für Streamer/Mods zu technisch und widersprach der gewünschten einfachen Bedienlogik.

## Änderung

EVS-24a vereinfacht die normale Dashboard-Ansicht:

- `Event-System → Status` zeigt nur noch:
  - Aktiv/Inaktiv
  - Grund
  - Stream Online/Offline
  - laufendes Event
  - Sound-Spiel an/aus
  - Text-Spiel an/aus
  - Event-Lifecycle-Regeln
- Der technische ChatOutput-Sicherheitsblock wird in der normalen Status-Ansicht nicht mehr gerendert.
- Der Header wurde von EVS-22 auf EVS-24a korrigiert.

## Unverändert

- Kein Twitch-Live-Senden.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine DB-Migration.
- Runtime-Gate-Regel bleibt:
  - Stream offline → inaktiv
  - kein aktives Event → inaktiv
  - Stream online + aktives Event → aktiv

## Version

- `MODULE_VERSION = 0.5.19`
- `MODULE_BUILD = STEP_EVS_24A_DASHBOARD_STATUS_SIMPLIFY`

## StepDone

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-24a Dashboard Status Simplify"
```
