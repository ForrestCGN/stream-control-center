# CHANGELOG

## CAN-39.4

- Erfolgreiche Sichtprüfung des Overlay-Monitor Sicherheits-Hinweises nach CAN-39.3b dokumentiert.
- Bestätigt:
  - Sicherheits-Hinweis sichtbar.
  - Text sichtbar: "Read-only / manuelle Aktionen getrennt".
  - Text sichtbar: "Overlay-Monitor Sicherheits-Hinweis".
  - Hinweise sichtbar: Status lesen, keine Recovery, kein Auto-Refresh von Quellen, OBS-Aktionen gesperrt.
  - Kein zusätzlicher Tab.
  - Übersicht bleibt bedienbar.
  - Bestehende Kennzahlen bleiben sichtbar.
  - Bestehende Tabs bleiben sichtbar.
  - Keine OBS-Reparatur.
  - Kein Source-Refresh.
  - Keine Recovery.
  - Keine DB-/Chat-Aktion.
- Keine Codeänderung in CAN-39.4.

## CAN-39.3b

- Overlay-Monitor Sicherheits-Hinweis stabilisiert.
- `overlay_monitor_safety_ext.js` mit begrenztem Retry nach Render ergänzt.
- Stabilere Einfügeposition nach `.ovm-head`.
- Keine Backend-Änderung.
- Keine Änderung an `overlays.js`.
- Kein Extra-Tab.
- Keine produktive Aktion.
- Keine API-POSTs.
- Keine MutationObserver.

## CAN-39.3

- Overlay-Monitor UI-Sicherheitsmarkierung vorbereitet.
- Neue Dateien:
  - `htdocs/dashboard/modules/overlay_monitor_safety_ext.js`
  - `htdocs/dashboard/modules/overlay_monitor_safety_ext.css`

## CAN-39.2

- Overlay-Monitor-Doku ergänzt:
  - `docs/modules/overlay_monitor.md`

## CAN-39.1

- Overlay-Monitor / Overlay-Dashboard read-only analysiert.
