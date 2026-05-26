# STEP273B – Commands Dashboard

## Ziel

Das Command-System aus STEP273A1 ist im Dashboard sichtbar und einfach verwaltbar.

## Geänderte Dateien

- `htdocs/dashboard/modules/commands.js`
- `htdocs/dashboard/modules/commands.css`
- `tools/easy/STEP273B_APPLY_DASHBOARD_COMMANDS_HOOK.cjs`
- `htdocs/dashboard/index.html` per Hook-Script
- `htdocs/dashboard/app.js` per Hook-Script
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Funktionen

- Command-Status anzeigen
- Twitch-Presence-Status anzeigen
- Presence starten/stoppen
- Commands anzeigen
- Commands speichern
- Commands aktivieren/deaktivieren
- Commands löschen
- neuen Command anlegen
- DryRun-Test ausführen
- echten Execute-Test ausführen
- Logs anzeigen

## Bewusst nicht geändert

- Kein Umbau von `backend/modules/commands.js`
- Kein Umbau von `twitch_presence.js`
- Keine bestehenden Dashboard-Module entfernt
- Keine Datenbank direkt ersetzt oder überschrieben
- Keine Streamer.bot-Kommandos entfernt

## Tests

Nach Entpacken:

```bat
cd D:\Git\stream-control-center
node tools\easy\STEP273B_APPLY_DASHBOARD_COMMANDS_HOOK.cjs
node --check htdocs\dashboard\modules\commands.js
node --check tools\easy\STEP273B_APPLY_DASHBOARD_COMMANDS_HOOK.cjs
```

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

Dashboard öffnen:

`http://127.0.0.1:8080/dashboard`

Dann Community → Commands öffnen.
