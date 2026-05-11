# STEP260 - DeathCounter DB-Storage STABLE dokumentieren und Doku aufräumen

Stand: 2026-05-11

## Ziel

Den abgeschlossenen DeathCounter-DB-Umbau als stabilen Projektstand dokumentieren und die aktiven Doku-Einstiegspunkte bereinigen.

Dieser STEP ist ein reiner Dokumentations-/Aufräum-STEP.

## Bestätigter Live-Stand

DeathCounter V2 läuft produktiv über Datenbank-Storage.

```text
activeStorage: database
configuredStorage: database
fallbackStorage: json_backup_export_file
databaseReadable: true
dualWriteEnabled: false
jsonFallbackEnabled: true
```

Bestätigte Live-Tests:

```text
/api/deathcounter/v2/status                          OK
/api/deathcounter/v2/settings                        OK
/api/deathcounter/v2/storage/read-test               OK
/api/deathcounter/v2/storage/consistency             OK
/api/deathcounter/v2/integration-check               OK
/api/deathcounter/v2/storage/backup                  OK
/api/deathcounter/v2/storage/export?mode=export      OK
/api/deathcounter/v2/command?command=dcount&input0=backup&sendChat=0 OK
/api/deathcounter/v2/command?command=dcount&input0=export&sendChat=0 OK
```

Zusätzlich wurde ein echter Schreibtest erfolgreich bestätigt:

```text
/api/deathcounter/v2/rip?player=forrestcgn&delta=1   OK
/api/deathcounter/v2/del?player=forrestcgn&delta=1   OK
```

Danach war die Storage-Consistency weiterhin grün.

## Finaler DeathCounter-Storage-Stand

```text
Produktiv:
- readState(): DB-first
- updateState(): DB-only
- DeathCounter liest aus deathcounter_* Tabellen
- DeathCounter schreibt in deathcounter_* Tabellen

JSON:
- kein automatischer Dual-Write mehr
- deathcounter.v2.json bleibt als Export-/Backupformat erhalten
- !dcount backup erstellt Timestamp-Backup
- !dcount export schreibt Haupt-JSON aus DB neu und legt vorher Backup an
```

## Abgeschlossene DeathCounter-DB-STEPS

```text
STEP252: DB-Schema vorbereitet
STEP253: Storage-Preview read-only
STEP254: Import-Readiness-Validation read-only
STEP255: Guarded Import erfolgreich ausgeführt
STEP256: DB-vs-JSON Consistency Check
STEP257: DB Read-Test
STEP258: Active DB Storage mit Übergangs-Dual-Write
STEP259: DB-only produktiv + manueller JSON Backup/Export
STEP260: STABLE-Doku und Doku-Cleanup
```

## Aufräumen / Doku-Korrekturen

- Aktive Projektstatusdateien wurden auf den finalen STEP259/STEP260-Stand verdichtet.
- DeathCounter bekommt eine eigene stabile Current-Doku: `docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md`.
- `PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md` wurde wieder als vollständige Projektkarte geführt und um den finalen DeathCounter-Stand ergänzt.
- `PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md` wurde wieder als vollständige Route-Map geführt und um die DeathCounter-Storage-Routen ergänzt.
- `PROJECT_DOCUMENTATION_MAP_2026-05-11.md` und `PROJECT_CLEANUP_PLAN_2026-05-11.md` wurden nachgezogen.

## Bewusst nicht gemacht

- Keine Code-Datei geändert.
- Keine DB-Datei geändert.
- Keine Runtime-Datei geändert.
- Keine `app.sqlite` ersetzt oder neu gebaut.
- Keine historischen STEP-/APPEND-/STATUS_NOTE-Dateien gelöscht.
- Keine Doku nach `htdocs` kopiert.
- Keine alten Analyse-Snapshots überschrieben.

## Bewertung

DeathCounter-Storage-Umbau gilt nach bestätigten Live-Tests als STABLE.

Weitere DeathCounter-Arbeit sollte nicht mehr am Storage-Grundsystem ansetzen, sondern nur noch gezielt an neuen Features wie Event-Logging, Dashboard-Ansicht oder Reporting.
