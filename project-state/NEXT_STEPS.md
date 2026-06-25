# NEXT_STEPS

Stand: RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
```

Ziel:

```text
Sanfte Migration fuer dashboard_audit_log vorbereiten.
Keine produktiven Writes.
Keine Admin-Notiz-Writes.
Keine UI-Schreibbuttons.
```

## RDAP35 Pflicht

```text
Backup dashboard_audit_log erstellen.
Backup-Datei existiert und ist nicht 0 Byte.
INFORMATION_SCHEMA read-only pruefen.
SQL nur fuer fehlende Spalten vorbereiten.
Keine bestehende Spalte loeschen/umbenennen.
Keine Daten veraendern.
Nach Migration Read-Back pruefen.
RDAP33 Route erneut pruefen.
Writes bleiben weiter blockiert.
```

## Danach

```text
RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED
```

Erst nach erfolgreicher Migration.
