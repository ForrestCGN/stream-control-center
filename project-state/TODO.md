# TODO

Stand: 2026-06-01

## CAN-9 / Recovery-Preflight Route

- [x] CAN-9.0 Recovery-Preflight Route Startgrenze dokumentieren.
- [ ] CAN-9.1 Route-Datenmodell und Sicherheitsvertrag planen.
- [ ] Vor erstem CAN-9 Code-Step echte `backend/modules/bus_diagnostics.js` pruefen.
- [ ] Read-only GET-Grenze definieren.
- [ ] Keine POST-/Command-/Execute-Route freigeben.
- [ ] Safety-Felder und Testbefehle fuer spaetere Route festlegen.
- [ ] Dashboard-Aktionsbuttons weiterhin blockieren.

## Harte Recovery-Sperren

- [ ] Kein Alert-Replay ohne separate Planung, Audit, Rechte, Duplikat-Sperre und ausdrueckliches Go.
- [ ] Kein Sound-Replay ohne separate Planung, Audit, Rechte, Duplikat-Sperre und ausdrueckliches Go.
- [ ] Kein Overlay-Retry ohne separate Planung und ausdrueckliches Go.
- [ ] Keine Auto-Recovery.
