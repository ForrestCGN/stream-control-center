# CHANGELOG

## CAN-38.2

- Bus-Diagnose/EventBus-Doku vorbereitet:
  - `docs/modules/bus_diagnostics.md`
- Dokumentiert:
  - Modulzweck
  - MODULE_META / Version / Routenprefix
  - interne Status-Endpunkte
  - read-only Status-Felder
  - Recovery-Preflight-Sicherheit
  - Recovery-Readiness
  - Read-only Routen
  - produktive/verbotene Aktionen
  - Dashboard-Tabs und Dashboard-Routen
  - Read-only Summary Card
  - bekannter MutationObserver-Stabilitätspunkt
  - Regeln für spätere Bus-Diagnose-Erweiterungen
- Keine Codeänderung.
- Keine Recovery ausgelöst.
- Keine OBS-Reparatur.
- Kein Source-Refresh.
- Keine automatische Recovery.
- Keine Queue-Aktion.
- Keine produktive Sound-Bus-Aktion.
- Keine DB-Migration.
- Keine Dashboard-Testbuttons für produktive Aktionen.
- Keine Twitch-/Chat-/Discord-Nachricht.

## CAN-38.1

- EventBus / Bus-Diagnose read-only analysiert.
- Ergebnis:
  - `backend/core/event_bus.js` wurde nicht gefunden.
  - Aktives Bus-Diagnose-Modul ist `backend/modules/bus_diagnostics.js`.
  - Dedizierte Doku `docs/modules/bus_diagnostics.md` fehlte.
  - `bus_diagnostics_readonly_summary.js` nutzt aktuell einen MutationObserver und ist Kandidat für Stabilitäts-Cleanup.
