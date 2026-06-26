# RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Plan-only / Doku

## Zweck

RDAP48 plant den naechsten sichtbaren Admin-User-Schritt nach RDAP47B:

```text
Eine echte Admin-User-Detailseite als read-only Ansicht.
```

Die Detailseite soll Admins spaeter einen einzelnen User sauber ansehen lassen, ohne sofort gefaehrliche Schreibfunktionen zu aktivieren.

## Ausgangslage

Bestaetigter Stand:

```text
RDAP44: Admin-Notizen haben Zieluser-Auswahl.
RDAP47: Zieluser-Suche/Filter ist live.
RDAP47B: Live-Bestaetigung dokumentiert.
Twitch-Login ist aktiv/freigegeben.
Admin-Notizen Read/Create funktionieren fuer den ausgewaehlten Zieluser.
```

Aktuelle Admin-Notizen-UI kann bereits:

```text
- Zieluser laden.
- Zieluser suchen/filtern.
- Zieluser auswaehlen.
- Notizen fuer diesen Zieluser lesen.
- Neue Notiz fuer diesen Zieluser erstellen, wenn admin.users.note.write erlaubt ist.
```

## Echte Dateien / Strukturen, auf denen RDAP48 basiert

Gepruefte vorhandene Dateien:

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP47B.md
docs/current/RDAP47B_ADMIN_NOTE_TARGET_USER_SEARCH_COMFORT_LIVE_CONFIRMED_DOCS.md
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Wichtige bestehende Datenquelle:

```text
GET /api/remote/auth/model
```

Diese Route nutzt `readAuthDbModel(config)` und liefert read-only bereits:

```text
model.users
model.userRoles
model.userGroups
model.roles
model.groups
model.permissions
model.rolePermissions
model.modulePermissions
model.sessions
schema/counts/validation
```

Damit ist fuer eine erste read-only User-Detailseite keine neue DB-Migration noetig.

## Zielbild fuer die Admin-User-Detailseite

Neue Ansicht:

```text
Admin -> User-Detail
```

Moegliche Inhalte read-only:

```text
1. User-Kopf
   - displayName
   - loginName
   - userUid
   - status
   - lastLoginAt

2. Identitaet / Login
   - Twitch-/Dashboard-UID
   - Login-Name
   - Session-Status aus model.sessions, soweit vorhanden

3. Rollen/Gruppen
   - aktive Rollen aus model.userRoles
   - aktive Gruppen aus model.userGroups
   - revoked_at sichtbar oder ausgefiltert, je nach Darstellung

4. Permission-Uebersicht read-only
   - direkte/abgeleitete Rechte nur anzeigen
   - keine Vergabe, kein Entzug
   - keine Schreibbuttons

5. Admin-Notizen-Anbindung
   - Link/Button: "Notizen fuer diesen User anzeigen"
   - vorhandene Admin-Notizen-Struktur weiterverwenden
   - keine zweite Notiz-Implementierung bauen

6. Diagnose/Sicherheit
   - Hinweis: read-only
   - Hinweis: Permission-UI bleibt deaktiviert
   - Hinweis: Update/Deactivate/Delete bleiben deaktiviert
```

## Bestehende Struktur erweitern statt neue Parallelstruktur

Empfehlung fuer RDAP49:

```text
Frontend-only erster Schritt:
remote-modboard/backend/public/assets/remote-modboard.js erweitern.
```

Warum:

```text
remote-modboard.js laedt bereits /api/remote/auth/model.
Die vorhandene Admin-/User-Modell-Uebersicht kann als Datenbasis genutzt werden.
Eine read-only Detailansicht kann ohne neue Backend-Route aus dem vorhandenen Auth-Modell gerendert werden.
```

Nicht empfohlen fuer den ersten Schritt:

```text
Keine neue DB-Tabelle.
Keine neue Permission-Verwaltung.
Keine neue Admin-Notizen-Route.
Keine zweite Zieluser-Auswahl parallel zu RDAP47.
Keine Admin-Note Update/Delete-Funktion.
```

## RDAP49 Vorschlag

Name:

```text
RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
```

Typ:

```text
Frontend-only Code-Step
```

Scope:

```text
- Admin-User-Detailseite oder Detailbereich read-only ergaenzen.
- Daten aus bestehendem /api/remote/auth/model verwenden.
- User-Auswahl/Detail-Anzeige nach Name/Login/UID.
- Rollen/Gruppen/Sessions fuer ausgewaehlten User anzeigen.
- Button/Link zur Admin-Notizen-Ansicht fuer diesen User vorbereiten.
- Keine Backend-Aenderung.
- Keine DB-Migration.
- Keine Permission-Schreibfunktion.
- Keine Note-Update/Deactivate/Delete-Funktion.
```

Moegliche UI-Variante:

```text
Admin -> Benutzer
- bestehende User-Liste bleibt.
- Klick/Details Button oeffnet read-only Detailkarte.
- Detailkarte zeigt User, Rollen, Gruppen, Sessions.
- Button "Admin-Notizen fuer diesen User" setzt ueber vorhandene RDAP44/RDAP47 API den Zieluser.
```

Technischer Ansatz fuer Link zu Admin-Notizen:

```text
window.RdapAdminNotes.selectTargetUser(user)
```

Diese API existiert bereits seit RDAP44/RDAP47 und soll weiterverwendet werden.

## Rechte / Safety

RDAP49 bleibt read-only:

```text
Keine produktiven Writes.
Keine DB-Migration.
Keine neuen Backend-POST-Routen.
Keine neue Permission-Vergabe.
Keine Rollen-/Gruppen-Aenderung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

Frontend-Sichtbarkeit ersetzt keine serverseitige Sicherheit:

```text
Alle echten Schreibfunktionen muessen spaeter serverseitig Permission, confirmWrite, Audit, Lock und Readback pruefen.
```

## Warum nicht direkt Admin-Note Update/Deactivate?

Admin-Note Update/Deactivate ist heikler als eine read-only User-Detailseite.

Dafuer braucht es separat:

```text
- alte Version / Verlauf
- Audit mit Grund
- Lock
- confirmWrite
- Readback
- klare Sichtbarkeit, dass Notizen nicht heimlich veraendert werden
```

Deshalb nach RDAP48 nicht direkt Update/Delete bauen, sondern zuerst die User-Detailseite read-only sichtbar machen.

## Akzeptanzkriterien fuer RDAP49

```text
- Admin-User-Detail read-only sichtbar.
- User-Suche/Auswahl in der Detailansicht funktioniert.
- Mindestens ForrestCGN / tw:127709954 wird korrekt angezeigt.
- Rollen/Gruppen/Sessions werden angezeigt, soweit im Auth-Modell vorhanden.
- Link/Button zu Admin-Notizen nutzt vorhandene RDAP44/RDAP47 Zieluser-Auswahl.
- Keine Backend-Datei geaendert.
- Keine DB-Migration.
- Kein Admin-Note Update/Deactivate/Delete.
- Login-/OAuth-Safety bleibt unveraendert.
```

## Geaenderte Dateien in RDAP48

```text
docs/current/RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP48.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Kein Webserver-Deploy

```text
RDAP48 ist Doku-/Plan-only.
Kein Webserver-Deploy noetig.
```
