# RDAP77_ADMIN_MODULE_REGISTRY_FOUNDATION

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Frontend-only / Modul-Registry-Fundament

## Zweck

RDAP77 schafft das erste Frontend-Fundament fuer eine Modul-/Page-Registry im Remote-Modboard.

Ziel ist nicht, alle Seiten komplett neu zu bauen. Ziel ist, die bisher verstreute Admin-Unterseiten-Logik in eine Richtung zu bringen, in der neue Module und Menuepunkte spaeter automatisch eingeordnet werden koennen.

## Ausgangslage

RDAP76D hat dokumentiert:

```text
remote-modboard.js = Haupt-App / Router / Header / Navigation / Page-State
index.html = statische Grundstruktur
rdap28-admin-notes.js = injiziert Admin-Notizen und User-Detail historisch nachtraeglich
```

Dadurch konnten Header, aktive Navigation und sichtbares Panel auseinanderlaufen.

## Geaendert

### `remote-modboard.js`

Neu:

```text
window.RemoteModboardModules
```

Diese Frontend-Registry kann:

```text
- Module registrieren
- Pages registrieren
- vorhandene Navigationseintraege erkennen/aktualisieren
- fehlende Page-Nav-Buttons in das passende Obermodul einsortieren
- Reihenfolge ueber order-Werte setzen
- Snapshot der registrierten Module/Pages liefern
```

Ausserdem wird die Registry im Haupt-Router verfuegbar gemacht:

```text
window.RdapMainRouter.modules
```

### `rdap28-admin-notes.js`

Die Datei erstellt Admin-Notizen/User-Detail-Navigation nicht mehr als erste Wahrheit direkt selbst, wenn die Registry vorhanden ist.

Stattdessen registriert sie:

```text
Admin -> User-Detail
Admin -> Admin-Notizen
```

Nur wenn keine Registry vorhanden ist, bleibt ein Fallback fuer die bisherige direkte Navigationserstellung aktiv.

## Wichtig

RDAP77 ist ein Fundament, kein kompletter Modul-Umbau.

Weiterhin gilt:

```text
- Haupt-Router bleibt fuehrend.
- Feature-Dateien sollen schrittweise von Header/Nav/Page-State entlastet werden.
- Admin-Notizen und User-Detail sind jetzt als registrierte Admin-Pages vorgesehen.
```

## Nicht geaendert

```text
Kein Backend.
Keine DB-Migration.
Keine neue Route.
Keine neue Permission.
Kein Delete.
Kein Deactivate.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Erwarteter Test

```text
Admin-Menue oeffnen.
User-Detail und Admin-Notizen muessen im Admin-Menue vorhanden sein.
Klick auf User-Detail:
- Header: User-Detail · read-only
- Nav: User-Detail aktiv
- Panel: User-Detail sichtbar

Klick auf Admin-Notizen:
- Header: Admin-Notizen · read/create
- Nav: Admin-Notizen aktiv
- Panel: Admin-Notizen sichtbar
```

## Danach

Naechster fachlicher Step:

```text
RDAP78_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
```

Moeglicher technischer Folgeschritt davor, falls im Browser weiter Strukturfehler sichtbar sind:

```text
RDAP77B_ADMIN_PAGE_STATE_REGISTRY_HARDENING
```
