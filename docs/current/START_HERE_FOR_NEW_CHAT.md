# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.12 - Agent-Executor Diagnose/Handshake vorbereitet`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Zugangsregel

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

## Brueckenregel

```text
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
Der Agent ist der zentrale Executor fuer Stream-PC-Aktionen.
Der Webserver ist die sichere Online-Tuer fuer Mods.
```

## Sync-Regel

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
Der lokale Stand wird ueber den Agent nachgezogen, sobald verbunden.
```

## Stand 0.2.12

0.2.12 erweitert den lokalen Remote-Modboard-Adapter um read-only Agent-Executor-Diagnose:

```text
GET /api/remote/local-dashboard/agent-executor/status
GET /api/remote/local-dashboard/agent-executor/handshake
```

Diese Routen lesen nur den vorhandenen lokalen Agent-Status aus `/api/remote-agent/status`. Es werden keine Agent-Kommandos angenommen oder ausgefuehrt.

Weiterarbeit: Erst 0.2.12 lokal testen/stepdone. Danach `0.2.13 - User/Rechte-Sync Statusmodell read-only vorbereiten`.
