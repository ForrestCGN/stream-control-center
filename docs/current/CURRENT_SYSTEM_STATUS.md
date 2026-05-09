# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Twitch Presence

Aktueller Stand:

- Loyalty-Core läuft im Shadow Mode.
- StreamElements bleibt aktiv.
- Watch-Heartbeat mit Intervall-Schutz funktioniert.
- Twitch Presence sammelt aktive/anwesende Chat-User.
- Stream-State-Gate mit Streamer.bot-Fallback funktioniert.
- Presence Run-Once funktioniert.
- Auto Shadow Runner funktioniert.
- Dashboard-Modul für Loyalty ist vorbereitet.

## Dashboard-Modul Loyalty

Pfad:

```text
Community -> Loyalty
```

Dateien:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
```

Index-Erweiterung:

```text
htdocs/dashboard/index.html
```

Funktionen:

```text
Status
Stream-State
Runner Start/Stop/Run-Once
User/Punkte
Transaktionen
Aktive Twitch Presence
Ignore-Liste
Konfiguration/Settings
Runner Events
```

## Verbindliche Regeln

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
Shadow Mode zuerst.
StreamElements bleibt aktiv.
Offline keine Watch-Punkte.
Auto Runner nicht automatisch beim Boot aktiv.
Dashboard startet Runner nicht automatisch.
```
