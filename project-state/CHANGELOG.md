# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.7.1 abgeschlossen

### Geändert

- `backend/modules/twitch.js`
  - Routing-Konflikt bei `/api/twitch/eventsub/status` korrigiert.
  - Der Alias `/api/twitch/eventsub/status` wurde aus dem Subscription-Listing-Handler entfernt.
  - Die echte Statusroute für `/api/twitch/eventsub/status` bleibt erhalten und liefert wieder den EventSub-Status-Snapshot.

### Nicht geändert

- Keine VIP30-Entscheidungslogik geändert.
- Keine Datenbankänderung.
- Keine Alert-Aktivierung.
- Keine EventSub-Subscription-Config geändert.
- Keine Twitch-Write-Logik geändert.
- Keine Funktionalität entfernt.

### Tests

Nach Dateiübernahme:

```powershell
node -c backend\modules\twitch.js
.\stepdone.cmd "VIP30-STEP8.7.1 Twitch EventSub Statusroute korrigiert"
```

Danach Node-Neustart und Statusprüfung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status?refresh=1"
$s.vipEventBus
$s.configuredSubscriptions | Where-Object { $_.type -like "channel.vip*" }
```

Bestätigt:

```txt
vipEventBus.configured = True
knownRemove = True
knownAdd = True

channel.vip.add
channel.vip.remove
```

### Live-Test

Echter Twitch-Test mit manuellem VIP-Entzug:

```txt
akighosty -> external_removed
```

Bestätigter Log:

```txt
external_vip_remove_slot_released
success: True
reason: external_removed
```

## 2026-06-05 – STEP8.6

- Externe VIP-Entzüge können über den Bus verarbeitet werden.
- Aktive VIP30-Slots können auf `external_removed` gesetzt werden.
- Safety: kein Twitch-Write, kein Alert, keine Slot-Löschung.

## 2026-06-05 – STEP8.5

- Cleanup Dry-Run und abgelaufene Slots geprüft.
- Kein abgelaufener aktiver Slot gefunden.
