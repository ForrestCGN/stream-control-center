# NEXT STEPS

## Direkt nach HT3.1

1. Overlay mit Debug öffnen:

```text
http://127.0.0.1:8080/overlays/hypetrain/hypetrain_overlay.html?debug=1
```

2. Backend-Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" | Select-Object moduleVersion,moduleBuild
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/overlay/status" | ConvertTo-Json -Depth 5
```

3. Erwartung:

```text
moduleVersion = 0.2.1
moduleBuild = STEP_HT3_1_HYPETRAIN_OVERLAY_REGISTER_HEARTBEAT
overlay.registered = true
overlay.connected = true
overlay.lastHeartbeatAt ist gesetzt
```

## Danach

- Dashboard-Konfiguration für HypeTrain-Event-Sounds planen.
- Media-System-Auswahl verwenden, keine harte Dateipfad-Eingabe.
- Sound-System bleibt Playback-/Queue-Owner.
- Später echtes Overlay-Design/Animation getrennt bauen.
