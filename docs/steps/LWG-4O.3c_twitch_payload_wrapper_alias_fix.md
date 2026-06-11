# LWG-4O.3c – Twitch Payload Wrapper Alias Fix

## Ziel

Der Giveaway-Claim-Subscriber aus `loyalty_giveaways` konnte `twitch.chat/message` zwar empfangen, aber bei Events aus der zentralen `twitch_events`-Schicht blieb der erkannte User leer.

Grund: `twitch_events` normalisiert Chat-Events als Bus-Payload und legt die Twitch-Daten unter `payload.twitch` ab. Der bisherige Claim-Parser hat viele Alias-Pfade geprüft, aber noch nicht die entscheidenden Wrapper-Pfade wie `payload.twitch.user.login`.

## Änderung

Geändert wurde ausschließlich:

```text
backend/modules/loyalty_giveaways.js
```

Der Chat-Claim-Parser akzeptiert jetzt zusätzlich:

```text
payload.twitch.user.login
payload.twitch.user.displayName
payload.twitch.user.userId
payload.twitch.message
payload.twitch.channel
payload.twitch.badges
payload.twitch.source
```

sowie dieselben Werte über interne Alias-Objekte:

```text
twitch.user.login
twitch.user.displayName
twitch.user.userId
twitch.message
twitch.channel
twitch.badges
```

## Identitätsregel

Intern wird weiterhin ausschließlich der normalisierte Twitch-Login für den Match verwendet:

```text
forrestcgn
```

Der DisplayName wird nur für Anzeige/Logs/Chattexte genutzt:

```text
ForrestCGN
```

## Nicht geändert

- Keine Tabellen ersetzt
- Keine neue Tabelle
- Keine bestehende Funktionalität entfernt
- Kein Umbau des Draw-Flows
- Keine automatische Wheel-Freigabe
- Kein Command-Umbau

## Test

Nach Einspielen und Backend-Neustart:

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/chat-claim/status" | ConvertTo-Json -Depth 10
```

Dann den bestehenden Kompletttest erneut ausführen:

```powershell
powershell -ExecutionPolicy Bypass -File .\LWG-4O3_full_claim_test_ForrestCGN.ps1 -ClaimTimeoutSeconds 120
```

Erwartung nach Chatnachricht von ForrestCGN:

```text
lastUserLogin = forrestcgn
lastUserDisplayName = ForrestCGN
lastUserSource = twitch.user.login oder payload.twitch.user.login
matched >= 1
confirmed >= 1
metadata.chatClaim.status = confirmed
```

## StepDone

```powershell
.\stepdone.cmd "STEP LWG-4O.3c Twitch Payload Wrapper Alias Fix"
```
