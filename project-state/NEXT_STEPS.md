# NEXT_STEPS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-20

## Sofort testen

### EVS-20 – ChatOutput Dispatcher Prep prüfen

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-20 ChatOutput Dispatcher Prep"
```

Dann:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/chat-output/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/chat-output/report
```

Erwartung:

```text
wouldSend = false
directSend = false
dispatched = false
blockedReasons enthält Sicherheitsblocker
```

## Danach sinnvoll

### EVS-21 – Dashboard ChatOutput Status

Ziel:

- ChatOutput-Status im Dashboard anzeigen.
- TESTMODUS / LIVE AKTIV klar sichtbar vorbereiten.
- Blocker verständlich anzeigen.
- Keine öffentliche Twitch-Ausgabe.
- Kein Live-Send-Button ohne späteres Sicherheitskonzept.

### EVS-22 – Sound-System Playback Prep

Ziel:

- Vorbereitete Playback-Payloads an vorhandenes Sound-System anschließbar machen.
- Anfangs weiterhin geschützt per Config-Schalter.
- Sound-System-Queue nur kontrolliert und optional berühren.
- Kein zweiter Player.

### EVS-23 – Event Overlay Prep

Ziel:

- Ein zentrales Event-Overlay vorbereiten.
- Anzeige aktiver Eventname, Modus, aktive Soundrunde/Textstatus, Punkte/Ranking.
- Noch keine überladene Show.

### EVS-24 – Event-Ende / Top 3 / Abschluss

Ziel:

- Event sauber beenden.
- Top 3 Ranking vorbereiten.
- Textvarianten für Abschluss nutzen.
- Dashboard/Overlay/ChatOutput prepared-only.

## Offene Fachfragen

- Wie soll der Live-Schalter im Dashboard geschützt werden?
- Soll es einen globalen Owner-Schalter plus Event-Schalter geben? Empfehlung: ja.
- Soll ein Mod Live-Ausgabe aktivieren dürfen oder nur Owner/Admin?
- Soll es eine sichtbare rote Warnung geben, wenn Chat-Ausgabe live aktiv ist? Empfehlung: ja.
- Sollen mehrere vorbereitete ChatOutputs später gebündelt werden? Empfehlung: ja, optional.
