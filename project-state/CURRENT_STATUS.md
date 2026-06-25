# CURRENT_STATUS

Stand: RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Produktiv

```text
https://mods.forrestcgn.de/
```

## Aktueller bestaetigter RDAP-Status

RDAP25 bis RDAP28 sind funktional bestaetigt:

```text
RDAP25 Login/OAuth/Session funktioniert.
RDAP26 Option B DB-Rollen/Permissions funktioniert.
RDAP27 echte read-only Admin-Notiztext-Route ist live.
RDAP28 read-only Admin-Notiz-UI ist live.
```

RDAP29 ist live validiert:

```text
MariaDB-Seed erfolgreich
dashboard_user_admin_notes: 1 Eintrag
ForrestCGN / tw:127709954
Admin-Notiz wird read-only in der UI angezeigt
Keine Schreibbuttons sichtbar
```

## Wichtige RDAP29B-Korrektur

Die Live-DB ist MariaDB, nicht SQLite:

```text
DB_ENGINE: MariaDB 11.8.6
DB_NAME: c3stream_control
Tabelle: dashboard_user_admin_notes
```

Die urspruengliche SQLite-Annahme aus RDAP29 gilt nicht als Live-Wahrheit.

## Bestaetigter Testinhalt

```text
note_uid: rdap29-test-note-forrestcgn-readonly-validation
target_user_uid: tw:127709954
status: active
created_by_user_uid: tw:127709954
updated_by_user_uid: tw:127709954
```

Browser bestaetigt:

```text
1 Admin-Notiz(en) read-only geladen.
Test-Notiz sichtbar.
Keine Schreibbuttons sichtbar.
```

## Weiterhin nicht aktiv

```text
Admin-Notiz schreiben
Admin-Notiz aendern
Admin-Notiz loeschen
Permission admin.users.note.write
UI-Schreibbuttons
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Audit-Inserts oder Audit-Updates ueber Dashboard
Lock acquire/heartbeat/release/force-takeover
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```

## Naechster sinnvoller Schritt

```text
RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN
```

RDAP30 soll den Write-Scope planen, aber noch keine produktive Schreibfunktion bauen.
