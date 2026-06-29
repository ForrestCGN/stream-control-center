# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.48 - Remote-Modboard Media Mod View Cleanup Handoff Docs`.

## Pflichtkontext zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_MEDIA_MOD_VIEW_CLEANUP.md
```

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

## 0.2.47B Ergebnis

```text
Media-UI Runtime-Fix ist aktiv.
Media-Seite rendert wieder sichtbar.
Agent-Memory ist aktiv.
Media-System zeigt Inventar, Media-Bereiche und sourceInfo.
Fallback/Writes bleiben aus.
Upload/Edit/Delete bleiben aus.
```

## 0.2.48 Ergebnis

```text
Doku-/Handoff-only.
Problem dokumentiert:
- normale Media-Seite zeigt zu viele technische Details fuer Mods.
- Agent/DB/Fallback/Writes/sourceInfo gehoeren nicht prominent in die Mod-Ansicht.
- technische Details sollen in Admin-/Diagnosebereich.

Nicht passiert:
- keine Runtime-Code-Aenderung
- kein Backend
- keine API-Aenderung
- keine DB-Item-Reads
- keine Writes
- kein Deploy
```

Step-Doku:

```text
docs/current/RDAP_0.2.48_REMOTE_MODBOARD_MEDIA_MOD_VIEW_CLEANUP_HANDOFF_DOCS.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_MEDIA_MOD_VIEW_CLEANUP.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.49_REMOTE_MODBOARD_MEDIA_MOD_VIEW_CLEANUP_ADMIN_DIAG_SPLIT
```

Ziel: normale Media-Mod-Ansicht enttechnisieren und Quelle/DB/Fallback/Writes in Admin-/Diagnosebereich verschieben oder dort vorbereiten. Keine Writes, keine DB-Item-Reads, kein Upload/Edit/Delete.
