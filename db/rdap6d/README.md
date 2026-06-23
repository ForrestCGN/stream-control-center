# RDAP6D Test-DB Execution Guide Package

Stand: 2026-06-23

Dieses Paket beschreibt den kontrollierten Testdatenbanklauf fuer RDAP6C.

Es fuehrt nichts automatisch aus und ist nicht fuer produktive DB-Ausfuehrung gedacht.

## Inhalt

- `db/rdap6d/runbooks/RDAP6D_TEST_DB_EXECUTION_RUNBOOK.md`
- `db/rdap6d/checks/RDAP6D_EXPECTED_RESULTS.md`
- `db/rdap6d/templates/RDAP6D_TEST_RESULT_TEMPLATE.md`
- `docs/current/RDAP6D_TEST_DB_EXECUTION_GUIDE_PACKAGE.md`

## Sicherheitsregeln

- Nur separate Testdatenbank verwenden.
- Kein Produktiv-DB-Name.
- Keine Passwoerter in Repo, Frontend oder Chat.
- Erst RDAP6C-Dateien lokal bereitstellen.
- Produktivlauf bleibt weiterhin gesperrt.
