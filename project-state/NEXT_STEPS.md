# NEXT STEPS

Nach STEP457:

1. `!so @testuser` lokal testen.
2. Prüfen, ob Clip-Anzeige startet.
3. Prüfen, ob nach Anzeige ein offizieller Shoutout in der Queue landet.
4. Auth-Status prüfen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/official/auth-status"
   ```
5. Falls `moderator:manage:shoutouts` fehlt, Twitch-OAuth-Scopes erweitern und neu autorisieren.

Spätere offene ToDo bleibt: Sound-System nach stabiler Bus-First-Phase ggf. auf `bus_only` prüfen.
