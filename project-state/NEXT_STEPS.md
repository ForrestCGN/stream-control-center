# NEXT_STEPS

## Direkt naechster Schritt

```text
CAN-29.1 anwenden und Live-Log prüfen.
```

## Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\discord.js
.\stepdone.cmd "CAN-29.1 Discord clientReady Deprecation Fix"
```

Danach Node neu starten und prüfen:

```text
[discord] ready as ...
```

Die folgende Warnung soll nicht mehr auftreten:

```text
DeprecationWarning: The ready event has been renamed to clientReady
```

## Danach sinnvoll

```text
CAN-29.2 Testergebnis dokumentieren.
```

## Weitere Kandidaten danach

```text
1. SQLite ExperimentalWarning separat bewerten, ohne DB-Logik anzufassen.
2. WS connect/disconnect Log optional drosseln oder zusammenfassen.
3. Dashboard-Kosmetik Overlay-Monitor / Bus-Diagnose weiter glätten.
4. EventBus read-only Diagnose weiter ausbauen.
```

## Weiterhin nicht machen ohne separaten Go-Schritt

```text
Keine produktive Sound-Bus-Migration.
Kein produktiver Sound-Bus-Play.
Kein Queue-Clear.
Keine Twitch-/Redemption-Write-Aktion durch Shadow.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
Kein EventSub-/Twitch-Redemption-Test ohne separate Freigabe.
Keine Enable/Test/Migration-Buttons in der Sound-Shadow Card.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine DB-Migration.
Keine Dashboard-Testbuttons fuer produktive Aktionen.
```
