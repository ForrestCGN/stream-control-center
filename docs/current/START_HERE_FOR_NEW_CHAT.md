# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.34B - Media Persistent Index Foundation Blocked Docs Fix`.

## Verbindlich

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokal 8080 und Webserver 3010 strikt trennen.
Keine zweite lokale UI.
Keine Online-Sonder-UI.
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
- keine lokale Repo-root-SQLite-Schicht
- Online-DB ueber remote-modboard config/db-health und MariaDB/mysql2

Deploy:
- Quelle ist frischer Clone unter /opt/stream-control-center/_deploy_tmp/<STEP>
- Live-Pfad nicht fuer git pull benutzen
```

## 0.2.34B Ergebnis

```text
0.2.34 war als DB-Foundation mit falscher DB-Schicht angesetzt.
0.2.34B blockiert diesen Ansatz sauber.
media-readonly.routes.js versucht nicht mehr, backend/core/database.js zu laden.
Persistent Index bleibt blocked/failsafe.
Keine DB-Migration.
Keine Media-Daten-Writes.
Route bleibt read-only ueber Agent-Memory/Local-Scan.
```

Step-Doku:

```text
docs/current/RDAP_0.2.34B_MEDIA_PERSISTENT_INDEX_FOUNDATION_BLOCKED_DOCS_FIX.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE
```

Nur planen, keine Migration, bis echte Remote-Modboard-MariaDB-DB-Schicht und Backup/Rollback geklaert sind.
