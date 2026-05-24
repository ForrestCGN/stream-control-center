# Dashboard — Kommunikation, Sicherheit und Logs

## Neue Dashboard-Bereiche

```text
System → Kommunikation
System → Logs
System → Security / Audit
```

## System → Kommunikation

Anzeige:

- Monitoring aktiv/inaktiv
- Grund: live, manual, test, inactive
- verbundene Clients
- erwartete Overlays
- letzter Heartbeat
- Status: healthy, stale, offline, ignored
- letzte Events
- offene Acks
- Resync-Buttons

Wichtig: Wenn Monitoring inaktiv ist, dürfen fehlende Overlays nicht als Fehler dargestellt werden.

Beispielstatus:

```text
Monitoring: inaktiv
Grund: Stream offline / OBS nicht erforderlich
Alerts Overlay: ignored
Sound Overlay: ignored
```

Bei aktivem Stream:

```text
Monitoring: aktiv
Grund: Stream live
Alerts Overlay: healthy, letzter Heartbeat vor 2s
Sound Overlay: healthy, letzter Heartbeat vor 1s
```

## Manuelle Steuerung

Dashboard-Schalter:

- Monitoring manuell aktivieren
- Monitoring deaktivieren
- Test-Watch für X Minuten starten
- Overlay-Resync auslösen
- Client-Registry zurücksetzen

## System → Logs

Filter:

- Zeitraum
- Level
- Modul
- Aktion
- Actor
- Event-ID
- Request-ID
- nur Fehler
- nur Security
- nur Communication

## Wiederholte Fehler

Dashboard soll Wiederholungen zusammenfassen, nicht spammen.

Beispiel:

```text
Alerts Overlay fehlt während aktivem Monitoring.
17 Wiederholungen in 10 Minuten unterdrückt.
```

## Retention

Admin/Owner kann einstellen:

- Logs aktiv/inaktiv
- Aufbewahrung in Tagen
- Cleanup-Intervall
- Detailgrad
- Wiederhol-Cooldown
