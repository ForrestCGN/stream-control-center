# NEXT_STEPS

Stand: RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED  
Datum: 2026-06-25

## Naechster Schritt

```text
RDAP40 lokal einspielen, pruefen, stepdone, Webserver-Deploy, Browser-Test.
```

## RDAP40 Testziel

```text
UI zeigt Notiz-Create nur mit Schreibrecht.
Create nutzt bestehende RDAP39-Route.
Backend blockiert weiterhin ohne confirmWrite.
Erfolgreicher Create erzeugt Notiz + Audit + Lock + Readback.
Notizliste aktualisiert sich nach Create ueber RDAP39C-Readroute.
Keine Update/Deactivate/Delete Buttons sichtbar.
```

## Lokaler Workflow

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED.zip" "RDAP40 Admin-Note Create-UI vorbereitet"
node --check .\remote-modboard\backend\public\assets\rdap28-admin-notes.js
git status --short
git diff --stat
.\stepdone.cmd "RDAP40 Admin-Note Create-UI vorbereitet; Create-Dialog nutzt RDAP39-Route und RDAP39C-Readback"
```

## Webserver-Deploy

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
cd RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
sudo bash tools/remote-modboard-deploy.sh RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED dev
```

## Browser-Test

```text
https://mods.forrestcgn.de/
Admin -> Admin-Notizen
```

Erwartung:

```text
Read true
Write true fuer Forrest/owner
Notizen sichtbar
Button Neue Notiz sichtbar
Create-Test funktioniert
Liste aktualisiert sich danach
Keine Update/Deactivate/Delete Buttons
```

## Naechster Doku-Step nach erfolgreichem Live-Test

```text
RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS
```
