# LWG-4O.5d – Giveaways Tab getChatClaimSettings Fix

## Ziel

Hotfix für den Giveaways-Tab im Dashboard nach LWG-4O.5c.

## Problem

Beim Klick auf `Giveaways` trat im Browser folgender Fehler auf:

```text
Uncaught ReferenceError: getChatClaimSettings is not defined
```

Dadurch konnte der Giveaways-Tab nicht gerendert werden.

## Änderung

- `getChatClaimSettings(giveaway)` ist im Dashboard-Modul wieder vorhanden.
- Die Funktion liest Chat-Claim-Konfiguration aus `settingsSnapshot.chatClaim`, `chatClaim` und `metadata.chatClaim`.
- Direct-Navigation aus LWG-4O.5b bleibt erhalten.
- `statusLabel(status)` bleibt erhalten.
- Keine Backend-, Datenbank- oder Claim-Runtime-Änderung.

## Test

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Danach im Browser:

1. Dashboard öffnen
2. Strg+F5
3. Loyalty öffnen
4. Giveaways anklicken

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.5d Giveaways Tab getChatClaimSettings Fix"
```
