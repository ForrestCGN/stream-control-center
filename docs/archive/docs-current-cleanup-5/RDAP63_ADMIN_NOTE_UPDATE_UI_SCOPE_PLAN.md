# RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

RDAP63 klaert als reiner Plan-Step, wie die Admin-Note Update-UI spaeter sicher gebaut werden darf.

RDAP63 ist Doku-only / Plan-only.

Es wird nichts gebaut.

## Ausgangspunkt

Bestaetigter Stand nach RDAP62B:

```text
RDAP61: Admin-Note Update-Backend ist live aktiv.
RDAP62: Status-Semantik ist live bereinigt.
RDAP62B: Live-Befund ist dokumentiert.
```

Aktueller Admin-Notes Stand:

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Weiterhin gilt:

```text
Update-UI ist nicht gebaut.
Deactivate bleibt disabled.
Delete bleibt verboten.
Community-Read fuer Admin-Notizen bleibt verboten.
```

## Bestehende UI-Datei

Die bestehende Admin-Notes-UI liegt in:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Aktuell enthaelt diese Datei Read/Create-UI:

```text
- Admin-Notizen Navigation unter Admin
- Zieluser-Auswahl
- Admin-Notizen Read-Liste
- Create-Button nur bei Schreibrecht
- Create-Form mit confirmWrite:true
- Reload nach erfolgreichem Create
```

Noch nicht vorhanden:

```text
- UPDATE_ENDPOINT
- Update-Button pro Notiz
- Edit-Panel/Inline-Edit
- Update-Busy-State
- Update-Fehleranzeige
```

## RDAP63 Entscheidung

Die spaetere Update-UI soll in die bestehende Admin-Notes-UI integriert werden.

Keine neue Seite, keine neue Route, kein paralleles UI-Modul.

Begruendung:

```text
Die bestehende UI kennt bereits Zieluser, Readroute, Schreibrecht-Erkennung, Notice/Fehleranzeige und Reload-Mechanik.
Update gehoert fachlich zur bestehenden Admin-Notizen-Liste.
```

## Sichtbarkeit spaeterer Update-UI

Ein spaeterer Update-Button darf nur erscheinen:

```text
- in Admin -> Admin-Notizen
- in der bestehenden Admin-Read/Create-Ansicht
- pro aktiver Notiz
- nur wenn die Readroute erfolgreich geladen wurde
- nur wenn der Server Schreibrecht bestaetigt
- nur wenn die Notiz einen validen noteUid hat
- nur wenn targetUserUid valide ist
```

Der Button darf nicht erscheinen:

```text
- in Admin -> User-Detail selbst
- in Community-Seiten
- in Profil-/Public-/Self-Service-Seiten
- fuer inactive/deactivated Notizen
- bei fehlendem Schreibrecht
- bei fehlerhafter Readroute
- wenn noteUid fehlt
```

## Geplanter UI-Ablauf spaeter

```text
1. Admin oeffnet Admin -> Admin-Notizen.
2. UI laedt Notizen fuer Zieluser ueber bestehende Readroute.
3. Bei erfolgreichem Read und Schreibrecht erscheint pro aktiver Notiz ein Bearbeiten-Button.
4. Klick auf Bearbeiten oeffnet Inline-Edit oder kleines Edit-Panel in derselben Notizkarte.
5. Textfeld wird mit bestehendem Notiztext vorausgefuellt.
6. Speichern sendet POST /api/remote/admin/users/admin-notes/update.
7. Request nutzt confirmWrite:true im JSON-Body.
8. Waehrend Request sind Speichern/Abbrechen/weitere Edit-Aktionen gesperrt.
9. Bei Erfolg wird nicht optimistisch lokal gemutet, sondern die Readroute neu geladen.
10. Bei Fehler bleibt Edit-Panel offen und zeigt reason/error sichtbar an.
```

## Geplanter Request spaeter

```http
POST /api/remote/admin/users/admin-notes/update
Content-Type: application/json
```

Body:

```json
{
  "confirmWrite": true,
  "targetUserUid": "<targetUserUid>",
  "noteUid": "<noteUid>",
  "noteText": "<neuer Text>"
}
```

Nicht senden:

```text
status
created_by_user_uid
created_at
updated_by_user_uid
updated_at
target_user_uid Aenderung
note_uid Aenderung
includeInactive fuer Write
```

## UI-State spaeter

Empfohlene State-Variablen fuer spaetere Implementierung:

```text
const UPDATE_ENDPOINT = '/api/remote/admin/users/admin-notes/update';
let updateDialogNoteUid = null;
let updateInFlight = false;
let updateNoticeNoteUid = null;
```

Alternativ kann es als einzelnes Edit-State-Objekt umgesetzt werden:

```text
let updateState = {
  noteUid: null,
  inFlight: false,
  error: null
};
```

## UX-Regeln spaeter

```text
Bearbeiten: oeffnet Edit-Panel.
Speichern: sendet Update.
Abbrechen: schliesst Edit-Panel ohne Write.
Zeichenzahl: 0..5000 anzeigen.
Leerer Text: lokal blocken und Fehlermeldung zeigen.
Zu langer Text: lokal blocken und Fehlermeldung zeigen.
Nach Erfolg: Readroute neu laden.
Keine Optimistic-Mutation.
```

## Sicherheitsregeln

```text
confirmWrite:true nur im JSON-Body.
Frontend entscheidet nie final ueber Rechte.
Backend bleibt massgeblich fuer Session, DashboardAccess, Permission, Audit, Lock und Readback.
Raw note_text wird nicht im Audit geloggt.
Update-UI zeigt nur an, was Backendstatus/Readroute erlauben.
```

## Deactivate/Delete bleiben verboten

RDAP63 plant keine Deactivate-UI.

RDAP63 plant kein Delete.

Spaetere Deactivate-Funktion bleibt separater Scope, z. B.:

```text
RDAP65_ADMIN_NOTE_DEACTIVATE_SCOPE_PLAN
```

Nicht zusammen mit Update-UI.

## Keine Community-Freigabe

Admin-Notizen bleiben Admin-only.

Die bestehende Admin-Readroute darf nicht fuer Community/Profile/Public/Self-Service wiederverwendet werden.

Eine spaetere externe Read-Funktion waere ein eigener stark begrenzter Scope, nicht Teil von RDAP63.

## Was RDAP63 ausdruecklich nicht tut

```text
Keine UI-Code-Aenderung.
Kein Backend-Code.
Keine neue Route.
Keine DB-Migration.
Keine produktiven Writes.
Keine Update-UI-Implementierung.
Kein Deactivate.
Kein Delete.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Empfohlener Folgestep

```text
RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
```

Aber nur nach neuem Startcheck, echtem Datei-Lesen, kurzem Plan und Forrests ausdruecklichem go.

RDAP64 darf dann nur die bestehende Admin-Notes-UI erweitern.
