# Next Steps

Nach `0.2.26`:

## 1. Naechster technischer Step

```text
RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY
```

Ziel:

```text
- Media bleibt fachliches Modul.
- Online-Media-Inventar kommt per Agent-WSS Slow-Sync.
- Webserver haelt Inventar memory-only.
- Keine Datei-Inhalte.
- Keine absoluten Pfade.
- Keine Uploads, Deletes, Edits.
- Keine DB-Migration.
- Keine Agent-Actions ausser read-only Sync-Payload senden/empfangen.
```

## 2. Vorher lesen

```text
remote-modboard/backend/src/services/agent-runtime.service.js
backend/modules/remote_agent.js
remote-modboard/backend/src/routes/media-readonly.routes.js
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
backend/modules/local_remote_modboard_adapter.js
docs/current/RDAP_RUNTIME_PROFILE_MODULE_PERMISSION_STANDARD.md
```

## 3. Nicht tun

```text
Keine Technikmodule in Navigation anlegen.
Kein media-agent-sync Modul.
Kein OBS-Inventory-Protokoll fuer Media missbrauchen.
Keine Upload-/Delete-Buttons aktivieren.
Keine lokalen absoluten Pfade anzeigen.
Keine grossen Listen ohne Limit/Paging laden.
Keine Rechte-/Rollenfragen nach hinten schieben.
```

## 4. Spaetere Schritte

```text
- Permission-Middleware fuer Media-Writes separat planen.
- Media Upload/Edit/Delete erst mit Permission, Confirm, Audit, Lock/Readback falls noetig.
- Sound-System nach gleicher Modul-/Sync-/Permission-Logik planen.
- OBS-Actions nur ueber feste Allowlist-Endpunkte, niemals freie OBS-Payloads.
```
