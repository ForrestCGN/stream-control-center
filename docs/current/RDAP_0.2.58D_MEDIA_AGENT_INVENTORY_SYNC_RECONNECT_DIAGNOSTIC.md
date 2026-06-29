# RDAP 0.2.58D - Media Agent Inventory Sync Reconnect Diagnostic

## Zweck

0.2.58D verbessert den lokalen Streaming-PC-Agent (`backend/modules/remote_agent.js`).

Der Webserver-Test nach 0.2.58C zeigte:

```text
agentConnected = true
lastHeartbeatAt = aktuell
lastMediaInventorySyncAt = null
reason = media_inventory_not_received_since_restart
```

Der Agent war also verbunden, aber seit Webserver-Restart/Deploy kam kein Media-Inventory-Snapshot an.

## Aenderung

Der lokale Agent sendet Media-Inventory nach WSS-Open robuster:

- Initial-Retry-Kette nach Verbindung:
  - 1500 ms
  - 5000 ms
  - 15000 ms
- Retry stoppt, sobald ein Media-Inventory erfolgreich gesendet wurde.
- Bestehender Timer bleibt unveraendert aktiv.
- Compact Media-Inventory bleibt read-only.
- Full-Sync-Chunks bleiben read-only und serverseitig weiterhin gate-geschuetzt.

Neue/erweiterte Diagnosefelder lokal:

```text
mediaInventoryInitialSendPrepared
mediaInventoryInitialSendScheduledAt
mediaInventoryInitialSendAttempts
lastMediaInventoryInitialSendAttemptAt
lastMediaInventoryInitialSendSuccessAt
mediaInventoryInitialSendCompleted
mediaInventorySyncSendErrorAt
mediaInventorySyncSendError
mediaFullSyncState
mediaFullSyncSentItems
mediaFullSyncTotalItems
mediaFullSyncLastError
```

## Sicherheit

- Keine DB-Writes.
- Keine Datei-Writes.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Kein Online->Agent-Trigger.
- Keine Agent-Aktion.
- Keine Upload/Edit/Delete-Funktion.
- Keine OBS-/Sound-/Overlay-Steuerung.

## Geaenderte Dateien

- `backend/modules/remote_agent.js`
- `docs/current/RDAP_0.2.58D_MEDIA_AGENT_INVENTORY_SYNC_RECONNECT_DIAGNOSTIC.md`
- `docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_58D.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Tests lokal

```powershell
node --check .\backend\modules\remote_agent.js
git status
```

Nach lokalem Neustart/Agent-Reconnect:

```powershell
curl.exe -s http://127.0.0.1:8080/api/remote-agent/status
curl.exe -s http://127.0.0.1:8080/api/remote-agent/media/inventory/status
```

## Tests Webserver

Nach lokalem Reconnect:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/media/index/diff/status | jq '.agentSnapshotDiagnostic, .counts, .reliability'
```

## Naechster Schritt

Wenn Webserver wieder `agent_snapshot_available` sieht, Diff-Ergebnis erneut bewerten. Danach erst gated Delta-Upsert separat planen. Tombstone/Loeschstatus bleibt getrennt.
