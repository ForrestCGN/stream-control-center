# CURRENT_STATUS

Aktueller Stand: `0.2.119 - Local Logs Readonly API Design`

## Kurzfazit

Lokale Logs-read-only-API ist konkret designt, aber noch nicht gebaut.

```text
Admin -> Logs
```

Die Logs-Hauptansicht bleibt sauber und bestaetigt.

## Aktueller Logs-Stand

```text
Remote-Modboard aktiv
Lokal / Stream-PC vorbereitet, noch keine API
```

## 0.2.119 Ergebnis

```text
bestehende Agent-/Status-Struktur geprueft
/api/remote/agent/status als read-only Design-Anker erkannt
Agent Runtime / WSS / Heartbeat-In-Memory beruecksichtigt
OBS-/Media-read-only Routen als vorhandene Muster beruecksichtigt
Route-Design fuer lokale Logs festgelegt
Antwortformat und Offline-Verhalten festgelegt
Folgeschritt fuer API-Skeleton vorbereitet
```

## Geplante lokale Logs API fuer spaeter

```text
GET /api/remote/local/logs/status
GET /api/remote/local/logs/list
```

## Wichtig

```text
0.2.119 ist Doku-only
keine Runtime-Aenderung
kein Deploy noetig
keine lokale API gebaut
keine UI aktiviert
keine Writes
keine Loeschung
keine Migration
keine Agent-Actions
keine lokalen Steueraktionen
keine OBS-/Sound-/Overlay-Steuerung
```

## Deploy-Regel

Nur bei spaeteren Code-/Remote-Modboard-Aenderungen:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh <STEP_NAME> dev
```
