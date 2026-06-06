# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.9 Dashboard Settings

### Geändert

- `htdocs/dashboard/modules/vip30.js`
  - Settings-Endpoint `/api/vip30/settings` wird geladen.
  - Neuer Tab `Config`.
  - Sichere Settings können über `/api/vip30/settings/save` gespeichert werden.
  - Kritische Settings werden angezeigt, aber nicht editierbar gemacht.

- `htdocs/dashboard/modules/vip30.css`
  - Styling für Settings-Tab, Inputs, Switches, Save-Meldungen und Critical-Badges ergänzt.

### Nicht geändert

- Kein Backend geändert.
- Keine DB geändert.
- Keine Twitch-Aktion.
- Kein Alert.
- Kein Cleanup-Run.
- Keine Änderung an `vip30.js`, `twitch.js`, `communication_bus.js`.

### Safety

Direkt editierbar nur harmlose Dashboard-Settings:

```txt
alerts.enabled
alerts.soundKey
logging.enabled
reward.title
reward.prompt
slots.maxSlots
slots.durationDays
cleanup.releaseSlotOnExternalVipRemove
```

Kritische Settings bleiben gesperrt.
