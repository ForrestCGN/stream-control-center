# FILES

Stand: 2026-05-26 / STEP488

## Geänderte Dateien

- `backend/modules/helpers/helper_communication.js`
  - Version `0.4.0`.
  - Modul-zu-Modul-Contract direkt im bestehenden Bus-Core ergänzt.
  - Neue Funktionen: `registerModule`, `unregisterModule`, `heartbeatModule`, `publishModuleStatus`, `subscribe`, `unsubscribe`, `getSubscriptions`.
  - `getStatus()` enthält `subscriptions[]` und Subscriber-Statistiken.

## Dokumentation

- `project-state/STEP488_COMMUNICATION_BUS_CORE_CONTRACT.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `docs/modules/core-communication-bus.md`
- `docs/modules/README.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md`

## Nicht geändert

- `backend/modules/communication_bus.js`
- `backend/modules/twitch.js`
- `backend/modules/clip_shoutout.js`
- `htdocs/dashboard/*`
- `config/*`
- Keine Datenbankdatei.
- Keine `.env`.
- Keine Secrets/Tokens.

## Entfernen, falls STEP487 bereits entpackt wurde

- `backend/modules/helpers/helper_communication_contract.js`
