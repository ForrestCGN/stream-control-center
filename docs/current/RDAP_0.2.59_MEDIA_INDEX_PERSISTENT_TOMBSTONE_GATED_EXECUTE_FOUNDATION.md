# RDAP 0.2.59 - Media Index Persistent Tombstone gated Execute Foundation

## Zweck

0.2.59 erweitert den persistenten Tombstone-Flow um eine echte, aber streng gegatete Execute-Foundation fuer normale persistente Media-Dateien, die im belastbaren Full-Sync-Compare als `missingOnAgent` erscheinen.

Der Step ersetzt keine Sicherheitsregeln aus 0.2.58P. Die Preview bleibt erhalten. Execute ist local-only, braucht Body-Confirm, erwartete Kandidatenzahl, explizite Media-Index-Gates, Audit und Readback.

## Statusmarker

```text
rdap_media_index_persistent_tombstone_execute_foundation_059.v1
RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION
```

Vorheriger Stand:

```text
rdap_media_index_persistent_tombstone_preview_058p.v1
RDAP_0.2.58P_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_PREVIEW
```

## Geaenderte Dateien

- `remote-modboard/backend/src/routes/media-index-diff.routes.js`
- `docs/current/RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_59.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Routen

Bestehende Diff-Route:

```text
GET /api/remote/media/index/diff/status
```

Preview bleibt erhalten:

```text
GET /api/remote/media/index/tombstone/persistent/preview
```

Neue Execute-Foundation:

```text
POST /api/remote/media/index/tombstone/persistent/execute
```

## Execute-Schutz

Execute ist blockiert, solange nicht alles erfuellt ist:

- Request ist lokal (`127.0.0.1` / `::1`).
- `confirmWrite:true` ist gesetzt.
- `confirmTombstone:"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE"` ist gesetzt.
- `expectedCandidateCount` ist gesetzt und passt zur aktuellen Preview.
- Missing/Tombstone-Kandidaten sind aus vollstaendigem Full-Sync-Compare belastbar.
- `MEDIA_INDEX_WRITE_ENABLED=true`.
- `MEDIA_INDEX_DATA_WRITE_ENABLED=true`.
- `MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=true`.

## Verhalten

Bei `candidateCount = 0` und korrekten Confirm-/Gate-Bedingungen:

- sauberer Noop
- kein DB-Write
- kein Audit-Write
- Readback `readBackCandidateCount = 0`

Bei `candidateCount > 0` und korrekten Confirm-/Gate-Bedingungen:

- nur Soft-Delete in `remote_media_index`
- `deleted = 1`
- `source = rdap_0.2.59_persistent_tombstone_soft_delete`
- `sync_version` wird erhoeht
- `updated_at` wird aktualisiert
- Audit-Eintrag in `dashboard_audit_log`
- Readback danach

## Sicherheitsgrenzen

0.2.59 macht weiterhin NICHTS davon:

- kein Hard-Delete
- kein physisches Loeschen
- kein Online->Agent-Trigger
- kein Upload/Edit/Delete
- keine Datei-Inhalte
- keine absoluten lokalen Pfade
- kein Auto-Delete ohne Confirm/Gates

## Lokale Checks

```powershell
cd D:\Git\stream-control-center

node --check .\remote-modboard\backend\src\routes\media-index-diff.routes.js

git status
```

## Webserver-Deploy

Da `remote-modboard/` Code geaendert wurde, ist nach `stepdone.cmd` ein Webserver-Deploy noetig:

```bash
bash /opt/stream-control-center/tools/server/remote-modboard-deploy-step.sh RDAP_0.2.59_MEDIA_INDEX_PERSISTENT_TOMBSTONE_GATED_EXECUTE_FOUNDATION dev
```

## Webserver-Tests

Diff:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.statusApiVersion, .routeBuild, .readOnly, .reliability.missingOnAgentReliable, .missingClassification.persistentMediaMissingCandidateCount'
```

Preview:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/preview | jq '.statusApiVersion, .routeBuild, .readOnly, .writeEnabled, .executeRoutePrepared, .databaseWriteExecuted, .counts, .futureExecuteRequirements, .safety, .note'
```

Execute ohne Body muss blockieren:

```bash
curl -fsS -X POST http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/execute \
  -H 'Content-Type: application/json' \
  -d '{}' | jq '.statusApiVersion, .routeBuild, .ok, .reason, .writeExecuted, .databaseWriteExecuted, .softDeleteExecuted'
```

Erwartung:

```text
ok = false
reason = confirm_write_required
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
```

Execute mit Confirm, aber ohne Gates muss blockieren:

```bash
curl -fsS -X POST http://127.0.0.1:3010/api/remote/media/index/tombstone/persistent/execute \
  -H 'Content-Type: application/json' \
  -d '{"confirmWrite":true,"confirmTombstone":"RDAP_0.2.59_CONFIRM_PERSISTENT_TOMBSTONE_EXECUTE","expectedCandidateCount":0}' | jq '.statusApiVersion, .routeBuild, .ok, .reason, .writeExecuted, .databaseWriteExecuted, .softDeleteExecuted, .mediaIndexGates'
```

Erwartung bei normalen Gates aus:

```text
ok = false
reason = media_index_persistent_tombstone_write_gate_disabled
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
```

Noop-Test nur bewusst mit Gates aktivieren. Bei aktuellem Stand ohne Kandidaten ist dann zu erwarten:

```text
ok = true
reason = no_persistent_tombstone_candidates_to_soft_delete
writeExecuted = false
databaseWriteExecuted = false
softDeleteExecuted = false
readBackCandidateCount = 0
```
