# RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_PREP

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP

## Zweck

Dieser Doku-Step haelt den aktuellen RDAP64/RDAP64B/RDAP64C-Befund fest und bereitet den naechsten sauberen Umsetzungsstep vor:

```text
RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION
```

## Aktueller Befund

RDAP64 hat die Admin-Note Update-UI in `rdap28-admin-notes.js` vorbereitet.

RDAP64B und RDAP64C waren Hotfix-Versuche fuer Router/Nav-Sichtbarkeit.

Live-Befund nach RDAP64C:

```text
- Admin -> Admin-Notizen wird in Navigation/Titel sichtbar.
- Inhaltsbereich bleibt leer.
- STRG+F5 aendert nichts.
- Browser-Konsole zeigt keinen JS-Fehler.
- Backend-Status/Routen bleiben sauber.
```

Damit ist es kein Cache-Problem und kein offensichtlicher Runtime-Crash.

## Technische Ursache / Erkenntnis

Die echte Dashboard-Shell liegt in:

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js
```

`index.html` laedt aktuell nur:

```html
<script src="/assets/remote-modboard.js" defer></script>
```

Die Zusatzdatei

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

ist nicht als Script in `index.html` eingebunden.

Der echte Router sitzt in `remote-modboard.js`:

```text
- bindNavigation()
- setPage()
- currentPage
- is-active-view
- .nav-link[data-page]
- [data-page-panel]
```

Der Router schaltet Panels ueber die CSS-Klasse:

```text
is-active-view
```

nicht ueber `hidden`.

## Entscheidung

Nicht weiter mit isolierten Hotfixes in `rdap28-admin-notes.js` arbeiten.

Methode A waere gewesen:

```text
index.html laedt rdap28-admin-notes.js zusaetzlich direkt.
```

Das waere schnell, aber wieder ein paralleler Zusatzweg neben dem Haupt-Router.

Entscheidung fuer Methode B:

```text
RDAP64D integriert Admin-Notes sauber ueber den Haupt-Router / Haupt-Loader.
```

## Ziel RDAP64D

RDAP64D soll die Admin-Note Update-UI sauber an den echten Dashboard-Router anbinden.

Moegliche Zielarchitektur:

```text
remote-modboard.js bleibt Haupt-Router und Shell-Besitzer.
rdap28-admin-notes.js bleibt fachliches Admin-Notes-Modul.
remote-modboard.js laedt/initialisiert das Admin-Notes-Modul bewusst.
Admin-Notes nutzt den Router nicht gegen ihn, sondern ueber einen klaren Hook.
```

Empfohlener Modul-Hook:

```js
window.RdapAdminNotesModule.init({
  setPage,
  loadDashboard,
  getCurrentPage
});
```

Alternative, nur wenn einfacher/sicherer:

```text
Admin-Notes-Code als klar abgegrenzter Abschnitt in remote-modboard.js integrieren.
```

Aber keine parallelen Router-/Hidden-/Active-Mechaniken mehr.

## Erlaubter Scope RDAP64D

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional: remote-modboard/backend/public/index.html
docs/current/RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP64D.md
project-state/*
```

`index.html` nur anfassen, wenn die saubere Modul-Loader-Variante wirklich eine Script-Einbindung braucht.

## Nicht erlaubt in RDAP64D

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine parallele Zweitnavigation.
Kein weiterer Blind-Hotfix ohne echten Router-Abgleich.
```

## Checks fuer RDAP64D

Lokal:

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

Nach `stepdone.cmd` braucht RDAP64D Webserver-Deploy, weil Frontend-Code im deployten `remote-modboard/` geaendert wird.

## Live-Checks nach RDAP64D

```text
Admin -> Admin-Notizen zeigt Inhalt.
Admin -> User-Detail zeigt Inhalt.
Admin -> Benutzerverwaltung bleibt sichtbar.
Navigationstitel/Tab passen.
Browser-Konsole bleibt sauber.
Aktive Admin-Notiz zeigt bei Schreibrecht Bearbeiten.
Update speichert mit confirmWrite:true und laedt danach die Liste neu.
Deactivate/Delete erscheinen nicht.
```
