# CURRENT CHAT HANDOFF – BUS-TWITCH.5b

Stand: 2026-06-10

## Bestätigungsbereiter Step

```text
STEP BUS-TWITCH.5b – User OAuth Force Verify + Scope Diagnostics
```

## Ziel

```text
ForrestCGN hat user:read:chat bereits in TWITCH_OAUTH_SCOPES eingetragen.
Der validierte User-Token enthält den Scope aber noch nicht.
BUS-TWITCH.5b ergänzt einen Force-Verify-Login und eine sichere Scope-Diagnose ohne Token-Ausgabe.
```

## Geändert

```text
backend/modules/twitch.js
```

## Neu

```text
/auth/login?force=1
/auth/login?force_verify=1
/auth/login/force
/api/twitch/auth/scope-diagnostics
```

## Nicht geändert

```text
twitch_events.js bleibt EventSub-Chat-Readiness-Stand 0.1.4.
Keine Subscription-Erstellung.
Kein EventSub-Takeover.
Keine bestehenden EventSub-Flows entfernt.
Keine DB-Datei ersetzt.
```

## Nach Installation

StepDone vor Live-Test:

```powershell
.\stepdone.cmd "STEP BUS-TWITCH.5b User OAuth Force Verify Scope Diagnostics"
```

Dann Backend neu starten und testen:

```powershell
$d = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/auth/scope-diagnostics"
$d | Select-Object ok,module,moduleVersion,moduleBuild,hasUserReadChatConfigured,hasUserReadChatInToken
$d.missingConfiguredScopes
```

Falls `hasUserReadChatInToken` false bleibt:

```text
http://127.0.0.1:8080/auth/login?force=1
```

ForrestCGN neu autorisieren, Backend neu starten und Live-Readiness erneut prüfen.
