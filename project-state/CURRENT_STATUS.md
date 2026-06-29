# CURRENT STATUS

Aktueller Stand: `0.2.51 - Media 0.2.50 Live Handoff Docs`.

## Kurzstatus

```text
0.2.50 ist funktional abgeschlossen.
Online- und lokale Media-Library sind synchron.
Media-Mod-Ansicht ist enttechnisiert.
Medienliste ist als Karten-/Listenansicht umgesetzt.
Filter und Neu laden bleiben erhalten.
Upload/Edit/Delete bleiben deaktiviert.
Server-API /api/remote/media/status funktioniert weiterhin.
```

## Bestaetigte Media-Zahlen online

```text
total: 120
sounds: 74
videos: 0
images: 46
audio: 72
video: 2
image: 46
returned: 120
skipped: 8
totalSeen: 334
```

## Wichtige Pfadregel

```text
Online / Remote:
remote-modboard/backend/public/...

Offline / Lokal:
htdocs/dashboard-v2/...
```

Bei UI-Features, die lokal und online gelten sollen, beide Pfade pruefen und ggf. beide Dateien aendern.

## Sicherheitsgrenzen

```text
Keine DB-Item-Reads.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Fallback bleibt aus.
Writes bleiben aus.
```
