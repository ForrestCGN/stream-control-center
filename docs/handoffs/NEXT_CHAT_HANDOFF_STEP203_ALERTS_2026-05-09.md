# NEXT CHAT HANDOFF – STEP203 Alerts

Stand: 2026-05-09

## Projekt

Repo: `ForrestCGN/stream-control-center`  
Branch: `dev`  
Repo lokal: `D:\Git\stream-control-center`  
Live: `D:\Streaming\stramAssets`

## Zuletzt gebaut

`STEP203 – Alert Provider Safety Fix`

## Wichtigste Änderungen

- `backend/modules/tipeee.js`
  - Tipeee-Twitch-Spiegelungen werden vor Forward/Enqueue geblockt.
  - Hauptmarker: `origin === "twitch"`.
  - Fallback: `ref` beginnt mit `TWITCH_`.
  - Defensiv: Twitch-Typen wie `cheer`, `raid`, `follow`, `sub`, `resub`, `subscription`, `gift`, `gifted_subscription`.
  - Ignored Provider-Events werden mit `ignored_twitch_mirror` dokumentiert.

- `backend/modules/alert_system.js`
  - `alertQueueGate()` blockiert Enqueue/Replays, wenn Alerts oder Queue aus sind.
  - Neue Route: `GET /api/alerts/events?limit=100`.
  - `/api/alerts/status.history` Fallback von 10 auf 50 erhöht.
  - RAM-History von 25 auf 100 erhöht.

- `backend/modules/twitch.js`
  - `resub` wird nicht mehr als `sub` gemappt.
  - `channel.subscription.gift` unterscheidet:
    - `gift_sub` bei total 1
    - `gift_bomb` bei total > 1
  - Gift-Meta wird im Raw-Payload erhalten.

- `htdocs/dashboard/modules/alerts.js`
  - Dashboard lädt `/api/alerts/events?limit=100`.
  - Letzte Alerts nutzen DB-History statt nur RAM-Status-History.
  - Labels für `gift_bomb`/Sub-Bombe ergänzt.

## Nach Entpacken ausführen

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "fix: filter mirrored provider alerts and improve alert history"
```

## Danach testen

```powershell
cd D:\Git\stream-control-center
.\tools\test_step203_alert_provider_safety.ps1
```

## Wichtig

Keine Funktionalität wurde entfernt. Keine Secrets/DB/ENV wurden geändert.
