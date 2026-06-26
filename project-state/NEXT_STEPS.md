# NEXT_STEPS

Stand: RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS
```

## Ziel

```text
RDAP61 live bestaetigen und dokumentieren.
```

## Nach lokalem Stepdone deployen

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
cd RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
sudo bash tools/remote-modboard-deploy.sh RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION dev
```

## Live-Checks

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed, .adminUsersAdminNoteWriteDisabled'
```

## Nicht direkt aendern

```text
Keine Update-UI ohne separaten Plan.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Community-Read-Freigabe.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```
