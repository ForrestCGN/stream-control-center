# CAN-44.11.1 Twitch Stream Debug/Fallback

## Ziel

Twitch-Live-Erkennung sauber prüfen, wenn OBS und Twitch-Webseite live zeigen, aber Helix `/streams` leer zurückgibt.

## Geänderte Datei

- `backend/modules/twitch.js`

## Version

- Twitch-Modul: `0.1.1`

## Änderungen

- `/api/twitch/stream?login=...` fragt jetzt beide offiziellen Helix-Varianten ab:
  - `/streams?user_id=...`
  - `/streams?user_login=...`
- Wenn beide leer sind, wird zusätzlich `/search/channels?query=...&live_only=true` geprüft.
- Search-Channels wird nur als markierter Fallback genutzt, wenn der exakt passende Kanal `is_live=true` meldet.
- Mit `debug=1` gibt die Route Diagnoseinformationen und Rohantworten zurück.
- `/api/twitch/stream/summary?login=...` nutzt dieselbe Vergleichs-/Fallback-Logik und zeigt `live_source`.

## Testbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/stream?login=forrestcgn&debug=1" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/stream/summary?login=forrestcgn&debug=1" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status?forceApi=1" | ConvertTo-Json -Depth 10
```

## Erwartung

- Wenn `/streams?user_id` oder `/streams?user_login` Daten liefert, bleibt das die primäre Quelle.
- Wenn nur Search-Channels live meldet, enthält der zurückgegebene Stream `_source: search_channels_fallback`.
- Wenn alles leer/falsch ist, zeigt `debug=1`, welche Twitch-Rohantworten tatsächlich kamen.
