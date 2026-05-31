# Overlay Monitoring – STEP620B

## Stand

STEP620B beruhigt das Logging des Overlay-Monitors und teilt die Dashboard-Seite in mehrere Bereiche auf.

## Warum

Im Server-Log wurden sehr viele Meldungen erzeugt:

```text
[overlay_monitor] overlay_status_changed: Overlay ... online -> stale
[overlay_monitor] overlay_status_changed: Overlay ... stale -> online
```

Das lag daran, dass der Monitor jede kleine Statusänderung direkt ins Console-Log geschrieben hat. Für Dashboard und interne Diagnose sind diese Wechsel weiterhin relevant, aber im Node-Server-Log waren sie zu laut.

## Neue Log-Regel

- `online ↔ stale` wird intern weiter gespeichert, aber nicht mehr standardmäßig in die Console geschrieben.
- `offline`, `dead` und `overlay_missing` bleiben im Server-Log sichtbar.
- Unterdrückte Console-Logs werden gezählt über `stats.consoleLogsSuppressed`.

## Dashboard-Aufteilung

Die Overlays-Seite besteht jetzt aus:

```text
Übersicht
Bus-Clients
OBS-Quellen
Probleme
Rohdaten
```

Damit steht nicht mehr alles auf einer einzigen langen Seite.

## Weiterhin read-only

STEP620B verändert keine OBS-Quelle und keine Overlay-Datei. Es gibt keine Automatik und keine Reparatur.

## Nächste sinnvolle Schritte

1. Hello und echte Heartbeats sauber trennen.
2. OBS-Quelle ↔ Bus-Client Mapping vorbereiten.
3. Wichtige wartende Overlays als Soll-Liste mit Status `bereit` bewerten.
4. Erst danach manuelle OBS-Aktionen wie Show/Hide/Refresh einbauen.
