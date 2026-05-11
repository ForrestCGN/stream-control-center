# STEP033 - VIP Events-/Statistik-Basis

Stand: 2026-05-04

## Ziel

VIP-Ausloesungen sollen nicht nur ueber `vip_sound_daily_usage` begrenzt werden, sondern zusaetzlich als Event-Historie fuer spaetere Statistik, Audit und Dashboard-Auswertung gespeichert werden.

## Umsetzung

Geaendert:

- `backend/modules/vip_sound_overlay.js`
  - Version `1.7.9`
  - Schema-Version `vip_sound_overlay` auf `3`
  - neue Tabelle `vip_sound_events`
  - neue Event-Logging-Funktion fuer VIP-Command-Ergebnisse

Neue Tabelle:

- `vip_sound_events`

Gespeichert werden u. a.:

- Zeitpunkt
- Event-Key und Event-Type
- Actor / Target / User
- Soundtyp
- Source / Trigger
- VIP-RequestId
- Sound-System-RequestId
- Sounddatei / Soundpfad
- accepted / duplicate / override / dailyUsageWritten
- Fehlercode
- Chat-/Antworttext

Neue Routen:

- `GET /api/vip-sound/events`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`

Kompatibilitaetsrouten unter `/api/vip-sound-overlay/*` werden weiterhin mit registriert.

## Wichtig

- `vip_sound_daily_usage` bleibt fuer Tageslimit/Verbrauch bestehen.
- `vip_sound_events` ist fuer Historie, Statistik und spaeteres Dashboard.
- Bestehendes VIP-Verhalten wurde nicht geaendert.
- Keine SQLite-Datei wird committed oder ersetzt.

## Tests

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/db/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/events/recent" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/stats" | ConvertTo-Json -Depth 20
```

Erwartung:

- `version = 1.7.9`
- `schemaVersion = 3`
- `eventsTable = vip_sound_events`
- VIP-Events werden nach `!vip` geschrieben.
