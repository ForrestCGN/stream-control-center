# CURRENT_SYSTEM_STATUS

Stand: 2026-05-26

## Commands

Backend:

```text
module = commands
moduleVersion = 0.1.5
moduleBuild = safe-edit-param-fix
```

Dashboard:

```text
UI_VERSION = 0.1.9
UI_BUILD = preserve-modal-draft-state
```

Status:

- Modal-Editor vorhanden.
- Safe-Edit vorhanden.
- Draft-State funktioniert.
- Sound/Video mit MediaPicker funktioniert.
- Löschen vorhanden.
- `Nur Live` aus normaler UI entfernt.

## Kanalpunkte

Backend:

```text
module = channelpoints
moduleVersion = 0.8.0
moduleBuild = twitch-auth-scope-check
```

Dashboard:

```text
UI_VERSION = 0.8.0
UI_BUILD = twitch-auth-scope-check
```

Status:

- Lokale Reward-Verwaltung vorhanden.
- Modal-Editor analog zu Commands vorhanden.
- Sound/Video/Text-Aktionen lokal testbar.
- Redemption-Test-Flow vorhanden.
- Einlösungsverlauf vorhanden.
- EventBus-Domain-Events aktiv/dokumentiert.
- Twitch Auth-/Scope-Check vorhanden.
- Read-only Sync möglich.
- Twitch-Schreibzugriffe deaktiviert.

## Letzte bestätigte Tests

### Kanalpunkte Status

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" |
  Select-Object ok,module,moduleVersion,moduleBuild
```

Ergebnis:

```text
ok = True
module = channelpoints
moduleVersion = 0.8.0
moduleBuild = twitch-auth-scope-check
```

### Twitch Auth Check

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/auth-check" |
  Select-Object ok,module,moduleVersion,moduleBuild,status,auth,scopeCheck,readiness,safety
```

Ergebnis zusammengefasst:

```text
ok = True
status = twitch_auth_scope_check
auth.login = forrestcgn
auth.userId = 127709954
auth.broadcasterId = 127709954
auth.tokenUserMatchesBroadcaster = True
readiness.readyForReadOnlySync = True
readiness.readyForFutureWriteActions = False
safety.noTwitchWrite = True
```

