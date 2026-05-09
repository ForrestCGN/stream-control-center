# NEXT STEPS – STEP206 Alert TTS

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Deploy:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: dispatch alert tts after alert sound"
```

3. Backend neu starten, falls stepdone das nicht macht.
4. Test ausfuehren:

```powershell
.\tools\test_step206_alert_tts_dispatch.ps1
```

5. Danach pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=5" | ConvertTo-Json -Depth 40
```

6. Wenn Ko-fi/Tipeee funktionieren, optional TTS fuer Bits/Resub gezielt pro Regel aktivieren.
