# RDAP6D Test-DB Execution Runbook

Stand: 2026-06-23

## Ziel

Kontrollierter Testlauf der RDAP6C-Schema- und Seed-Dateien auf einer separaten Testdatenbank.

## Nicht erlaubt

- keine produktive MariaDB verwenden
- keine produktive SQLite verwenden
- keine Auth aktivieren
- keine Sessions aktivieren
- keine Remote-Writes aktivieren
- keine Agent-Actions aktivieren
- keine OBS-/Sound-/Overlay-/Command-Steuerung aktivieren
- keine Secrets ins Repo, Frontend oder Chat schreiben

## Voraussetzungen

- Lokale Dateien aus RDAP6C sind vorhanden.
- Testdatenbankname ist eindeutig und unterscheidet sich von der Produktivdatenbank.
- Zugangsdaten werden lokal/serverseitig sicher verwendet und nicht dokumentiert.
- Backup-/Restore-Konzept ist bekannt, auch wenn dieser Step nur Testdatenbank ist.

## Ablauf

### 1. DB-Namen kontrollieren

Vor der Ausfuehrung schriftlich festhalten:

```text
Produktiv-DB: NICHT VERWENDEN
Test-DB: <test_db_name>
```

### 2. Testdatenbank anlegen

Die Testdatenbank muss leer oder bewusst fuer diesen Test vorgesehen sein.

### 3. RDAP6C Schema anwenden

Datei:

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
```

### 4. RDAP6C Seeds anwenden

Datei:

```text
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
```

### 5. Validation Queries anwenden

Datei:

```text
db/rdap6c/checks/rdap6c_validation_queries.sql
```

### 6. Ergebnis dokumentieren

Vorlage:

```text
db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md
```

## Abbruchkriterien

Sofort stoppen, wenn:

- die Produktivdatenbank ausgewählt wurde
- `sound_profi` als Rolle erscheint
- `sound_profi` globale Rollenrechte hat
- SQL-Fehler bei Tabellenanlage auftreten
- unerwartete bestehende Daten betroffen sind
- Zugangsdaten versehentlich in Log/Chat/Repo gelandet sind

## Erwartetes Endergebnis

- Tabellen aus RDAP6C sind vorhanden.
- Rollen enthalten `owner`, `admin`, `lead_mod`, `mod`, `media_manager`, `readonly`.
- Rollen enthalten kein `sound_profi`.
- Gruppen enthalten `sound_profi` als `group_marker`.
- `sound_profi` vergibt allein keine Rechte.
- `dashboard_module_permissions` ist fuer spaetere Zielrechte vorbereitet.
