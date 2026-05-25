# NEXT STEPS – nach STEP455

## 1. Sound-System Overlay live beobachten

Ein normaler Sound, ein VIP-Sound und bei Gelegenheit ein Clip-/Video-Sound sollten sichtbar bzw. hörbar wie bisher funktionieren.

Wichtig:

- Kein Audio-Ausfall.
- Kein doppeltes Abspielen.
- Kein Fehler im Node-Fenster.
- Overlay bleibt verbunden.

## 2. Bus-Status prüfen

Optionaler Kurzcheck:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status" | ConvertTo-Json -Depth 8
```

## 3. Kein sofortiger Fallback-Abbau

Legacy-WebSocket und Polling bleiben vorerst bewusst aktiv.

Erst nach mehreren erfolgreichen Tests/Streams kann später geplant werden, ob Polling reduziert oder Legacy-WS nur noch als Reserve genutzt wird.

## 4. Möglicher späterer Schritt

Ein späterer STEP kann ein kleines Dashboard-/Statusfeld ergänzen, das zeigt:

- letzter Bus-Event
- letzte Sound-Quelle
- Queue-Status
- Overlay-Client verbunden
- letzte Fehler

Das ist aber nicht Teil von STEP455.
