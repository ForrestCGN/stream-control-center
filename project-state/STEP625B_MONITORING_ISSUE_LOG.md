# STEP625B - Monitoring-Issue-Log mit Active/Resolved

## Ziel

Overlay-Monitoring-Warnungen werden nicht mehr als wiederholter Log-Spam behandelt, sondern als deduplizierte Monitoring-Issues mit Lebenszyklus.

## Verhalten

- Neuer Fehler/Warnung erkannt: Issue wird einmalig mit `status = active` gespeichert.
- Fehler bleibt bestehen: bestehendes aktives Issue wird nur aktualisiert (`last_seen_at`, `seen_count`).
- Fehler verschwindet: bestehendes aktives Issue wird auf `resolved` gesetzt und bekommt `resolved_at`.
- Keine Reminder-Logs.
- Keine Heartbeat-Historie.
- Keine DB-Schreibvorgänge pro Heartbeat, sondern nur pro Monitoring-Issue-Scan auf Issue-Ebene.

## Betroffene Dateien

- `backend/modules/overlay_monitor.js`
- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`

## Neue API

```text
GET /api/overlay-monitor/issues?status=all&limit=150
GET /api/overlay-monitor/issues?status=active
GET /api/overlay-monitor/issues?status=resolved
```

## Neue Tabelle

```text
monitoring_issues
```

Felder:

```text
id
issue_key
scope
target_type
target_name
severity
status
first_seen_at
last_seen_at
resolved_at
seen_count
message
resolved_message
details_json
```

## Nicht enthalten

- keine Reparaturbuttons
- kein Cache-Refresh
- keine Auto-Reparatur
- keine Reminder
- keine Heartbeat-Historie
- keine OBS-Schreibaktion
