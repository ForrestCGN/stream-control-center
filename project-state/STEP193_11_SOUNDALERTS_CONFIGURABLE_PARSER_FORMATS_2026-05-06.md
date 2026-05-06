# STEP193.11 - SoundAlerts konfigurierbare Parser-Formate

Stand: 2026-05-06

## Ziel

SoundAlerts-Chatformate sollen nicht mehr fuer jede kleine Textvariation fest im Parser-Code erweitert werden muessen.

## Geaendert

- `backend/modules/soundalerts_bridge.js` auf Version `0.1.11` gesetzt.
- Standard-Parser-Formate in `DEFAULT_PARSER_MESSAGE_FORMATS` ausgelagert.
- `parser.messageFormats` in `DEFAULT_CONFIG.parser` ergaenzt.
- `parser.messageFormats` als JSON-Setting in `SETTINGS_DEFINITIONS` ergaenzt.
- Parser nutzt jetzt die konfigurierten Formate mit Regex + Gruppen-Zuordnung.

## Standardformate

```text
<user> spielt <sound> fuer <amount> <currency>
<user> loest <sound> mit <amount> <currency> aus
```

Beispiele:

```text
ForrestCGN spielt Lily was here fuer 0 Bits!
ForrestCGN loest Airhorn mit 0 Bits aus
```

## Formatfelder

```text
id
enabled
pattern
flags
triggerGroup
soundGroup
amountGroup
currencyGroup
```

## Technische Regel

- Neue Chatformate zuerst ueber `parser.messageFormats` ergaenzen.
- Harte Parser-Code-Aenderungen nur noch, wenn Regex + Gruppen-Zuordnung nicht reicht.
- Keine DB-Schemaaenderung.
- Keine Dashboard-Aenderung.
- Keine Funktionalitaet entfernt.

## Test

```text
node --check backend/modules/soundalerts_bridge.js
```

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/test/chat?text=ForrestCGN%20l%C3%B6st%20Airhorn%20mit%200%20Bits%20aus" | ConvertTo-Json -Depth 30
```

Erwartung: `Airhorn` wird erkannt; kein `parse_failed`.
