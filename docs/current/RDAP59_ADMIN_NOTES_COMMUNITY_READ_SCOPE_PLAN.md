# RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN

Datum: 2026-06-26
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP59 klaert als reiner Plan-Step, ob und wie Admin-Notizen spaeter ausserhalb des Admin-Bereichs read-only sichtbar werden duerfen.

RDAP59 ist Doku-only / Plan-only.

Es wird nichts gebaut.

## Ausgangspunkt

Bestaetigter Stand nach RDAP58:

```text
Permission-Read-Detail-Strang ist vorerst abgeschlossen.
Keine weiteren Permission-Read-Polishes noetig.
Keine Permission-Writes direkt danach bauen.
Keine Rollen-/Gruppen-Schreibverwaltung direkt danach bauen.
Naechster empfohlener Step: RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.
```

Admin-Notes aktueller Funktionsstand:

```text
Admin -> User-Detail read-only funktioniert.
User-Auswahl funktioniert.
ForrestCGN @forrestcgn / tw:127709954 sichtbar.
Rollen/Gruppen/Sessions read-only sichtbar.
Bruecke User-Detail -> Admin-Notizen funktioniert.
Admin-Notizen oeffnen mit Zieluser-Kontext.
Admin-Notizen-Create ist bewusst vorbereitet/live.
```

Bestehende Admin-Notes-Routen liegen aktuell in:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
```

Nicht vorhanden unter GitHub/dev war beim RDAP59-Startcheck:

```text
remote-modboard/backend/src/routes/admin-users-admin-notes.routes.js
```

Die echte bestehende Route fuer Admin-Notes-Read bleibt:

```text
GET /api/remote/admin/users/admin-notes/read
```

Die bestehende Route ist ein Admin-Scope und bleibt darauf begrenzt.

## Aktuelle Sicherheitslage Admin-Notes-Read

Die bestehende Admin-Notes-Readroute ist read-only und verlangt:

```text
- gueltige Session
- DashboardAccess
- admin.users.note.read
- targetUserUid
```

Die Route gibt fuer berechtigte Admins echte Notiztexte zurueck.

Wichtig:

```text
communityPagesMayReadAdminNotes: false
```

Das ist weiterhin korrekt und bleibt unveraendert.

## Entscheidung RDAP59

Admin-Notizen bleiben vorerst Admin-only.

Community-/Nicht-Admin-Bereiche duerfen aktuell keine Admin-Notizen lesen.

Es wird keine Community-Read-Freigabe gebaut.

Es wird keine bestehende Admin-Readroute fuer Community-/Profil-/Public-Ansichten wiederverwendet.

## Begruendung

Admin-Notizen enthalten potentiell interne Moderations-, Sicherheits- oder Verwaltungsinformationen.

Ein direkter Read-Zugriff ausserhalb des Admin-Bereichs waere riskant, weil:

```text
- interne Admin-Notiztexte versehentlich in Community-/Profil-UI landen koennten,
- bestehende Admin-Route echte Notiztexte fuer Admins ausgibt,
- Community-/Nicht-Admin-UI andere Datenminimierungsregeln braucht,
- Public-Leaks dauerhaft vermieden werden muessen,
- Permission-Anzeige nicht automatisch eine UI-/API-Freigabe bedeutet.
```

Daher bleibt der sichere Stand:

```text
Admin-Notes-Read bleibt Admin-only.
Community-Read wird nicht direkt gebaut.
```

## Wenn spaeter doch ein externer Read-Scope noetig wird

Falls spaeter eine Nicht-Admin-/Community-nahe Anzeige fachlich benoetigt wird, dann nur als separater Plan- und Implementierungsstrang.

Moeglicher spaeterer Step:

```text
RDAP60_ADMIN_NOTES_REDACTED_READ_SCOPE_PLAN
```

Oder, wenn zuerst UI geklaert werden muss:

```text
RDAP60_MOD_USER_PROFILE_NOTE_FLAG_SCOPE_PLAN
```

Ein spaeterer Scope darf nicht einfach die bestehende Admin-Route verwenden.

## Erlaubte spaetere Varianten nur nach separatem Plan

### Variante A: Kein Community-Read

Empfehlung fuer jetzt.

```text
Admin-Notizen bleiben dauerhaft nur im Admin-Bereich sichtbar.
```

Vorteile:

```text
- geringstes Leak-Risiko
- klare Rollen-/Sicherheitsgrenze
- keine neue API
- keine UI-Verwechslung
```

### Variante B: Mod-only Summary / Flag

Nur wenn spaeter sinnvoll.

```text
Mods sehen nicht den internen Notiztext, sondern nur einen entschärften Status/Flag.
```

Beispiele:

```text
- Hat interne Hinweise: ja/nein
- Moderationsstatus: unauffaellig / beobachten / intern pruefen
- Letzte interne Bewertung vorhanden: ja/nein
```

Kein voller Notiztext.

### Variante C: Stark redigierte Summary

Nur mit eigener Route, eigener Permission und Datenminimierung.

```text
Nicht-Admin-Bereich sieht nur explizit freigegebene, redigierte Zusammenfassung.
```

Nicht automatisch aus `note_text` ableiten.

### Variante D: Volltext ausserhalb Admin

Nicht empfohlen.

```text
Vollstaendige interne Admin-Notiztexte ausserhalb des Admin-Bereichs bleiben verboten, solange kein sehr starker fachlicher Grund und ein separater Security-Plan existiert.
```

## Spaetere Route, falls ueberhaupt

Wenn spaeter ein externer Read-Scope gebaut wird, dann nicht in RDAP59 und nicht als Nebenwirkung.

Moegliche Route spaeter nur als eigener Step:

```text
GET /api/remote/mod/users/note-flags/read
```

oder:

```text
GET /api/remote/community/users/admin-note-summary/read
```

Aber nur, wenn vorher klar entschieden wurde:

```text
- Zielgruppe
- Permission
- Datenumfang
- Redaktions-/Minimierungsregel
- Audit-Regel
- UI-Ziel
- Fehlerfaelle
- Tests
```

## Mindestregeln fuer spaeteren externen Read-Scope

Eine spaetere Nicht-Admin-/Community-nahe Readroute muss mindestens haben:

```text
Session/Auth Pflicht
DashboardAccess oder eigener ModboardAccess Pflicht
Eigene Permission, nicht blind admin.users.note.read
Keine Public-Ausgabe
Keine Ausgabe von internem note_text
Datenminimierung
Explizite Zieluser-Validierung
Limitierung/Pagination
Kein includeInactive fuer Nicht-Admins
Keine created_by/updated_by Details fuer Community/Public
Keine Schreibfelder
Keine Update-/Deactivate-/Delete-Ableitung
Klare Response-Flags: redacted, publicSafe, fullTextReturned:false
```

Empfohlene neue Permission fuer spaeter:

```text
admin.users.note.summary.read
```

oder fuer Mod-Scope:

```text
mod.users.note.flag.read
```

Nicht empfohlen fuer Nicht-Admin-Scope:

```text
admin.users.note.read
```

Grund:

```text
admin.users.note.read bedeutet aktuell interne Admin-Notiztexte lesen.
```

## UI-Ziele spaeter

Aktuell darf lesen:

```text
Admin -> Admin-Notizen
Admin -> User-Detail Bruecke zu Admin-Notizen
```

Nicht lesen duerfen aktuell:

```text
Community/User-Profil
Public Userprofil
Mod-Ansicht ausserhalb Admin-Scope
Self-Service Profil
Dashboard-Overview
```

Wenn spaeter eine Anzeige gebaut wird, dann bevorzugt:

```text
Mod-Ansicht / User-Profil intern fuer Mods
```

Nicht bevorzugt:

```text
Public Community-Seite
```

## Bestehende Struktur

Fuer den aktuellen Stand gilt:

```text
Bestehende Admin-Notes-Routen bleiben in remote-modboard/backend/src/routes/admin-users.routes.js.
Bestehender Admin-Notes-Service bleibt fuer Admin-Read zuständig.
RDAP59 aendert daran nichts.
```

Falls spaeter ein externer Read-Scope kommt:

```text
Nicht die bestehende Admin-Readroute aufweichen.
Nicht einfach im Frontend filtern.
Serverseitig eigene Datenminimierung.
Bestehende Service-Logik nur dann erweitern, wenn sie sauber getrennte Public-/Summary-Mapper bekommt.
Sonst eigener read-only Service fuer Summary/Flag-Scope.
```

## Was RDAP59 ausdruecklich nicht tut

```text
Keine Code-Aenderung.
Keine neue Backend-Route.
Keine neue Frontend-UI.
Keine DB-Migration.
Keine Writes.
Keine Community-Read-Freigabe.
Keine Nutzung der bestehenden Admin-Readroute ausserhalb Admin.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Session-Revocation.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Ergebnis

```text
RDAP59 entscheidet:
Admin-Notizen bleiben vorerst Admin-only.
Community-Read wird nicht gebaut.
Falls spaeter noetig, dann nur separater, stark begrenzter read-only Scope mit eigener Planung, eigener Permission, Datenminimierung und ohne Public-Leak.
```

## Naechster sinnvoller Step nach RDAP59

Empfohlen:

```text
RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN
```

Aber nur als Plan-only, wenn als naechstes Admin-Note Update/Deactivate sauber vorbereitet werden soll.

Alternative, falls noch kein Write-Scope gewuenscht ist:

```text
RDAP60_ADMIN_NOTES_READ_ONLY_UI_STATUS_POLISH_PLAN
```

Nicht empfohlen direkt danach:

```text
Community-Read bauen
Permission-Writes bauen
Rollen-/Gruppen-Verwaltung bauen
Admin-Note Update/Deactivate direkt bauen ohne Plan
```
