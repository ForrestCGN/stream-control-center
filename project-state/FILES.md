# FILES

Stand: 2026-05-26 / STEP489

## Geaenderte / neue Dateien

- `backend/modules/channelpoints.js`
  - neues Fachmodul fuer das Kanalpunkte-System.
  - Version `0.1.0`.
  - Routen `/api/channelpoints/status` und `/api/channelpoints/bus-test`.
  - nutzt den integrierten Communication-Bus-Contract aus STEP488.

## Dokumentation

- `project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `docs/modules/channelpoints-deep-dive.md`
- `docs/modules/README.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md`

## Nicht geaendert

- `backend/modules/helpers/helper_communication.js`
- `backend/modules/communication_bus.js`
- `backend/modules/twitch.js`
- `backend/modules/clip_shoutout.js`
- `htdocs/dashboard/*`
- `config/*`
- Keine Datenbankdatei.
- Keine `.env`.
- Keine Secrets/Tokens.
- Keine Twitch-Schreibaktionen.

## Weiterhin entfernen, falls STEP487 lokal entpackt wurde

- `backend/modules/helpers/helper_communication_contract.js`
