# NEXT_STEPS

Stand: RDAP48_ADMIN_USER_DETAIL_READONLY_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED
```

## Ziel RDAP49

```text
Eine sichtbare Admin-User-Detailseite/read-only Detailansicht vorbereiten.
```

## Scope

```text
Frontend-only.
Daten aus bestehendem /api/remote/auth/model nutzen.
User-Auswahl/Suche nach Name/Login/UID.
User-Kopf anzeigen: displayName, loginName, userUid, status, lastLoginAt.
Rollen/Gruppen/Sessions fuer den User read-only anzeigen.
Button/Link zu Admin-Notizen fuer diesen User ueber vorhandene RDAP44/RDAP47 API.
Keine Backend-Aenderung.
Keine DB-Migration.
Keine Permission-Schreibfunktion.
```

## Vor RDAP49 zuerst pruefen

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/services/auth-db-read.service.js
```

## Bestehende Datenquelle

```text
GET /api/remote/auth/model
```

Liefert read-only:

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
```

## Akzeptanzkriterien RDAP49

```text
Admin-User-Detail read-only sichtbar.
Mindestens ForrestCGN / tw:127709954 wird korrekt angezeigt.
Rollen/Gruppen/Sessions werden angezeigt, soweit im Auth-Modell vorhanden.
Admin-Notizen fuer ausgewaehlten User koennen ueber vorhandene Zieluser-Auswahl geoeffnet werden.
Keine Backend-Datei geaendert.
Keine DB-Migration.
Kein Admin-Note Update/Deactivate/Delete.
Login-/OAuth-Safety bleibt unveraendert.
```

## Nicht in RDAP49 tun

```text
Keine Permission-Vergabe.
Keine Rollen-/Gruppen-Aenderung.
Keine Admin-Note Update/Deactivate/Delete-Funktion.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine neue Backend-Route, wenn /api/remote/auth/model ausreicht.
```

## Danach moeglich

```text
RDAP49B_ADMIN_USER_DETAIL_READONLY_LIVE_CONFIRMED_DOCS
```
