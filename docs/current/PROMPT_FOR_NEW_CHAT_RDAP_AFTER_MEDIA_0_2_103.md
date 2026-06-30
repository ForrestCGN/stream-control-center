Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

Sprache: Deutsch, kurz, direkt, pragmatisch.

WICHTIG:
- GitHub/dev ist Wahrheit.
- Erst relevante Dateien wirklich lesen, dann Plan nennen, dann auf explizites `go` warten.
- Keine Code-/ZIP-Erstellung vor `go`.
- Keine Funktionalitaet entfernen.
- Keine Mini-Steps ohne Not.
- Keine Patch-/Apply-/Regex-/Set-Content-/Append-Scripte.
- Wenn Dateien geaendert werden: aktuelle komplette Datei lesen und vollstaendige Ersatzdatei liefern.
- Keine neuen Module/Dateien ohne Not. Bestehende Struktur bevorzugen.
- UI ist fuer Mods gedacht: keine technischen Labels, keine DB-Begriffe, keine Developer-Diagnose in der Hauptansicht.
- CGN-Design beachten: dunkles Lila/Blau, Neon-Cyan/Violett, runde Panels, Glow/Chips, Glassmorphism. Keine weissen Browser-Standard-Dropdowns.

Repository:
- GitHub: `ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Remote-Modboard intern Webserver: `http://127.0.0.1:3010`
- Remote-Modboard live: `https://mods.forrestcgn.de/`
- Webserver-Pfad: `/opt/stream-control-center`
- Webserver laeuft als root, also kein `sudo`.

Aktueller Stand:

```text
0.2.103 - Local Media Picker Alignment Plan
```

0.2.103 ist ein Doku-/Plan-Step:
- keine Runtime-Code-Datei geaendert,
- kein Backend geaendert,
- keine DB-Migration,
- keine Writes,
- keine Gates,
- keine Agent-Aktion.

Online-Media-Picker ist seit 0.2.101 live ok:
- bestehende Media-Seite nutzt `/api/remote/media/index/context/list`,
- Pagination ueber `limit` und `offset`,
- UI modfreundlich formuliert,
- Dropdowns im CGN-Look.

Wichtige Mod-Begriffe:

```text
Bereich
Ordner
Dateityp
Anzahl
Anzeigen
Filter zuruecksetzen
```

In der Mod-Hauptansicht vermeiden:

```text
Root
Kind
Full Category
Kontext-API
remote_media_index
DB
Writes
Agent-Diagnose
absolute Pfade
```

Naechster sinnvoller Step:

```text
RDAP_0.2.104_LOCAL_MEDIA_PICKER_READONLY_ALIGNMENT
```

Ziel:
- lokale Media-Picker-Angleichung read-only vorbereiten/umsetzen,
- lokale Dashboard-/Agent-Struktur gegen Online-Media-Picker abgleichen,
- keine zweite lokale UI-Logik bauen,
- lokale Datenquelle nur read-only,
- keine Online->Agent Dateiaktion,
- keine Upload/Edit/Delete-Aktion.

Vor Planung/Code zuerst lesen:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_0.2.103_LOCAL_MEDIA_PICKER_ALIGNMENT_PLAN.md
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
server.js
htdocs/dashboard-v2/assets/modules/media/library.js
htdocs/dashboard-v2/assets/remote-modboard.css
htdocs/dashboard-v2/assets/modules/module-manifest.js
```

Dann kurzen Plan nennen und auf `go` warten.
