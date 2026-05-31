# STEP626G – Inventar-Warnstatus final korrigieren

## Ziel
Das OBS-Inventar durfte funktionierende CGN-Overlays nicht mehr als Warnung anzeigen, wenn Bus-Client und echter Heartbeat vorhanden sind.

## Änderungen
- `backend/modules/overlay_monitor.js`
  - Inventarstatus akzeptiert jetzt `busClientId` als gültigen Bus-Nachweis, nicht nur ein internes `busClient`-Objekt.
  - Persistierte/aus RAM geladene Inventarstände werden vor der Ausgabe normalisiert.
  - Summary/Warnungszähler werden nach der Normalisierung neu berechnet.
  - Externe Namen werden vor generischen Alert-Regeln erkannt: SoundAlerts, StreamStickers, ViewerAttack.
- `htdocs/dashboard/modules/overlays.js`
  - Dashboard berechnet den effektiven Inventarstatus zusätzlich defensiv aus Quelle, Bus-ID und Heartbeat.
  - CGN + Bus vorhanden + Heartbeat OK wird als OK angezeigt.
  - Warnungen zählen nur noch echte warning/error-Zustände.
  - _SoundAlerts wird als SoundAlerts angezeigt, nicht als Alerts V2.

## Nicht geändert
- Keine OBS-Aktionen.
- Keine Reparaturbuttons.
- Keine DB-Migration.
- Keine Overlay-Funktionslogik.
