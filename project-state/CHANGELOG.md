# CHANGELOG

## 2026-05-27 – Channelpoints STEP527 dokumentiert

### Geändert

- Channelpoints-Bedienkonzept vereinfacht.
- Editor nutzt kein normales lokales „Aktiv“-Häkchen mehr.
- Speichern legt lokal an/ändert lokal und erstellt/aktualisiert Twitch.
- Neue Twitch Rewards werden standardmäßig inaktiv erstellt.
- Übersichtsschalter steuert nur Twitch sichtbar/einlösbar.
- Doku zu Sound-System-Routing und Media-Dateinamen ergänzt.

### Behoben / dokumentiert

- `Cannot GET /api/channelpoints/status` wurde auf nicht geladenes `channelpoints.js` zurückgeführt.
- Serverstart-Fehler dokumentiert:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

- STEP526/STEP527 als relevante Korrekturlinie dokumentiert.

### Zurückgezogen

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

### Aktuell gültig

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```
