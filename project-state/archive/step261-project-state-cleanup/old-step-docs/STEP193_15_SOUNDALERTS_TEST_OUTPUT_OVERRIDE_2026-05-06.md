# STEP193.15 - SoundAlerts Test Output Override

Stand: 2026-05-06

## Ziel

Eintraege sollen lokal getestet werden koennen, ohne ihr gespeichertes Ausgabeziel fuer den Produktivbetrieb umzuschalten.

## Aenderungen

### Backend

Datei: `backend/modules/soundalerts_bridge.js`

- Version auf `0.1.13` gesetzt.
- `/api/soundalerts/test/chat` akzeptiert optional `outputTarget`.
- `queueSound()` nutzt dieses Ausgabeziel nur fuer den aktuellen Testlauf.
- Das gespeicherte Mapping des Eintrags bleibt unveraendert.

### Dashboard

Dateien:

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`

Ergaenzt:

- `▶` = normaler Test mit gespeichertem Ausgabeziel.
- `🖥️` = Overlay-Test mit temporaerem `outputTarget=overlay`.
- Hinweis im Editor aktualisiert.

## Keine Aenderung

- Keine DB-Schemaaenderung.
- Keine Entfernung bestehender Funktionen.
- Keine Aenderung an produktiven Entry-Daten durch Overlay-Test.

## Test

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod -Method Post -Uri "http://127.0.0.1:8080/api/soundalerts/test/chat" -ContentType "application/json; charset=utf-8" -Body (@{ text = "ForrestCGN löst Airhorn mit 0 Bits aus"; outputTarget = "overlay" } | ConvertTo-Json) | ConvertTo-Json -Depth 30
```

Dashboard-Test:

1. Lokales Overlay oeffnen.
2. SoundAlerts > Eintraege.
3. Eintrag mit Datei ueber `🖥️` testen.
4. Audio/Video muss im Overlay ankommen, ohne dass der Eintrag dauerhaft auf Overlay umgestellt wird.
