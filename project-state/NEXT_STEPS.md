# NEXT_STEPS

## Direkt naechster Schritt

```text
CAN-28.1 anwenden und live prüfen: Modul-Loader Log Summary.
```

## Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\server.js
.\stepdone.cmd "CAN-28.1 Modul-Loader Log Summary"
```

Danach Node neu starten und Log prüfen:

```text
[module-loader] summary loaded=... skipped=... failed=... warnings=...
[module-loader] skipped file=obs_shared.js reason=no_init_export shared=yes
```

## Danach sinnvoll

```text
CAN-28.2: Nach Live-Prüfung entscheiden, ob weitere Log-Bereiche verbessert werden sollen.
```

Moegliche Kandidaten:

```text
- WS connect/disconnect Log zusammenfassen oder optional drosseln.
- EventSub Startup-Log kompakter machen.
- Dashboard/Statusroute fuer Loader-Summary erweitern.
- Kein weiterer Log-Umbau, wenn CAN-28.1 ausreicht.
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
