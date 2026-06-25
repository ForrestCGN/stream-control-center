# RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED

Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: UI-Step fuer kontrolliertes Admin-Notiz-Create

## Zweck

RDAP40 erweitert die bestehende Admin-Notizen-UI um einen kleinen kontrollierten Create-Dialog.

Grundlage:

```text
RDAP39: Backend-Create-Write live bestaetigt.
RDAP39C: Readroute wiederhergestellt und live bestaetigt.
```

Damit kann die UI nach einem erfolgreichen Create die Notizliste direkt ueber die Readroute neu laden.

## Geaendert

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Doku/Projektstatus:

```text
docs/current/RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP40.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## UI-Funktion

```text
Admin-Notizen-Seite bekommt einen Button "Neue Notiz".
Button ist nur sichtbar, wenn die Readroute erfolgreich geladen wurde und admin.users.note.write serverseitig erkennbar erlaubt ist.
Dialog/Form enthaelt eine Textarea mit 5000 Zeichen Maximum.
Submit sendet ausschliesslich Create an die bestehende RDAP39-Route.
Nach erfolgreichem Create wird die Notizliste ueber die RDAP39C-Readroute neu geladen.
```

## Genutzte Backend-Routen

Readback/Refresh:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

Create:

```text
POST /api/remote/admin/users/admin-notes/create
```

Body:

```json
{
  "confirmWrite": true,
  "targetUserUid": "tw:127709954",
  "noteText": "..."
}
```

## Sicherheitsgrenzen

```text
Backend entscheidet weiterhin ueber Session, DashboardAccess, Permission, Confirm-Write, Audit, Lock und Readback.
confirmWrite bleibt Pflicht und wird im Body gesendet.
Create-Button/Form wird nur anhand der serverseitig gelieferten Schreibberechtigung sichtbar.
Keine Secrets im Frontend.
Raw note_text wird nicht im Audit gespeichert; das bleibt Backend-Regel aus RDAP39.
```

## Nicht geaendert

```text
Keine Create-Backend-Logik geaendert.
Keine Update-Funktion.
Keine Deactivate-Funktion.
Kein physisches Delete.
Keine Permission-Vergabe in der UI.
Keine Community-Seiten-Anbindung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
Keine DB-Migration.
Keine Workflow-Tools geaendert.
```

## Lokale Checks

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
```

## Webserver-Deploy

Nach erfolgreichem `stepdone.cmd` wie RDAP-Standard aus frischem GitHub/dev-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
cd RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED dev
```

## Tests nach Deploy

Routes/Status:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminNoteReadRestored, .adminNoteWriteConfirmed'
```

Browser:

```text
https://mods.forrestcgn.de/
Admin -> Admin-Notizen
```

Erwartung:

```text
Read: true
Write: true fuer Forrest/owner
Notizen: mindestens 2
Button "Neue Notiz" sichtbar
Create mit Testtext funktioniert
Nach Create aktualisiert sich die Notizliste
Keine Update/Deactivate/Delete Buttons sichtbar
```

## Naechster sinnvoller Step nach Live-Test

```text
RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS
```

Danach erst ueber weitere Admin-User-Detailseite/Target-Auswahl oder spaetere Update/Deactivate-Steps entscheiden.
