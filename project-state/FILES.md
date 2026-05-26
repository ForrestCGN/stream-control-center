# FILES

Stand: 2026-05-26 / STEP485

## Geänderte Dateien

- `backend/modules/twitch.js`
  - EventSub-Status um Shoutout-Readiness erweitert.
  - Export `getEventSubStatusSnapshot()` ergänzt.

- `backend/modules/clip_shoutout.js`
  - Version `0.2.12`.
  - Route `/api/clip-shoutout/production-check`.
  - Produktionscheck für OAuth/Scopes/EventSub/Shoutout-Subscriptions.

- `htdocs/dashboard/modules/shoutout.js`
  - neuer Tab `Produktion`.
  - lädt `/api/clip-shoutout/production-check`.

- `htdocs/dashboard/modules/shoutout.css`
  - Checklisten-Styles für Produktionscheck.

## Dokumentation

- `project-state/STEP485_SHOUTOUT_PRODUCTION_CHECK.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `docs/modules/clip-shoutout-vso-deep-dive.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md`

## Nicht geändert

- Keine Datenbankdatei.
- Keine `.env`.
- Keine Secrets/Tokens.
- Keine neue Moduldatei.
