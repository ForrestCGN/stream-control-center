# STEP438 – VIP Admin-Test Existing Sound File

## Goal

Allow the VIP admin-test route to validate the real VIP sound queue path with an existing VIP sound file.

This avoids false failures where the Guard works, but the test target has no matching MP3.

## Changed

- `backend/modules/vip_sound_overlay.js`
- Version: `1.8.21`
- Feature: `vip_admin_test_existing_sound_file`
- Added `GET /api/vip-sound/sounds/files`.
- Added admin-test-only sound override support:
  - `useExistingSound=true`
  - `autoExistingSound=true`
  - `useFirstExistingSound=true`
  - `testSoundFile=name.mp3`

## Safety

- The override is only used by `/api/vip-sound/test`.
- The normal `/api/vip-sound/command` path remains unchanged and protected.
- No productive Bus flow is enabled.
- Effective delivery remains `legacy_sound_system_api`.
- No DB migration.
- No normal queue/audio behavior is changed.

## Tests

List existing VIP sound files:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/files" | ConvertTo-Json -Depth 10
```

Use the first existing VIP sound file automatically:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true}' |
ConvertTo-Json -Depth 10
```

Or test a specific file:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"testSoundFile":"NAME.mp3"}' |
ConvertTo-Json -Depth 10
```

Check status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

## Expected

- `version: 1.8.21`
- `feature: vip_admin_test_existing_sound_file`
- `forceAccessApplied: true`
- `adminTestSoundOverride: true`
- `busModeGuard` exists
- `stats.lastRealFlowGuard.adminTestSoundOverride: true`
- `effectiveVipFlow: legacy_sound_system_api`
- `productiveEntryPointChanged: false`
