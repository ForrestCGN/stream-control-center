# STEP624C – Externe Browserquellen korrekt bewerten

## Ziel
Externe OBS-Browserquellen wie SoundAlerts, StreamStickers oder ViewerAttack dürfen nicht als Warnung/Fehler bewertet werden, nur weil sie keinen CGN-EventBus-Client und keinen CGN-Heartbeat senden.

## Änderungen
- `htdocs/dashboard/modules/overlays.js`
  - erkennt externe Browserquellen anhand der URL/Host-Erkennung.
  - lokale CGN-Overlays bleiben Quellen mit erwartetem Bus/Heartbeat.
  - externe Quellen werden als `Extern sichtbar` bzw. `Extern ausgeblendet` bewertet.
  - externe Quellen werden nicht mehr fälschlich mit `_Alerts`/Alert-Bus-Clients verknüpft.
  - Quellenstatus hat Filter `Extern`.
  - Übersicht zählt externe Quellen separat.

## Nicht geändert
- Keine OBS-Aktionen.
- Kein Cache-Refresh.
- Keine Reparaturbuttons.
- Keine DB-Migration.
- Kein Backend-Code.

## Erwartetes Ergebnis
Externe Quellen in verschachtelten Szenen erscheinen z. B. als:

- `_SoundAlerts` → Extern sichtbar / kein Bus erwartet
- `_StreamStickers` → Extern sichtbar / kein Bus erwartet
- `_ViewerAttack` → Extern sichtbar / kein Bus erwartet

Warnungen bleiben für lokale CGN-Overlayquellen relevant, wenn diese sichtbar sind, aber keinen passenden Bus-Client oder keinen Heartbeat haben.
