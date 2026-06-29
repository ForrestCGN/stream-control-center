# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.35 - Remote-Modboard MariaDB Media Index Plan No Code`.

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
- darf echte lokale Assets lesen

Webserver / Remote-Modboard:
- Port 3010
- Live-Pfad: /opt/stream-control-center/remote-modboard
- kein Git-Repo im Live-Pfad
- keine lokale Repo-root-SQLite-Schicht
- Online-DB ueber remote-modboard config/db-health und MariaDB/mysql2
- darf keine Stream-PC-Dateipfade oder Datei-Inhalte speichern

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

## 0.2.35 Ergebnis

```text
0.2.35 ist ein No-Code Architekturplan.
Er legt fest: ein spaeterer Online-Media-Index darf nur ueber die bestehende Remote-Modboard-MariaDB-Schicht geplant werden.
Keine Runtime-Dateien geaendert.
Keine Migration.
Keine DB-Writes.
Keine Upload/Edit/Delete-Funktion.
```

Step-Doku:

```text
docs/current/RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.36_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_SCHEMA_DRY_RUN_PLAN
```

Nur planen/diagnostizieren, keine Migration, bis Backup/Rollback, Tabellenmodell, Rechte und Confirm-Gates bestaetigt sind.
