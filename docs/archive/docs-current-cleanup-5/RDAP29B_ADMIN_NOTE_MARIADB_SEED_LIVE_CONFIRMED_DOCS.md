# RDAP29B_ADMIN_NOTE_MARIADB_SEED_LIVE_CONFIRMED_DOCS

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-/Projektstatus-Korrektur nach Live-Seed

---

## 1. Zweck

RDAP29B dokumentiert die live bestaetigte RDAP29-Validierung fuer Admin-Notizen im Remote-Modboard.

Wichtig: RDAP29 wurde urspruenglich als SQL-/Doku-Step vorbereitet. Beim Live-Check wurde festgestellt, dass der vorbereitete Seed-Kontext nicht exakt zum Live-Stand passte:

```text
Live-DB: MariaDB
DB-Name: c3stream_control
Tabelle: dashboard_user_admin_notes
Nicht genutzt: SQLite
Nicht korrekt fuer Live: admin_user_notes
```

Der Live-Seed wurde deshalb kontrolliert manuell gegen die echte MariaDB-Tabelle ausgefuehrt.

---

## 2. Live-DB-Befund

Auf dem Webserver wurde bestaetigt:

```text
EnvironmentFile: /etc/stream-control-center/remote-modboard.env
DB_HOST: localhost
DB_PORT: 3306
DB_NAME: c3stream_control
DB_USER: c1stream_control
DB_ENGINE: MariaDB 11.8.6
```

Die `.env`/Environment-Datei enthaelt Secrets und darf nicht ins Repo und nicht unmaskiert in Chats/Dokus.

Die echte Tabelle fuer Admin-Notizen lautet:

```text
dashboard_user_admin_notes
```

Schema:

```text
id                  bigint unsigned auto_increment primary key
note_uid            varchar(96) unique not null
target_user_uid     varchar(64) not null
note_text           text not null
status              varchar(32) not null default active
created_by_user_uid varchar(64) null
updated_by_user_uid varchar(64) null
created_at          datetime not null default current_timestamp
updated_at          datetime not null default current_timestamp on update current_timestamp
```

Vor dem Seed:

```text
note_count = 0
```

---

## 3. Zieluser

ForrestCGN wurde in der Live-DB bestaetigt:

```text
user_uid: tw:127709954
display_name: ForrestCGN
login_name: forrestcgn
status: active
```

Auch in `dashboard_identities` bestaetigt:

```text
provider: twitch
provider_user_id: 127709954
provider_login: forrestcgn
provider_display_name: ForrestCGN
is_primary: 1
```

---

## 4. Ausgefuehrter Live-Seed

Der Seed wurde manuell per MariaDB ausgefuehrt.

Eingefuegte Testnotiz:

```text
note_uid: rdap29-test-note-forrestcgn-readonly-validation
target_user_uid: tw:127709954
status: active
created_by_user_uid: tw:127709954
updated_by_user_uid: tw:127709954
```

Notiztext:

```text
RDAP29 Test-Notiz: Diese Notiz wurde kontrolliert per MariaDB-Seed angelegt, damit die read-only Admin-Notiz-UI echten Inhalt anzeigen kann. Keine UI-Schreibfunktion, keine Write-Permission, keine produktiven Schreibbuttons.
```

Nach dem Seed:

```text
note_count = 1
```

Read-Back:

```text
id: 1
note_uid: rdap29-test-note-forrestcgn-readonly-validation
target_user_uid: tw:127709954
status: active
created_by_user_uid: tw:127709954
updated_by_user_uid: tw:127709954
created_at: 2026-06-25 08:55:09
updated_at: 2026-06-25 08:55:09
```

---

## 5. Browser-Test

Browser-Test unter:

```text
https://mods.forrestcgn.de
Admin -> Admin-Notizen
```

Bestaetigtes Ergebnis:

```text
ForrestCGN / tw:127709954
1 Admin-Notiz(en) read-only geladen.
rdap29-test-note-forrestcgn-readonly-validation
Status: active
Test-Notiz sichtbar
Keine Schreibbuttons sichtbar
```

Damit ist die read-only Anzeige mit echtem DB-Inhalt bestaetigt.

---

## 6. Sicherheitsgrenzen

Weiterhin nicht aktiv:

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

Die Read-Route bleibt read-only.

---

## 7. Backup-Hinweis

Vor produktiven weiteren DB-Schritten muss immer ein Backup erstellt und sichtbar geprueft werden.

Fuer RDAP29 wurde ein Backup-Check angewiesen:

```bash
sudo ls -lah /opt/stream-control-center/_db_backups
```

Falls kein valides Backup vorhanden ist, soll nachtraeglich mindestens die betroffene Tabelle gesichert werden:

```bash
sudo mysqldump --defaults-extra-file=/root/rdap29_mysql_client.cnf \
  c3stream_control dashboard_user_admin_notes \
  > /opt/stream-control-center/_db_backups/rdap29_dashboard_user_admin_notes_after_live_seed_$(date +%Y%m%d_%H%M%S).sql
```

Backups und DB-Dumps duerfen nicht ins Repo.

---

## 8. Korrektur zur RDAP29-Datei

Die Datei `docs/current/RDAP29_ADMIN_NOTE_TEST_SEED_READONLY_VALIDATION.md` wurde in RDAP29B korrigiert, damit sie den echten Live-Stand dokumentiert:

```text
MariaDB statt SQLite
Tabelle dashboard_user_admin_notes
note_uid mit Bindestrichen wie live verwendet
created_by/updated_by = tw:127709954
Live-Seed bereits bestaetigt
```

Die alte/urspruengliche SQLite-Annahme gilt nicht als Live-Wahrheit.

---

## 9. Naechster sinnvoller Schritt

Naechster fachlicher Schritt:

```text
RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN
```

RDAP30 soll nur planen, nicht direkt produktiv schreiben.

Zu klaeren:

```text
Welche Rollen duerfen Admin-Notizen schreiben?
Permission admin.users.note.write
Confirm-Write-Pflicht
Audit-Payload
Lock-Scope
Read-Back nach Write
Fehler-/Abbruchfaelle
UI-Schreibbuttons erst nach separatem Go
Rollback-/Backup-Regel
```
