# NEXT_STEPS – stream-control-center

Stand: 2026-06-10

## Direkt nächster Schritt

```text
STEP BUS-TWITCH.17 Dokumentation Bus Konsolidierung einspielen und StepDone ausführen.
```

Danach ist der VIP30-Migrationsblock dokumentiert abgeschlossen.

## Nächste Modul-Migration laut Plan

Empfohlene Reihenfolge nach VIP30:

```text
1. Alerts / Subs / Bits / Raids / Follows
2. Loyalty / Glücksrad / Giveaways
3. Shoutout / ClipShoutout
4. Deathcounter / Streamstatus / Game Sync
```

## Nächster sinnvoller technischer Block

```text
BUS-TWITCH.18 – Alerts Event Mapping / Migration Plan
```

Ziel für BUS-TWITCH.18:

```text
- vorhandene Alert-Eventquellen erfassen
- Eventnamen/Kanäle für twitch_events / communication_bus festlegen
- alten Alert-Weg zunächst beibehalten
- neue Bus-Subscriber nur vorbereiten oder parallel testen
- keine Alert-Queue-/Sound-/Overlay-Logik entfernen
```

## Optionaler Kontrolltest VIP30

Nach einem Node-Neustart sollte gelten:

```powershell
$src = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/channelpoints/source/status"
$src.twitchEvents | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyBridge | Select-Object enabled,active,autostart,subscriptionId,lastError
$src.legacyHardDisableGate
```

Erwartung:

```text
twitchEvents.active=True
twitchEvents.autostart=True
legacyBridge.active=False
legacyBridge.autostart=False
legacyHardDisableGate=True
```
