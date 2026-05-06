# STEP193.11.1 - SoundAlerts Parser Settings Serialization Fix

Stand: 2026-05-06

## Anlass

Nach STEP193.11 wurden die konfigurierbaren Parser-Formate in der Live-Config als Strings gespeichert:

```text
[object Object]
[object Object]
```

Dadurch konnte die Bridge keine Parser-Regex mehr anwenden und neue SoundAlerts liefen wieder auf `parse_failed`.

## Geaendert

- `soundalerts_bridge` Version auf `0.1.12` gesetzt.
- JSON-Settings mit Arrays aus Objekten werden nicht mehr zu Strings serialisiert.
- `parser.messageFormats` wird speziell normalisiert.
- Kaputte Werte wie `[object Object]` fallen automatisch auf die Default-Formate zurueck.
- Die bestehenden Standardformate bleiben erhalten:
  - `<user> spielt <sound> fuer <amount> <currency>`
  - `<user> loest <sound> mit <amount> <currency> aus`

## Nicht geaendert

- Keine DB-Schemaaenderung.
- Keine Dashboard-Aenderung.
- Keine Sound-System-Queue-Logik geaendert.
- Keine bestehende Funktionalitaet entfernt.

## Test

```text
node --check backend/modules/soundalerts_bridge.js
```

Live-Test nach Deploy:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/soundalerts/test/chat" `
  -ContentType "application/json; charset=utf-8" `
  -Body (@{ text = "ForrestCGN löst Test Neuer Parser Sound mit 0 Bits aus" } | ConvertTo-Json) |
  ConvertTo-Json -Depth 30
```

Erwartung: kein `parse_failed`; Soundname wird erkannt.
