# CURRENT CHAT HANDOFF – EVS-24b Streamer Friendly Lifecycle Text

Stand: 2026-06-13

## Ergebnis

EVS-24b ist ein reiner Dashboard-/Doku-Cleanup für das Event-System. Der normale Bereich `Event-System → Status` bleibt bewusst streamer- und modfreundlich.

## Version

```text
MODULE_VERSION = 0.5.20
MODULE_BUILD   = STEP_EVS_24B_STREAMER_FRIENDLY_LIFECYCLE_TEXT
```

## Geändert

- Der Lifecycle-Block heißt in der normalen Ansicht nun `Event verwalten`.
- Eventname und freundlicher Status stehen im Vordergrund, nicht die `eventUid`.
- `API-Status`, `EventUid` und interne API-Confirm-Erklärungen wurden aus der normalen Bedienansicht entfernt.
- Löschen wird verständlich erklärt: eine normale Bestätigung, danach endgültig.
- `archived` wird im Badge als `Archiviert` angezeigt.

## Unverändert

- Kein Twitch-Senden.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Backend-Delete-Schutz bleibt intern erhalten.
- Runtime-Gate aus EVS-24 bleibt aktiv.

## Wichtige Dashboard-Regel

```text
Streamer-/Mod-Dashboard = einfach, verständlich, bedienbar.
Technische Diagnose, interne Flags, API-Details und Payloads = Admin-/Diagnosebereich.
```

## Test nach Einspielen

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-24b Streamer Friendly Lifecycle Text"
```

Danach im Dashboard prüfen:

- `Event-System → Status`
- normale Statusanzeige bleibt einfach,
- `Event verwalten` zeigt keine technische API-Sprache,
- Löschen fragt nur eine normale Bestätigung,
- kein Twitch-Senden.
