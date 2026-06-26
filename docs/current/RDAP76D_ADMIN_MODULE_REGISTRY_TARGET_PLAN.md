# RDAP76D_ADMIN_MODULE_REGISTRY_TARGET_PLAN

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Art: Doku-only / Audit / Zielstruktur / kein Code

## Zweck

RDAP76D stoppt weitere kleine Router-/Header-Fixes an Admin-Notizen und User-Detail und legt die Zielstruktur fuer ein erweiterbares Remote-Modboard fest.

Der wichtige fachliche Anspruch ist:

```text
Wenn spaeter ein neues Modul oder ein neuer Menuepunkt dazukommt, soll er sich selbst beschreiben und automatisch in Navigation, Header und Seitenrouting eingeordnet werden.
```

Das bedeutet: keine weiteren verstreuten Einzelfixes, keine parallelen Mini-Router, keine nachtraegliche Navigation pro Feature-Datei.

## Gepruefte echte Dateien aus GitHub/dev

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/assets/remote-modboard.css
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
project-state/*
```

## Ist-Befund

### 1. `index.html`

`index.html` enthaelt den sichtbaren Shell-Aufbau:

```text
Topbar / Header
Sidebar / Navigation
Main Content
statische Panels mit data-page-panel
```

Der Admin-Bereich ist dort bisher statisch angelegt mit:

```text
Admin
- Benutzerverwaltung
- Rollen & Rechte
- Sicherheit
```

Admin-Notizen und User-Detail sind dort nicht als saubere, zentrale Admin-Unterseiten modelliert.

### 2. `remote-modboard.js`

`remote-modboard.js` ist aktuell die Haupt-App und enthaelt bereits den zentralen Page-State:

```text
currentPage
setPage(page, meta)
Header setzen
aktive Navigation setzen
Panels aktiv markieren
Page-Change-Event senden
```

Das ist die richtige Fuehrungsschicht. Diese Datei bzw. ein daraus extrahierter App-Shell-/Router-Bereich muss kuenftig die einzige Wahrheit fuer Header, Navigation und sichtbare Seite bleiben.

### 3. `rdap28-admin-notes.js`

`rdap28-admin-notes.js` macht aktuell zu viel:

```text
- Styles injizieren
- Navigation fuer Admin-Notizen injizieren
- Navigation fuer User-Detail injizieren
- Admin-Notes-Panel injizieren
- User-Detail-Panel injizieren
- eigene Page-State-Funktionen nutzen
- Header/Panel/Navigation nachtraeglich reparieren
- Admin-Notes Daten laden/rendern
- User-Detail Daten laden/rendern
- Create/Update fuer Admin-Notes steuern
```

Das ist der Grund, warum Header, Navigation und sichtbarer Inhalt auseinanderlaufen koennen.

## Kernproblem

Admin-Notizen und User-Detail sind aktuell keine sauber registrierten Unterseiten des Obermoduls `Admin`, sondern nachtraeglich injizierte Spezialfaelle.

Dadurch gibt es zwei konkurrierende Wahrheiten:

```text
remote-modboard.js
= Haupt-Router / Header / Navigation / aktive Seite

rdap28-admin-notes.js
= injiziert Unterseiten und steuert teilweise selbst Sichtbarkeit/Header/Nav
```

Das ist nicht nachhaltig erweiterbar.

## Zielbild

### Obermodule

Das Remote-Modboard soll in Obermodule gegliedert werden:

```text
System
Module
Admin
OBS
Sounds
Overlays
Commands
Agent
```

Nicht alles muss sofort sichtbar oder aktiv sein. Aber die Struktur muss spaeter erweiterbar sein.

### Admin als erstes sauberes Obermodul

```text
Admin
- Admin-Uebersicht
- Benutzerverwaltung
- User-Detail
- Admin-Notizen
- Rollen & Rechte
- Sicherheit
- Audit / Locks
- spaeter: Sessions, Freigaben, Write-Konfiguration
```

### Module beschreiben sich selbst

Ein Modul bzw. eine Unterseite soll kuenftig nicht mehr manuell an mehreren Stellen eingebaut werden, sondern eine Beschreibung liefern:

```text
moduleId
label
icon
order
pages[]
```

Eine Page beschreibt:

```text
pageId
label
title
tab
order
permission
status
render/init handler
```

## Ziel-API im Frontend

Erster Schritt soll eine Frontend-Registry sein, ohne Backend-Route und ohne DB:

```text
window.RemoteModboardModules.registerModule(...)
window.RemoteModboardModules.registerPage(...)
```

Beispiel-Zielbild:

```js
window.RemoteModboardModules.registerModule({
  id: "admin",
  label: "Admin",
  icon: "⚙",
  order: 30
});

window.RemoteModboardModules.registerPage({
  moduleId: "admin",
  pageId: "admin-notes",
  label: "Admin-Notizen",
  title: "Admin-Notizen",
  tab: "read/create",
  order: 30,
  permission: "admin.users.note.read",
  init: "initAdminNotesPage"
});
```

Wichtig: Das ist Zielstruktur, kein in RDAP76D umgesetzter Code.

## Harte Zustandsregel

Der Router bleibt Chef.

```text
Nur die App-Shell / der Haupt-Router darf:
- Header setzen
- aktive Navigation setzen
- sichtbares Panel bestimmen
- Page-State halten
- Module/Page-Registry auswerten
```

Feature-Dateien duerfen:

```text
- sich registrieren
- Daten laden
- Inhalt rendern
- Buttons/Formulare innerhalb ihrer eigenen Page binden
```

Feature-Dateien duerfen nicht mehr:

```text
- eigene Navigation injizieren
- Header direkt ueberschreiben
- fremde Panels anzeigen/verstecken
- eigene Router-/Restore-Logik bauen
- globale active-Klassen korrigieren
```

## Empfohlene Ziel-Dateistruktur

Kurzfristig, minimal-invasiv:

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard-modules.js
remote-modboard/backend/public/assets/admin/admin.module.js
remote-modboard/backend/public/assets/admin/admin-notes.page.js
remote-modboard/backend/public/assets/admin/admin-user-detail.page.js
```

Alternativ, falls keine Unterordner im ersten Code-Step gewuenscht sind:

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/remote-modboard-modules.js
remote-modboard/backend/public/assets/rdap-admin.module.js
remote-modboard/backend/public/assets/rdap-admin-notes.page.js
remote-modboard/backend/public/assets/rdap-admin-user-detail.page.js
```

Wichtig ist nicht der perfekte Dateiname, sondern die Zuständigkeit:

```text
Registry/App-Shell != Feature-Logik
```

## Migrationsstrategie

Nicht alles auf einmal umbauen.

### Phase 1: Registry-Fundament

```text
- zentrale Frontend-Registry einfuehren
- bestehende statische Navigation weiterhin erlauben
- Admin-Modul registrieren
- Admin-Notizen und User-Detail als registrierte Pages abbilden
- Haupt-Router bleibt einzige Wahrheit
```

### Phase 2: Admin-Notizen entlasten

```text
- rdap28-admin-notes.js von Navigation/Header/Page-State entkoppeln
- Datei rendert nur noch Admin-Notes-Inhalt und Actions
- User-Detail aus dieser Datei herausloesen oder als eigene Page-Datei vorbereiten
```

### Phase 3: Navigation automatisch aus Registry bauen

```text
- Module nach order sortieren
- Pages nach order sortieren
- Navigation automatisch erzeugen oder bestehende Nav aktualisieren
- keine Feature-Datei fuegt Nav-Buttons direkt ein
```

### Phase 4: Backend-Manifest spaeter

Erst spaeter, wenn Frontend-Struktur stabil ist:

```text
GET /api/remote/modules
```

Das Backend kann dann anhand von Session/Permissions Module und Pages liefern oder filtern.

Nicht jetzt in RDAP76D.

## Naechster empfohlener Code-Step

```text
RDAP77_ADMIN_MODULE_REGISTRY_FOUNDATION
```

Ziel:

```text
- Frontend-only Registry-Fundament schaffen.
- Admin als erstes Modul registrieren.
- Admin-Notizen und User-Detail als echte Admin-Pages registrieren.
- Haupt-Router entscheidet Header/Nav/Panel.
- Keine Backend-Route.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
- Keine Write-Freigabe.
```

## Nicht in RDAP77 machen

```text
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine Agent-Actions.
- Keine Permission-Writes.
- Keine Rollen-/Gruppen-Writes.
- Keine neue DB-Struktur.
- Kein freier Shell-/Datei-/Prozess-/URL-Zugriff.
```

## Fazit

Die aktuelle Webseite ist nicht kaputt, aber die Admin-Unterseiten sind historisch falsch gewachsen. Der naechste saubere Schritt ist keine weitere Reparatur am Header, sondern eine Modul-/Page-Registry, damit neue Module automatisch eingeordnet werden koennen und der Haupt-Router die einzige Wahrheit bleibt.
