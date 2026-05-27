# Channelpoints – Unified Activation Action Helper Fix (STEP518)

## Version

- Backend: `0.9.6`
- Build: `unified-activation-action-helper-fix`

## Zweck

STEP518 behebt einen Runtime-Fehler im vereinheitlichten Aktivierungsfluss aus STEP517.

Beim Klick auf `Aktivieren` wurde intern noch der nicht vorhandene Helper `rewardHasExecutableAction(...)` verwendet. Dadurch brach die Aktivierung mit folgender Meldung ab:

```text
rewardHasExecutableAction is not defined
```

## Änderung

Der Aktivierungsfluss nutzt jetzt den vorhandenen und bereits im Modul verwendeten Helper:

```js
isExecutableReward(reward)
```

Damit bleibt die bestehende Logik erhalten:

- Media-Rewards mit Media-ID sind ausführbar.
- Text-Rewards mit Text/Text-Key sind ausführbar.
- Importierte Rewards ohne vollständige Aktion bleiben gesperrt.
- Aktivieren führt weiterhin System + Twitch zusammen.

## Keine Änderungen

- Keine neue Tabelle
- Keine DB-Migration
- Keine neue Dashboard-Logik
- Kein neuer Modus
- EventBus-Redemption-Flow bleibt unverändert
