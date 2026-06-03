# CHANGELOG

## CAN-38.4

- Erfolgreiche Sichtprüfung der Bus-Diagnose Read-only Summary Card nach CAN-38.3 dokumentiert.
- Bestätigt:
  - Sicherheits- / Read-only-Zusammenfassung wird oben in der Übersicht angezeigt.
  - Kein zusätzlicher Tab.
  - Tabs bleiben unverändert.
  - Status read-only: ja.
  - Recovery Route read-only: ja.
  - Flow touched: nein.
  - Queue touched: nein.
  - Sound touched: nein.
  - Overlay touched: nein.
  - Recovery prepare: nein.
  - Recovery execute: nein.
  - Gesamtstatus und weitere Bus-Karten bleiben sichtbar.
  - Keine Recovery-/OBS-/Sound-/Queue-/DB-/Chat-Aktion.
- Keine Codeänderung in CAN-38.4.

## CAN-38.3

- Bus-Diagnose Read-only Summary Card stabilisiert.
- `htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js` ersetzt.
- MutationObserver entfernt.
- Kontrollierte Event-Hooks ergänzt:
  - DOMContentLoaded
  - Bus-Diagnose-Tab-Klicks
  - Bus-Diagnose-Aktions-Klicks
  - cgn:module-show
  - hashchange
  - visibilitychange
- Karte bleibt auf der Übersicht.
- Keine Backend-Änderung.
- Keine Änderung an `htdocs/dashboard/modules/bus_diagnostics.js`.
- Keine produktive Aktion.

## CAN-38.2

- Bus-Diagnose/EventBus-Doku ergänzt:
  - `docs/modules/bus_diagnostics.md`

## CAN-38.1

- EventBus / Bus-Diagnose read-only analysiert.
- Ergebnis:
  - `backend/core/event_bus.js` wurde nicht gefunden.
  - Aktives Bus-Diagnose-Modul ist `backend/modules/bus_diagnostics.js`.
  - Dedizierte Doku `docs/modules/bus_diagnostics.md` fehlte.
  - `bus_diagnostics_readonly_summary.js` nutzt aktuell einen MutationObserver und wurde in CAN-38.3 stabilisiert.
