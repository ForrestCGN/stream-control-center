# STEP193.10 - SoundAlerts Parser Format Fix

Stand: 2026-05-06

## Anlass

Live-Test zeigte, dass SoundAlerts-Chattexte im Format:

```text
ForrestCGN löst Airhorn mit 0 Bits aus
```

als `parse_failed` gespeichert wurden. Dadurch konnte kein neuer Auto-Eintrag für `Airhorn` angelegt werden.

Bisher erkannte der Parser nur das Format:

```text
ForrestCGN spielt Lily was here für 0 Bits!
```

## Geändert

Betroffene Datei:

```text
backend/modules/soundalerts_bridge.js
```

Änderungen:

- `soundalerts_bridge` Version auf `0.1.10` gesetzt.
- `parseSoundAlertsText()` erkennt weiterhin das alte Format `spielt ... für ...`.
- Zusätzlich erkennt der Parser jetzt das neue Format `löst ... mit ... aus`.
- Unterstützt einfache und quotierte Soundnamen, z. B. `Airhorn` und `"Airhorn XXL"`.
- Kein Dashboard-Umbau.
- Keine API-/DB-Schemaänderung.
- Keine bestehende Parser-Funktion entfernt.

## Erwartetes Ergebnis

Aus:

```text
ForrestCGN löst Airhorn mit 0 Bits aus
```

wird erkannt:

```json
{
  "triggerUserDisplay": "ForrestCGN",
  "soundAlertName": "Airhorn",
  "amount": 0,
  "currency": "Bits"
}
```

Wenn kein aktiver Eintrag existiert, soll die bestehende Auto-Entry-Logik wieder greifen und `Airhorn` als Eintrag unter `Zur Prüfung`/`Datei fehlt` anlegen.

## Tests lokal

```text
node --check backend/modules/soundalerts_bridge.js
parseSoundAlertsText("ForrestCGN spielt Lily was here für 0 Bits!") => Lily was here
parseSoundAlertsText("ForrestCGN löst Airhorn mit 0 Bits aus") => Airhorn
parseSoundAlertsText("ForrestCGN loest "Airhorn XXL" mit 15 Bits aus!") => Airhorn XXL
```

## Live-Test nach Deploy

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/test/chat?text=ForrestCGN%20l%C3%B6st%20Airhorn%20mit%200%20Bits%20aus" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/events?limit=5" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

## Offen

- Live prüfen, ob `Airhorn` nach dem neuen Format korrekt als Eintrag erscheint.
- Falls SoundAlerts weitere Textvarianten nutzt, Parser gezielt erweitern.
