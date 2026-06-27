# CURRENT CHAT HANDOFF – EVS-25 Overview Active Event Status

Stand: 2026-06-13

## Ziel

EVS-25 verschiebt den normalen Event-Status aus dem eigenen Status-Tab in die Übersicht. Das Dashboard soll für Streamer und Mods nicht technisch wirken, sondern direkt zeigen, ob gerade ein Event läuft und welche Werte für das laufende Event relevant sind.

## Ergebnis

- Der normale `Status`-Tab wurde aus der Tab-Leiste entfernt.
- Die `Übersicht` ist jetzt die Hauptseite für den aktuellen Event-Zustand.
- Bei keinem aktiven Event zeigt die Übersicht nur verständlich: `INAKTIV`, kein Event läuft, Stream online/offline und startbereite Events.
- Bei aktivem Event zeigt die Übersicht:
  - Event-System aktiv/inaktiv
  - laufendes Event
  - Stream online/offline
  - Sound-Spiel an/aus
  - Text-Spiel an/aus
  - Sound-Aufgaben gesamt/gelöst/offen
  - Text-Aufgaben gesamt/gelöst/offen
  - Teilnehmer
  - Top-Punkte
  - Top-Spieler
- Technische Blöcke wie Dispatcher, DirectSend, Prepared-only oder Blockiergründe bleiben nicht in der normalen Streamer-/Mod-Ansicht.

## Build

- `MODULE_VERSION = 0.5.21`
- `MODULE_BUILD = STEP_EVS_25_OVERVIEW_ACTIVE_EVENT_STATUS`

## Unverändert

- Kein Twitch-Live-Senden.
- Kein Sound-Playback.
- Keine Sound-System-Queue-Berührung.
- Keine Backend-Schutzlogik entfernt.
- Runtime-Gate bleibt intern vorhanden.

## StepDone

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-25 Overview Active Event Status"
```

## Nachtest

- Dashboard öffnen: `Event-System → Übersicht`.
- Prüfen, dass der eigene Status-Tab nicht mehr angezeigt wird.
- Prüfen, dass die Übersicht bei keinem aktiven Event einfach `INAKTIV / Kein Event läuft` zeigt.
- Bei aktivem Event prüfen, dass Aufgaben/Gelöst/Offen sichtbar werden.
