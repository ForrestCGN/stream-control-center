# NEXT_STEPS

## STEP470 einbauen

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Syntax prüfen:

```bat
node --check backend\modules\clip_shoutout.js
node --check htdocs\dashboard\modules\shoutout.js
```

3. Step abschließen:

```bat
.\stepdone.cmd "STEP470 Shoutout Dashboard Statistics"
```

4. Backend neu starten.
5. API prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats" | ConvertTo-Json -Depth 10
```

6. Dashboard hart neu laden und öffnen:

```text
http://127.0.0.1:8080/dashboard/
```

Dann `Community -> Shoutout-System` öffnen und Statistikbereich prüfen.

## Danach

- Live-Test bei aktivem Stream.
- Prüfen, ob Official-Live-Gate weiterhin `upstreamSource: twitch_api` nutzt.
- Später optional Statistik-Filter nach Streamtag ergänzen.
