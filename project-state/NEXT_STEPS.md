# NEXT_STEPS

## Direkt nach STEP273B

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Hook-Script ausführen:

```bat
cd D:\Git\stream-control-center
node tools\easy\STEP273B_APPLY_DASHBOARD_COMMANDS_HOOK.cjs
```

3. Syntax prüfen:

```bat
node --check htdocs\dashboard\modules\commands.js
node --check tools\easy\STEP273B_APPLY_DASHBOARD_COMMANDS_HOOK.cjs
```

4. Commit/Deploy:

```bat
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP273B Commands Dashboard"
```

5. Nach Backend-Neustart prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

6. Dashboard öffnen:

`http://127.0.0.1:8080/dashboard`

Community → Commands testen.

## Danach sinnvoll

- STEP273C: Twitch-Presence Auto-Start/Autoreconnect sauber planen.
- STEP273D: weitere Commands aus Streamer.bot migrieren.
- STEP273E: Dashboard-UX nach Praxistest verfeinern.

## Nicht ohne eigenen Step

- Streamer.bot-Commands entfernen.
- Weitere Module automatisch migrieren.
- Rechte-/Rollensystem hart umbauen.
- Datenbank neu bauen oder ersetzen.
