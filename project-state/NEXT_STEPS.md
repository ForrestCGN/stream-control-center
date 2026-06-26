# NEXT_STEPS

Stand: RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
```

## Ziel

```text
Bestehende Admin-Notes-UI um kontrollierte Update-UI erweitern.
```

## Erlaubter Scope

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

RDAP64 darf:

```text
UPDATE_ENDPOINT ergaenzen.
Bearbeiten-Button pro aktiver Notiz anzeigen.
Nur bei erfolgreicher Readroute und Schreibrecht anzeigen.
Inline-Edit oder kleines Edit-Panel bauen.
noteText vorausfuellen.
confirmWrite:true im JSON-Body senden.
Busy-State setzen.
Fehler sichtbar anzeigen.
Nach Erfolg Readroute neu laden.
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

## Checks bei RDAP64

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

Da Frontend-Code im deployten `remote-modboard/` geaendert wuerde, braucht RDAP64 nach stepdone einen Webserver-Deploy.
