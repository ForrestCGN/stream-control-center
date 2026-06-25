# RDAP_ADMIN_USERS18_ADMIN_NOTE_DISPLAY_SCOPE_PLAN

Stand: 2026-06-25
Projekt: `stream-control-center` / RDAP Remote-Modboard
Typ: Plan-/Scope-Step

## Ausgangslage

Bestaetigter Stand aus dem aktuellen Arbeitslauf:

```text
RDAP16: Tabelle `dashboard_user_admin_notes` wurde auf dem Webserver angelegt.
RDAP16 Diagnose danach: tableExists true, schemaReady true, migrationRequired false, rowCount 0.
RDAP17: Read-Diagnostic-Route funktioniert read-only.
RDAP17B: `/api/remote/routes` ist fuer `adminUserAdminNoteReadDiagnostic` synchronisiert.
Writes bleiben blockiert.
Die Read-Diagnostic gibt keine Notiztexte zurueck.
```

## Ziel von RDAP18

RDAP18 soll noch keine Admin-Notizen anzeigen, schreiben, aendern oder loeschen.

RDAP18 plant nur den spaeteren Display-Scope fuer Admin-Notizen im Remote-Modboard:

```text
Wer darf Admin-Notizen spaeter sehen?
Welche Permission ist noetig?
Welche Route darf echte Notiztexte liefern?
Wo koennte die Anzeige im Dashboard landen?
Welche Sicherheitsbedingungen muessen vorher erfuellt sein?
```

## Harte Schutzregel

Admin-Notizen sind interne Dashboard-/Modboard-Daten.
Sie duerfen niemals oeffentlich auf forrestcgn.de, .info oder Community-Profilseiten sichtbar werden.

Eine Community-Seite darf spaeter hoechstens anhand von Rollen/Rechten entscheiden, ob ein Dashboard-/Modboard-Link sichtbar ist. Sie darf keine Admin-Notizen oder internen Admin-Felder anzeigen.

## Empfohlener Anzeige-Scope

### Permission

```text
admin.users.note.read
```

Diese Permission ist fuer echte Anzeige von Notiztexten erforderlich.

### Getrennte Write-Permission

```text
admin.users.note.write
```

Lesen und Schreiben bleiben getrennt. Wer lesen darf, darf nicht automatisch schreiben.

### Zielgruppen

Empfohlene erste Freigabe spaeter:

```text
Owner: darf lesen
Admin: darf lesen, wenn Permission gesetzt ist
Boss-Mod/Lead-Mod: optional spaeter, nur mit expliziter Permission
Normaler Mod: erstmal nein
Sound-Profi/Spezialrolle: nein, ausser spaeter ausdruecklich gewuenscht
Viewer/User: nein
```

## Empfohlene spaetere Display-Route

Noch nicht in RDAP18 bauen, nur planen:

```http
GET /api/remote/admin/users/:userUid/admin-notes
```

oder zur bestehenden Struktur passend:

```http
GET /api/remote/admin/users/admin-note-display?targetUserUid=<user_uid>
```

Empfehlung fuer die erste echte Anzeige-Route:

```http
GET /api/remote/admin/users/admin-note-display?targetUserUid=<user_uid>
```

Begruendung:

```text
- passt zum bisherigen vorsichtigen Diagnose-/Query-Stil
- einfacher separat zu schuetzen
- kein REST-Write-Kontext
- leicht neben Read-Diagnostic testbar
```

## Pflichtbedingungen vor echter Notiztext-Anzeige

Eine Route, die echte Notiztexte liefert, darf erst gebaut/aktiviert werden, wenn alle folgenden Punkte eindeutig erfuellt sind:

```text
Auth aktiv und bestaetigt
Session eindeutig lesbar
User-Identitaet eindeutig vorhanden
Serverseitige Permission-Pruefung fuer admin.users.note.read vorhanden
Direkter API-Aufruf ohne Permission wird blockiert
Audit-Entscheidung fuer Anzeige geklaert
Notiztexte werden nicht in /api/remote/routes oder Diagnosen geleakt
Keine Notiztexte in oeffentlichen Logs
Keine Notiztexte in Community-Seiten
Keine Notiztexte in Browser-Konsole/Debug, wenn nicht erforderlich
```

## UI-Plan spaeter

Admin-Notizen sollen spaeter im User-Detailbereich des Admin-/User-Dashboards angezeigt werden.

Erste UI-Version nur Anzeige:

```text
User-Detailseite / Admin-User-Detail
Panel: Interne Admin-Notizen
Status: read-only
Hinweis: Nur fuer berechtigte Admins sichtbar
Keine Bearbeiten-/Speichern-/Loeschen-Buttons
Keine Schreibfelder
```

Wenn keine Permission vorhanden ist:

```text
Panel nicht anzeigen
oder neutral anzeigen: Keine Berechtigung fuer interne Admin-Notizen
```

Wenn keine Notizen vorhanden sind:

```text
Noch keine internen Admin-Notizen vorhanden.
```

## Weiterhin verboten in RDAP18

```text
Keine echte Display-Route mit Notiztexten bauen
Keine POST/PUT/PATCH/DELETE-Route
Keine Admin-Notiz schreiben
Keine Admin-Notiz aendern
Keine Admin-Notiz loeschen
Keine UI-Schreibbuttons
Keine DB-Migration
Keine Audit-Inserts
Keine Lock-Writes
Keine User-/Rollen-/Session-Aenderungen
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung
```

## Naechster moeglicher Fachstep nach RDAP18

Empfohlen:

```text
RDAP19_ADMIN_NOTE_DISPLAY_ROUTE_DISABLED_PLAN
```

oder noch vorsichtiger:

```text
RDAP19_AUTH_PERMISSION_READ_CHECK_FOR_ADMIN_NOTES
```

Empfehlung: zuerst Permission-/Auth-Pruefung fuer `admin.users.note.read` klaeren, bevor echte Notiztexte geliefert werden.

## Tests fuer spaetere Umsetzung

Wenn spaeter eine echte Anzeige-Route gebaut wird:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/users/admin-note-display?targetUserUid=test" | jq
```

Erwartung ohne Login/Permission:

```text
HTTP 401 oder 403
keine Notiztexte
```

Erwartung mit passender Permission spaeter:

```text
ok true
readOnly true
returnsNoteText true
writeEnabled false
productiveWritesEnabled false
writesStillBlocked true
```

## Ergebnis von RDAP18

RDAP18 ist erfolgreich, wenn dokumentiert ist:

```text
Admin-Notiz-Anzeige braucht admin.users.note.read
Community-Seiten duerfen Admin-Notizen nie anzeigen
Erste UI bleibt read-only ohne Schreibbuttons
Echte Notiztext-Ausgabe erst nach Auth/Permission
Writes bleiben weiter eigener spaeterer Scope
```
