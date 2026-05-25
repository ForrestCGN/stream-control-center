# STEP451 – Sound Bus Productive Route 404 Fix

## Status
Prepared.

## Ziel
Der kontrolliert aktivierte VIP-Produktivpfad aus STEP448/STEP450 soll die produktive Sound-Bus-Route wirklich erreichen und nicht mehr mit `HTTP 404` auf Legacy zurückfallen.

## Befund vor STEP451
Direkter Backend-Test gegen `/api/vip-sound/command`:

- `accepted: True`
- `effectiveVipFlow: sound_bus_command`
- `effectiveSoundEntryPoint: sound_bus_command`
- `productivePlayChecks: 1`
- `productivePlayFailed: 1`
- `lastSoundId: vip/araglor.mp3`
- `lastProductiveBusError: HTTP 404`
- `legacyFallbackUsed: True`

Damit war klar: Der VIP-Command erreicht den produktiven Bus-Hook, aber die Sound-System-Route `/api/sound/eventbus/command/play` war nicht registriert.

## Geänderte Dateien

- `backend/modules/sound_system.js`
- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderungen

### sound_system.js

- Version auf `0.1.21` gesetzt.
- Feature auf `sound_bus_command_productive_route_404_hotfix` gesetzt.
- Route registriert:
  - `GET /api/sound/eventbus/command/play`
  - `POST /api/sound/eventbus/command/play`
- Beide Routen rufen jetzt `consumeSoundBusCommandPlay(...)` auf.

### vip_sound_overlay.js

- Version auf `1.8.33` gesetzt.
- Feature auf `vip_productive_bus_route_404_hotfix` gesetzt.
- Keine neue VIP-Flow-Logik, kein neuer Testpfad.

## Bewusst nicht geändert

- Kein neuer Admin-Testpfad.
- Kein neuer Diagnoseballast.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Legacy-Fallback bleibt als Notausgang vorhanden.
- Normale Produktiv-Aktivierung aus STEP448/STEP450 bleibt bestehen.

## Erwartung nach Test

Nach einem direkten Backend-Test mit `login=araglor`:

- `productivePlayChecks >= 1`
- `productivePlayOk >= 1`
- `productivePlayFailed: 0`
- `lastProductiveBusError` leer
- `lastSoundId: vip/araglor.mp3`
- `productiveBusUsed: True`
- `legacyFallbackUsed: False`

## Abschluss

```powershell
cd D:\Git\stream-control-center

node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js

.\stepdone.cmd "STEP451 Sound Bus Productive Route 404 Fix"
```
