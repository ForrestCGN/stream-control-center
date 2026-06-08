# Changelog – stream-control-center

## 2026-06-08 – STEP LWG-4F.1 Loyalty Modules Use Existing Communication Bus

### Korrektur

- Verworfenen Ansatz mit neuem Helper ersetzt.
- Kein `helper_module_bus.js`.
- Kein neuer Bus.
- Kein neues Modul.

### Geaendert

- `loyalty_games` nutzt vorhandenen `communication_bus.getBus()`.
- `loyalty_giveaways` nutzt vorhandenen `communication_bus.getBus()`.
- Beide registrieren sich per `registerModule`.
- Beide senden Heartbeat per `heartbeatModule`.
- Beide publishen Status per `publishModuleStatus`.
