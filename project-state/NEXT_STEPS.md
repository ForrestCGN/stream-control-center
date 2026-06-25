# NEXT_STEPS - stream-control-center

Stand: RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC_LIVE_CONFIRMED  
Datum: 2026-06-25

## Erledigt / live bestaetigt

```text
RDAP16 Admin-Notiz-Tabelle dashboard_user_admin_notes angelegt
RDAP16 Diagnose: tableExists true, schemaReady true, migrationRequired false, rowCount 0
RDAP17 Admin-Notiz Read-Diagnostic read-only gebaut und live bestaetigt
RDAP17B Routenuebersicht fuer Admin-Notiz Read-Diagnostic synchronisiert und live bestaetigt
```

## Naechster sinnvoller Fachstep

```text
RDAP_ADMIN_USERS18_ADMIN_NOTE_DISPLAY_SCOPE_PLAN
```

RDAP18 soll zuerst nur planen, wie interne Admin-Notizen spaeter angezeigt werden duerfen.

Wichtige Punkte fuer RDAP18:

```text
Keine produktiven Writes
Keine Notiz-Erstellung
Keine Notiz-Aenderung
Keine Notiz-Loeschung
Keine UI-Schreibbuttons
Auth/Permission fuer echte Notiztext-Anzeige klaeren
Permission admin.users.note.read klaeren
Rollen Owner/Admin/Mod sauber trennen
Community-Seite darf Admin-Notizen niemals oeffentlich anzeigen
```

## Danach moeglich, aber getrennt

Erst nach RDAP18-Planung und separatem Go:

```text
RDAP_ADMIN_USERS19_ADMIN_NOTE_DISPLAY_READONLY
```

Dieser Step duerfte echte Notiztexte nur dann anzeigen, wenn Auth/Permission serverseitig sauber geklaert und dokumentiert sind.

## Admin-Notiz-Write bleibt spaeter getrennt

Ein echter Admin-Notiz-Write darf erst gebaut werden, wenn separat geplant und freigegeben ist:

```text
Permission admin.users.note.write
Confirm-Write Pflicht
Audit-Payload
Lock-Scope admin:user-note:<target_user_uid>
Read-Back-Pruefung
Backup/Rollback-Konzept
separates Go von Forrest
```
