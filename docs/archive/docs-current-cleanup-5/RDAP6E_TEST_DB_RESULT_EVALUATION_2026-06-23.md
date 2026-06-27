# RDAP6E Test-DB Result Evaluation

Stand: 2026-06-23
Status: bestanden, keine Produktivfreigabe

## Zweck

Diese Datei dokumentiert die Auswertung des RDAP6D-Testdatenbanklaufs auf dem Webserver `web.cgn.community`.

RDAP6E ist eine Auswertung. Dieser Step aktiviert keine Authentifizierung, keine Sessions, keine Remote-Writes und keine produktiven Agent-Actions.

## Quelle / Testlauf

Der Testlauf wurde auf dem Webserver im Testordner ausgefuehrt:

```text
/root/rdap6-test/stream-control-center
```

Verwendete Datenbank:

```text
scc_rdap6_test
```

Die Datenbank wurde fuer den RDAP6-Testlauf verwendet. Die Ergebnisdatei auf dem Server liegt hier:

```text
_tmp/rdap6d_webserver_test_output/RDAP6D_TEST_RESULT_FILLED.md
```

## Ausgefuehrte Dateien

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
```

## Ergebnis

```text
Schema erfolgreich: ja
Seeds erfolgreich: ja
Validation Queries erfolgreich: ja
RDAP6D Testdatenbanklauf bestanden: ja
Produktivlauf freigegeben: nein
```

## Validation Output - wichtige Werte

```text
sound_profi_role_count = 0
sound_profi_group_marker_count = 1
sound_profi_role_permission_count = 0
module_permission_table_rows = 0
session_rows = 0
lock_rows = 0
audit_rows = 0
```

## Bewertung

Der Testlauf bestaetigt:

- `sound_profi` ist keine Rolle.
- `sound_profi` ist als Gruppe/Marker vorhanden.
- `sound_profi` vergibt selbst keine Rechte.
- Rollen, Gruppen, Permission-, Modulmatrix-, Session-, Lock- und Audit-Tabellen koennen angelegt werden.
- Die Modulmatrix existiert, enthaelt aber noch keine aktiven Eintraege.
- Es wurden keine Sessions, Locks oder Audit-Eintraege erzeugt. Das ist fuer diesen reinen Schema-/Seed-Test korrekt.

## Entscheidung

RDAP6D ist fuer die Testdatenbank bestanden.

Ein Produktivlauf ist mit dieser Datei ausdruecklich nicht freigegeben. Vor einem echten Produktivlauf sind weiterhin separat erforderlich:

- klares Ziel fuer die echte Server-Datenbank,
- Backup-/Restore-Plan,
- Entscheidung, ob `scc_rdap6_test` nur Test bleibt oder ob spaeter eine echte Dashboard-DB genutzt wird,
- separates `go` fuer den naechsten Implementierungsstep.

## Naechster sinnvoller Schritt

RDAP6F sollte kein weiterer Testlauf sein, sondern die Entscheidung/Planung, wie die Auth-/Rollen-/Gruppen-/Permission-Tabellen in die echte Webserver-Dashboard-Struktur eingebunden werden.

Vorschlag:

```text
RDAP6F_AUTH_DB_INTEGRATION_PLAN
```

Scope fuer RDAP6F:

- vorhandene MariaDB-/Webserver-Struktur pruefen,
- Ziel-DB fuer das Remote-Dashboard festlegen,
- minimale Backend-Anbindung planen,
- keine Auth-Aktivierung ohne Login-/Session-Konzept,
- `sound_profi` weiterhin nur Gruppe/Marker,
- Rechte weiterhin serverseitig pruefen.
