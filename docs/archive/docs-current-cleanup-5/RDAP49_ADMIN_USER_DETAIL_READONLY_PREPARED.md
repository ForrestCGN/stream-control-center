# RDAP49_ADMIN_USER_DETAIL_READONLY_PREPARED

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Frontend-only / read-only UI-Komfort

## Zweck

RDAP49 setzt den in RDAP48 geplanten naechsten sichtbaren Admin-User-Schritt um:

```text
Admin -> User-Detail
```

Die Ansicht ist bewusst read-only und nutzt vorhandene Daten aus:

```text
GET /api/remote/auth/model
```

Es wird keine neue Backend-Route, keine DB-Migration und keine Permission-Schreibfunktion eingefuehrt.

## Geaenderte Datei

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Begruendung:

```text
Diese Datei injiziert bereits die Admin-Notizen-UI und die Zieluser-Auswahl.
RDAP49 erweitert diese vorhandene Struktur um eine User-Detail-Ansicht, statt eine zweite parallele Auswahl/Notiz-Implementierung zu bauen.
```

## Neue sichtbare Funktion

```text
Admin -> User-Detail
```

Die neue Ansicht zeigt fuer einen ausgewaehlten User read-only:

```text
- Name
- Login
- User-UID
- Status
- letzter Login
- Anzahl aktiver Rollen
- Anzahl aktiver Gruppen
- Anzahl Sessions im Auth-Modell
- Rollenliste
- Gruppenliste
- Session-Auszug
```

## Verbindung zu Admin-Notizen

RDAP49 nutzt die vorhandene Zieluser-Logik weiter.

Button:

```text
Admin-Notizen öffnen
```

Verhalten:

```text
- setzt den Zieluser ueber die vorhandene Auswahlstruktur
- oeffnet Admin -> Admin-Notizen
- laedt Notizen fuer denselben User
```

Dabei wird keine zweite Admin-Notizen-Implementierung gebaut.

## Neue kleine Diagnose-/Komfort-API

```text
window.RdapAdminNotes.openUserDetail(user)
```

Zweck:

```text
Diagnose/Komfort: User-Detail programmgesteuert oeffnen.
```

## Nicht geaendert

```text
Kein Backend-Code.
Keine DB-Migration.
Keine neue API-Route.
Keine Permission-Vergabe.
Keine Rollen-/Gruppen-Aenderung.
Kein Session-Widerruf.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein physisches Delete.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Safety

RDAP49 bleibt Frontend-only/read-only.

Wichtig:

```text
Frontend-Sichtbarkeit ist keine Sicherheitsentscheidung.
Alle spaeteren Write-Funktionen brauchen weiterhin serverseitige Permission, confirmWrite, Audit, Lock und Readback.
```

## Akzeptanzkriterien

```text
- Admin -> User-Detail sichtbar.
- User-Auswahl sichtbar.
- ForrestCGN / tw:127709954 kann angezeigt werden.
- Rollen/Gruppen/Sessions werden soweit vorhanden read-only angezeigt.
- Button Admin-Notizen oeffnen setzt denselben Zieluser in Admin-Notizen.
- Admin-Notizen Read/Create bleiben unveraendert.
- Zieluser-Suche aus RDAP47 bleibt intakt.
- Keine Backend-Datei geaendert.
- Keine DB-Migration.
- Login-/OAuth-Safety bleibt unveraendert.
```

## Lokale Checks

Empfohlen:

```powershell
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
```

## Webserver-Deploy

Nach `stepdone.cmd` ist ein Webserver-Deploy noetig, weil Frontend-Code geaendert wurde.
