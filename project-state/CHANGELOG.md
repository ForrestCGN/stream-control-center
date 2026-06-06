# Changelog – VIP30 / 30TageVIP

## 2026-06-06 – STEP8.8 Dashboard Read-only

### Neu

- Neues Dashboard-Modul `vip30` ergänzt.
- Neue Datei `htdocs/dashboard/modules/vip30.js`.
- Neue Datei `htdocs/dashboard/modules/vip30.css`.

### Geändert

- `htdocs/dashboard/index.html`
  - CSS für VIP30 eingebunden.
  - Section `vip30Module` ergänzt.
  - Script `vip30.js` eingebunden.
- `htdocs/dashboard/app.js`
  - Modul `vip30` registriert.
  - Community-Navigation um `vip30` ergänzt.
  - Modul-Catalog um „30 Tage VIP“ ergänzt.
  - Favoriten um `vip30` ergänzt.

### Dashboard-Inhalt

Read-only Anzeige für:

- VIP30 Status
- Slots
- Logs
- External VIP Remove Status
- Cleanup Check
- Twitch EventSub VIP Status
- Diagnose JSON

### Nicht geändert

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Kein VIP-Grant.
- Kein VIP-Remove.
- Kein Cleanup-Run.
- Kein Fulfill/Cancel.
- Kein Alert.
- Bestehendes `vip.js` / VIP-Sound-System bleibt unverändert.

### Tests lokal in der Build-Umgebung

```txt
node --check htdocs/dashboard/app.js
node --check htdocs/dashboard/modules/vip30.js
```

Beide Checks waren erfolgreich.

## 2026-06-06 – STEP8.7.1

- Routing-Konflikt bei `/api/twitch/eventsub/status` korrigiert.
- Echter Twitch `channel.vip.remove` bis VIP30 `external_removed` live bestätigt.
