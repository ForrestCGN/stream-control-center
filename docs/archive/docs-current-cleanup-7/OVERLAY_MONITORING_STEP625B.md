# Overlay Monitoring STEP625B

STEP625B ergänzt ein strukturiertes Monitoring-Issue-Log für den Overlay-Monitor.

## Active/Resolved-Lebenszyklus

Der Overlay-Monitor synchronisiert Laufzeit-Issues aus dem Bus-Monitoring in die SQLite-Tabelle `monitoring_issues`:

- `active`: Problem ist aktuell vorhanden.
- `resolved`: Problem wurde seit dem letzten Scan nicht mehr gesehen.

Ein bestehendes aktives Issue wird nicht erneut angelegt, sondern nur über `last_seen_at` und `seen_count` aktualisiert. Dadurch entsteht kein Log-Spam.

## Dashboard

Der Tab `Probleme` zeigt nun:

- Aktive Monitoring-Issues
- Aktuelle Laufzeit-Hinweise
- Erledigte Monitoring-Issues

## Wichtige Abgrenzung

Dieser Step speichert keine Heartbeats dauerhaft. Gespeichert werden nur Monitoring-Issues und deren Erledigung.
