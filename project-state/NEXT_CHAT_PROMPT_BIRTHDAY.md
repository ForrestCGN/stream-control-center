# NEXT CHAT PROMPT – Birthday-System

Wir arbeiten am Birthday-System im `stream-control-center`.

Wichtig:
Der echte Stand ist nicht „noch nicht implementiert“, sondern:

```text
STEP_BIRTHDAY_006E – Birthday Command Fallback Cleanup
```

Bereits vorhanden:
- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- `htdocs/overlays/_overlay-birthday.html`

Aktuelle Architektur:
```text
Twitch Chat
→ twitch_presence
→ commands.js
→ /api/birthday/command
→ birthday.js
→ helper_chat_output
```

Der Birthday-Chat-Hook bleibt nur für passive Auto-Gratulation aktiv und darf keine `!birthday` Commands parallel verarbeiten.

Nächster sinnvoller Schritt:
```text
STEP_BIRTHDAY_008 – Live-Test, Fehlerbereinigung und Dashboard-/Command-Abgleich
```

Bitte zuerst prüfen:
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

Dann nur wenn Heimleitung/Bot im Chat ist:
```text
!birthday help
!birthday set 16.08.1974
!birthday show
!birthday delete
```

Danach Dashboard und Overlay prüfen:
```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```

Keine Funktionalität entfernen. SQLite nur erweitern, nie ersetzen.
