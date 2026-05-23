# NEXT STEPS

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Backend neu starten/deployen.
3. Status prüfen:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/sound/media-bridge/status
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
```

4. Im Dashboard einen Test-Command anlegen, z. B. `!skate` mit Action-Typ `MP3 / Sound abspielen` und Medium `Udos_Skatebord`.
5. Praxischeck ausführen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-command-check?trigger=skate"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/test?message=!skate&user=forrestcgn&role=mod"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute?message=!skate&user=forrestcgn&role=mod"
```

Danach: STEP275/275A planen – Media-Hub für weitere Module wie Alerts, VIP, Birthday, Rewards nutzbar machen.
