# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.47 - Remote-Modboard Media UI Source Info Badge`.

## Verbindlich

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokal 8080 und Webserver 3010 strikt trennen.
Keine zweite lokale UI.
Keine Online-Sonder-UI.
Funktion geht vor: keine unnoetigen Mini-/Skelett-Steps.
```

## Harte Laufzeit-Trennung

```text
Lokal / Stream-PC:
- Port 8080
- lokale Schicht: backend/modules/local_remote_modboard_adapter.js
- lokale Datei-/Media-Wahrheit

Webserver / Remote-Modboard:
- Port 3010
- Live-Pfad: /opt/stream-control-center/remote-modboard
- kein Git-Repo im Live-Pfad
- Online-DB ueber remote-modboard config/db/db-health und MariaDB/mysql2

Deploy:
- Quelle ist frischer Clone unter /opt/stream-control-center/_deploy_tmp/<STEP>
- Live-Pfad nicht fuer git pull benutzen
```

## Bisheriger Stand kurz

```text
0.2.40: remote_media_index wurde nach explizitem go migration auf dem Webserver angelegt. row_count=0.
0.2.42: /api/remote/media/status?db=1 liest Schema/COUNT read-only.
0.2.43: 0.2.42 deployed und read-only bestaetigt.
0.2.44: Plan fuer spaetere read-only Nutzung von remote_media_index.
0.2.45: Schlanker Plan fuer spaetere Quelle/Fallback-Statusstruktur. Funktion geht vor.
0.2.46: sourceInfo in bestehender Media-Route vorbereitet. Kein neuer Endpoint, keine DB-Item-Reads, keine Writes.
```

## 0.2.47 Ergebnis

```text
Sichtbarer UI-Step in bestehender Media-Seite.
Kein neues Modul.
Kein neuer Endpoint.
Route bleibt: /api/remote/media/status.
Neu sichtbar: Quelle/Agent/DB/Fallback/Writes aus sourceInfo.
UI ruft kein ?db=1 auf.
Agent-Memory bleibt primaere Online-Wahrheit.
Fallback bleibt aus.
Writes bleiben aus.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
```

Step-Doku:

```text
docs/current/RDAP_0.2.47_REMOTE_MODBOARD_MEDIA_UI_SOURCE_INFO_BADGE.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.47_SERVER_DEPLOY_AND_UI_READBACK
```

Nach lokalem Abschluss und GitHub/dev-Push: Webserver-Deploy, API-Readback von `.sourceInfo` und Browser-Check im Media-System.
