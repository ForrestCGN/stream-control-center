# NEXT_STEPS

Stand: RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP62B_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS
```

## Ziel

```text
RDAP62 nach Webserver-Deploy live bestaetigen und dokumentieren.
```

## Nach lokalem Stepdone deployen

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
cd RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
sudo bash tools/remote-modboard-deploy.sh RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP dev
```

## Live-Checks

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.statusApiVersion, .auth.notes, .adminNoteUiStatusSemantics'
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminNoteUpdateConfirmed, .adminUsersAdminNoteWriteDisabled'
```

## Danach sinnvoll

```text
RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN
```

Aber erst nach RDAP62B Live-Bestaetigung.

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
