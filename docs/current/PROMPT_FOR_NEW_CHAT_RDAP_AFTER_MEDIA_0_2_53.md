# PROMPT FOR NEW CHAT - RDAP after Media 0.2.53

Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

## Wahrheit

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Webserver-Pfad: /opt/stream-control-center
```

Erst GitHub/dev und relevante Dateien lesen, dann planen. Nicht aus Erinnerung arbeiten.

## Aktueller Stand

```text
0.2.53 - Media Sync Status and Index Foundation
```

0.2.53 hat noch keine produktiven DB-Writes gebaut. Es hat das Zielbild und den Status fuer vollstaendige Media-Synchronisierung vorbereitet:

```text
- Online-Media-Index soll persistent in MariaDB liegen.
- Lokal bleibt der Stream-PC die Datei-Wahrheit.
- Full-Sync soll alle validen Dateien in Chunks uebertragen.
- Delta-Sync soll spaeter Aenderungen uebertragen.
- Online -> Agent soll spaeter ueber eine Change Queue laufen.
- Media-UI zeigt Sync-Status/Fortschritt und Infofenster.
```

## Wichtige Erkenntnis

Der alte Agent-WSS-Compact-Transport ist auf 120 Items begrenzt. Das reicht fuer Mods nicht. Ein Komplett-Sync muss spaeter alle validen Dateien ausliefern, unabhaengig von der Anzahl.

## Naechster sinnvoller Step

```text
RDAP_0.2.54_MEDIA_INDEX_FULL_SYNC_TO_DB
```

## Ziel 0.2.54

```text
- Full-Sync Agent -> Online-DB in Chunks.
- Alle validen Media-Dateien werden uebertragen.
- Webserver speichert/aktualisiert remote_media_index kontrolliert in MariaDB.
- Remote-Modboard kann online aus DB lesen.
- Sync-Fortschritt bleibt sichtbar.
```

## Grenzen

```text
Keine freien Dateipfade.
Keine Datei-Inhalte.
Keine absoluten Pfade.
Keine Upload/Edit/Delete fuer Mods.
Keine produktiven Media-Aktionen ohne Confirm/Audit/Permission.
Keine DB-Migration ohne separaten klaren Schritt und Readback-Test.
```

## Zu pruefende Dateien

```text
backend/modules/remote_agent.js
remote-modboard/backend/src/services/agent-runtime.service.js
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/routes/routes.routes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Workflow

```text
1. Erst Dateien aus GitHub/dev lesen.
2. Kurzen Plan nennen.
3. Auf explizites go warten.
4. ZIP mit echten Zielpfaden bauen, kein Wrapper.
5. Lokal installstep.cmd.
6. node --check / Tests / git status.
7. stepdone.cmd.
8. Erst danach Webserver-Deploy aus frischem Clone.
```
