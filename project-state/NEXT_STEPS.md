# NEXT_STEPS

## Direkt nach STEP273A1

1. Syntax pruefen:

```bat
node --check backend\modules\commands.js
```

2. Backend neu starten.

3. API testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute?message=!dcount%20show&user=forrestcgn&role=mod"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/logs?limit=10"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/history?limit=10"
```

4. Danach echter Twitch-Chat-Test:

```text
!dcount show
```

## Danach

### STEP273B – Dashboard Commands

- Dashboard-Modul `commands` aktivieren.
- Commands anzeigen, bearbeiten, aktivieren/deaktivieren.
- Aliase, Rechte und Cooldowns verwalten.
- Logs anzeigen.
- Testausfuehrung aus dem Dashboard.
