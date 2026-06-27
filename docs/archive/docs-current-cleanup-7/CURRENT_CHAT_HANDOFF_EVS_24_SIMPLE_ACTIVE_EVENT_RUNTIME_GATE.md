# CURRENT CHAT HANDOFF – EVS-24 Simple Active Event Runtime Gate

Stand: 2026-06-13

## Step

```text
EVS-24 – Simple Active Event Runtime Gate
MODULE_VERSION = 0.5.18
MODULE_BUILD   = STEP_EVS_24_SIMPLE_ACTIVE_EVENT_RUNTIME_GATE
```

## Ziel

Das Event-System wurde wieder auf eine einfache Betriebslogik zurückgeschnitten:

```text
Stream offline
→ Event-System wertet keinen Event-Chat aus

Stream online + kein aktives Event
→ Event-System wertet keinen Event-Chat aus

Stream online + aktives Event
→ Event-System wertet Chat für dieses Event aus
```

Es wurden keine Live-Chatmeldungen aktiviert und kein Sound-Playback freigeschaltet.

## Backend

Neu/angepasst in `backend/modules/stream_events.js`:

- optionaler Zugriff auf vorhandenes Modul `stream_status`, wenn vorhanden.
- neue Runtime-Gate-Funktion:
  - prüft aktives Event,
  - prüft Stream online/offline über `stream_status.getCurrentStatus({ refresh:false })`,
  - liefert einfache Gründe wie `no_active_event`, `stream_offline`, `stream_status_unknown`, `active_event_and_stream_online`.
- neuer Endpoint:

```text
GET /api/stream-events/runtime-gate/status
```

- `GET /api/stream-events/status` enthält zusätzlich `runtimeGate`.
- Twitch-Bus-Chat (`twitch.chat.message`) wird für `stream_events` nur verarbeitet, wenn das Gate aktiv ist.
- API-Testwege bleiben nutzbar, damit Tests nicht durch Offline-Status blockiert werden.

## Dashboard

Geändert in `htdocs/dashboard/modules/stream_events.js` und `.css`:

- Tab `Sicherheit` wurde auf `Status` vereinfacht.
- der Bereich `Live-Schalter Konzept` wurde aus der normalen Anzeige entfernt.
- neuer Bereich `Event-System Status`:
  - Aktiv/Inaktiv,
  - einfacher Grund,
  - Stream Online/Offline,
  - laufendes Event,
  - Sound/Text-Spiel an/aus.
- Lifecycle und ChatOutput-Diagnose bleiben sichtbar, aber das zentrale Bedienbild ist einfacher.

## Weiterhin nicht aktiv

- keine direkte Twitch-Ausgabe,
- kein direktes Sound-Playback,
- keine Sound-System-Queue-Berührung,
- keine neue Rechte-/Audit-Matrix,
- kein globaler Live-Schalter.

## Test nach Einspielen

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-24 Simple Active Event Runtime Gate"
```

Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError
$s.runtimeGate | ConvertTo-Json -Depth 6
```

Dashboard prüfen:

```text
Event-System → Status
```

Erwartung:

- ohne aktives Event: `Inaktiv – Kein Event läuft`,
- Stream offline: `Inaktiv – Stream offline`,
- Stream online + aktives Event: `Aktiv`.
