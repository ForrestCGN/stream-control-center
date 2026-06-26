# NEXT_STEPS

Stand: RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION  
Datum: 2026-06-26

## Nächster Schritt

```text
RDAP64 auf Webserver deployen und live prüfen.
```

## Deploy

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
cd RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
sudo bash tools/remote-modboard-deploy.sh RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION dev
```

## Live-Checks

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.adminNoteUiStatusSemantics'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed'
```

Zusätzlich im Browser prüfen:

```text
Admin -> Admin-Notizen öffnen.
Aktive Notiz mit Schreibrecht zeigt Bearbeiten.
Speichern nutzt Update-Route.
Nach Erfolg reloadet die Readroute.
```

## Danach

```text
RDAP64B_ADMIN_NOTE_UPDATE_UI_LIVE_CONFIRMED_DOCS
```
