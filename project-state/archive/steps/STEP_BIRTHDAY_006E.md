# STEP_BIRTHDAY_006E – Command Fallback Cleanup

## Ziel

Birthday-Commands sollen wieder ausschließlich über das zentrale Command-System laufen.

## Hintergrund

In STEP_BIRTHDAY_006C wurde ein zusätzlicher Birthday-Chat-Fallback eingebaut, weil `!birthday set 16.08.1974` im Chat scheinbar nicht reagierte.

Später stellte sich heraus:

```text
Heimleitung/Bot war nicht im Chat.
→ Twitch Presence empfing keine PRIVMSG.
→ Das Command-System bekam den Befehl gar nicht.
```

Der Fallback war also nicht notwendig und hätte langfristig doppelte Ausgaben verursachen können.

## Änderung

In `backend/modules/birthday.js` wurde der zusätzliche Command-Fallback entfernt/deaktiviert.

Jetzt gilt wieder:

```text
Twitch Chat
→ twitch_presence
→ commands.js
→ /api/birthday/command
→ birthday.js
→ helper_chat_output
```

## Weiterhin aktiv

Der Birthday-Chat-Hook bleibt für passive Chataktivität aktiv:

```text
User schreibt normal im Chat
→ Birthday-Modul prüft, ob heute Geburtstag
→ kleine Auto-Gratulation
→ optional Tagebuch-Eintrag
```

Der Hook darf aber keine `!birthday` Commands selbst parallel verarbeiten.

## Betroffene Dateien

```text
backend/modules/birthday.js
project-state/STEP_BIRTHDAY_006E.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Test

Nach Deployment:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
```

Erwartung:

```text
step = STEP_BIRTHDAY_006E
```

Chat-Command nur testen, wenn Heimleitung/Bot im Chat ist:

```text
!birthday set 16.08.1974
!birthday show
```

Presence prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

Starten:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/start" -Method POST -ContentType "application/json" -Body '{}'
```
