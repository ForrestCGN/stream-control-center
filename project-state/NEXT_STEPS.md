# NEXT_STEPS

Stand: RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION_PREP  
Datum: 2026-06-26

## Naechster Step

```text
RDAP64D_ADMIN_NOTE_UPDATE_UI_MAIN_ROUTER_INTEGRATION
```

## Ziel

```text
Admin-Note Update-UI sauber ueber den echten Haupt-Router / Haupt-Loader anbinden.
```

## Ausgangslage

```text
RDAP64/RDAP64B/RDAP64C haben die UI-Datei erweitert/hotgefixt.
Live bleibt Admin -> Admin-Notizen leer.
Konsole zeigt keinen Fehler.
index.html laedt nur remote-modboard.js.
Der echte Router ist remote-modboard.js.
```

## Erlaubter Scope

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
optional remote-modboard/backend/public/index.html
```

## Umsetzungsrichtung

```text
Methode B:
remote-modboard.js bleibt Haupt-Router.
Admin-Notes wird bewusst ueber Haupt-Router/Haupt-Loader integriert.
Keine getrennte parallele Router-/Hidden-/Active-Logik.
```

## Nicht aendern

```text
Keine Backend-Route.
Keine DB-Migration.
Keine neue Permission.
Kein Deactivate.
Kein Delete.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```

## Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\public\assets\remote-modboard.js
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js

git status --short
git diff --stat
```

RDAP64D braucht nach `stepdone.cmd` Webserver-Deploy.
