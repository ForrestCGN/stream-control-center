# NEXT_STEPS

1. STEP464-ZIP nach `D:\Git\stream-control-center` entpacken.
2. `node --check backend\modules\clip_shoutout.js` ausführen.
3. `stepdone.cmd` ausführen.
4. Backend neu starten.
5. Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,command,officialChatMessagesMuted
```

6. Streamtag-Limit testen:

```text
!vso @urlug
!vso @urlug
!vso @urlug --force
```

7. Timeline prüfen:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline?limit=20"
$t.items | Select-Object id,targetLogin,streamDayId,overrideUsed,displayStartedAt,displayFinishedAt,officialSentAt,officialResult
```
