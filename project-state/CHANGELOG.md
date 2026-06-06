# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.17.1 Settings Seed Fix

### Problem

`alerts.soundPool` wurde im Dashboard als fehlend angezeigt, obwohl STEP8.17 aktiv war.

### Ursache

Bestehende Installationen hatten die `vip30_settings`-Tabelle bereits. Neue Setting-Definitionen wurden ohne neue Migration nicht automatisch nachgesät.

### Fix

- `backend/modules/vip30.js`
  - Version `0.8.11`
  - Build `step8.17.1-settings-seed-fix`
  - `buildSettingsStatus()` sät fehlende Settings automatisch nach.

### Erwartung

```txt
Settings 29 / 29
Tab Sounds zeigt Editor
```
