# STEP447 – VIP Bus-First Cleanup & Konsolidierung

## Ziel

Den nach STEP443/STEP446 gewachsenen VIP Bus-First-Testbereich konsolidieren, ohne neue Testpfade zu erzeugen und ohne bestehende Funktionalität zu entfernen.

## Betroffene Dateien

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/sound_system.js` (unverändert enthalten)
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderungen

- VIP-Modul-Version auf `1.8.29` erhöht.
- Feature auf `vip_bus_first_cleanup_consolidation` gesetzt.
- Status/Guard um konsolidierte Felder ergänzt:
  - `cleanupConsolidated`
  - `cleanupProfile`
  - `diagnosticProfile`
  - `cleanupStep`
  - `consolidatedBusFirstStatus`
- Productive-Switch-Lesbarkeit aufgeteilt:
  - `productiveSwitchConfigReadable`: Setting/DB lesbar
  - `productiveSwitchConfigFileReadable`: optionale Config-Datei lesbar
  - `productiveSwitchSettingReadable`: Setting-Lesbarkeit
- Bestehende Detailfelder bleiben für Kompatibilität erhalten.

## Nicht geändert

- Kein neuer Testpfad.
- Keine neue Route.
- Kein Produktiv-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Umbau.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an Legacy `/api/sound/play`.
- Keine Änderung an `backend/modules/sound_system.js` gegenüber STEP442/STEP443.

## Sicherheitsentscheidung

Der normale VIP-Produktivpfad bleibt in STEP447:

```text
legacy_sound_system_api
```

Der Bus-First-Pfad bleibt ausschließlich Kandidat/Admin-Testpfad:

```text
sound_system_play_test
```

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object version,feature,cleanupConsolidated,cleanupProfile,productiveSwitchEffectiveEnabled,productiveSwitchSafetyLocked,productiveSwitchConfigReadable,productiveSwitchConfigFileReadable,productiveSwitchSettingReadable,productiveEntryPointChanged,productiveVipFlow
$s.consolidatedBusFirstStatus | Select-Object profile,step,productivePath,candidatePath,normalChatCommandUsesBusFirst,adminTestBusFirstCandidate,productiveSwitchEffective,productiveSwitchSafetyLocked,productiveEntryPointChanged,noLegacyFallbackOnlyInAdminTest
```
