# CURRENT CHAT HANDOFF – VIP30 STEP8.18.2 Avatar Resolve + Test-User

Stand: 2026-06-06

## Ergebnis

VIP30 kann beim manuellen Alert-Test jetzt einen Anzeigenamen/Login entgegennehmen und versucht diesen über Twitch `/helix/users` aufzulösen.

## Neue Version

```txt
moduleVersion: 0.8.14
moduleBuild: step8.18.2-avatar-resolve-test-user
```

## Geändert

```txt
backend/modules/vip30.js
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

## Backend

Neue Helfer:

```txt
twitchResolveUserProfile()
enrichVip30ResultUserProfile()
```

Verhalten:

```txt
wenn avatarUrl vorhanden -> direkt nutzen
wenn avatarUrl fehlt und userLogin/displayName vorhanden -> Twitch /helix/users Lookup
wenn Lookup klappt -> userId/login/displayName/avatarUrl ergänzen
wenn Lookup fehlschlägt -> Fallback bleibt Initial/Icon
```

Der echte Alertpfad `triggerVip30AlertSoundBundle()` versucht jetzt ebenfalls, fehlende Avatare vor dem Bundle-Bau aufzulösen.

## Dashboard

Im Tab `Aktionen` gibt es beim Button `VIP30 Alert testen` jetzt ein Eingabefeld:

```txt
Anzeigename/Login zum Auflösen
```

Default:

```txt
AkiGhosty
```

Damit kann man z. B. testen:

```txt
AkiGhosty
ForrestCGN
EngelCGN
sehrLangerName...
```

## Test

```powershell
$body = @{
  displayName = "AkiGhosty"
} | ConvertTo-Json -Depth 5

Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/alert/test" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body | ConvertTo-Json -Depth 10
```

Oder im Dashboard:

```txt
Aktionen -> Anzeigename/Login eintragen -> VIP30 Alert testen
```

## Sicherheit

Der Test bleibt ohne Twitch-Schreibaktion:

```txt
kein VIP Grant
kein Slot Write
kein Redemption Fulfill/Cancel
nur Twitch User-Lookup + Alert
```
