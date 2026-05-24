# Files – stream-control-center

Stand: STEP297 – SoundBus Debug View Test dokumentiert
Aktualisiert: 2026-05-24T14:40:00Z

## Zuletzt relevante Dateien

### Debug / Tools

```text
htdocs/public/tools/soundbus_debug_view.html
```

- Ergänzt in STEP296.
- Beobachtende SoundBus Debug View.
- Keine ACKs standardmäßig.
- Test in STEP297 bestätigt.

### Backend

```text
backend/modules/sound_system.js
backend/modules/discord.js
```

- `sound_system.js`: SoundBus Event-/Status-Schicht aus STEP289/289B.
- `discord.js`: Media Path Resolver Fix aus STEP293.

### Dokumentation

```text
docs/backend/SOUNDBUS_DEBUG_VIEW_STEP296.md
docs/backend/SOUNDBUS_DEBUG_VIEW_TEST_STEP297.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/STEP297_SOUNDBUS_DEBUG_VIEW_TEST.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/NEXT_STEPS.md
```

## Hinweis

STEP297 enthält keine Codeänderung. Es dokumentiert den ersten erfolgreichen Debug-View-Test und den kosmetischen/diagnostischen Befund eines zusätzlichen `sound.finished auto_finished` Events.
