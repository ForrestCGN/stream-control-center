# Overlay Monitoring – STEP626D

STEP626D behebt das Dashboard-Mapping für das Rahmen-Overlay.

## Problem

Die OBS-Quelle `Rahmen` war sichtbar, der Bus-Client `overlay:frame_overlay` war online, aber der Quellenstatus zeigte weiterhin `Bus fehlt` und `HB fehlt`.

## Lösung

Das Dashboard nutzt jetzt vor dem normalen Score-Matching ein explizites Mapping für Rahmen-Quellen:

- `Rahmen`
- `_rahmen.html`
- `frame_overlay`

werden auf Bus-Clients mit folgenden Tokens gemappt:

- `frameoverlay`
- `rahmenoverlay`

## Dateien

- `htdocs/dashboard/modules/overlays.js`
- `project-state/STEP626D_RAHMEN_FRAME_OVERLAY_MAPPING.md`
- `docs/current/OVERLAY_MONITORING_STEP626D.md`
- `README_STEP626D_RAHMEN_FRAME_OVERLAY_MAPPING.md`

## Tests

```powershell
node --check htdocs\dashboard\modules\overlays.js
```

## Hinweise

Es wurden keine OBS-Quellen geändert und keine Backend-Routen angepasst.
