# STEP469_SHOUTOUT_DASHBOARD_MODULE

## Ziel

Das bestehende Clip-/Video-Shoutout-System als eigenes Dashboard-Modul sichtbar machen.

## Geänderte Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP469_SHOUTOUT_DASHBOARD_MODULE.md
```

## Umsetzung

- `index.html` lädt `shoutout.css` und `shoutout.js`.
- `index.html` enthält ein neues Panel `#shoutoutModule`.
- `shoutout.js` registriert das Modul dynamisch in `window.CGN`.
- Das Modul erscheint im Community-Bereich als `Shoutout-System`.
- Das Modul zeigt:
  - Modulstatus
  - Command und Aliases
  - Display-Queue
  - Official-Queue
  - Official Live-Gate
  - zentralen Streamstatus
  - Timeline
  - Testauslösung über `/api/clip-shoutout/run`

## Bewusst nicht geändert

- Keine Änderung an `backend/modules/clip_shoutout.js`.
- Keine Änderung an `backend/modules/stream_status.js`.
- Keine Änderung an `!vso` oder Produktiv-Command.
- Keine Änderung an Display-Queue, Official-Queue, Cooldowns, Timeline oder Streamtag-Limit.
- Keine Änderung an Chatmeldungen.
- Keine Änderung am Sound-System.

## Tests

```bat
node --check htdocs\dashboard\modules\shoutout.js
```

Dashboard öffnen und `Community -> Shoutout-System` prüfen.
