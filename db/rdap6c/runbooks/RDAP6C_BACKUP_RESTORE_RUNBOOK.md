# RDAP6C Backup / Restore Runbook

Stand: 2026-06-23

## Zweck

Dieses Runbook beschreibt die Vorbereitung vor einer spaeteren produktiven Migration.

## Pflicht vor Produktivlauf

1. Produktive DB eindeutig identifizieren.
2. DB-Name und User aus Server-Env pruefen.
3. Backup-Ziel ausserhalb Webroot festlegen.
4. MariaDB-Dump erstellen.
5. Dump-Groesse pruefen.
6. Restore in separater Testdatenbank pruefen.
7. RDAP6C-Schema zuerst gegen Testdatenbank ausfuehren.
8. Validation Queries ausfuehren.
9. Erst danach separates Go fuer produktive Migration.

## Sicherheitsregeln

- Keine Passwoerter in Shell-History schreiben.
- Keine Dumps ins Repo legen.
- Keine Dumps in oeffentliche Webpfade legen.
- Test-Restore nur in separater Testdatenbank.
- Produktivlauf erst nach dokumentiertem Restore-Test.

## Abbruch

Sofort abbrechen, wenn:

- DB-Name unklar ist.
- Backup nicht erstellt wurde.
- Restore-Test fehlt.
- `sound_profi` als Rolle erscheint.
- produktive Tabelle unerwartet geaendert wuerde.
