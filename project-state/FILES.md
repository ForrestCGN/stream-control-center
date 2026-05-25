# FILES

## STEP448 enthaltene Dateien

- `backend/modules/vip_sound_overlay.js`
  - Version `1.8.30`
  - Aktiviert den kontrollierten produktiven VIP-Bus-Pfad.
  - Nutzt `sound_bus_command` als produktiven VIP-Flow.
  - Behält Legacy `/api/sound/play` als Fallback bei Bus-Fehlern.

- `backend/modules/sound_system.js`
  - Version `0.1.20`
  - Ergänzt den produktiven Sound-Bus-Command-Consumer.
  - Neue Route: `/api/sound/eventbus/command/play`.
  - Direkte Datei-Payloads wie `vip/adoredpenny.mp3` bleiben unterstützt.

- `docs/current/CURRENT_SYSTEM_STATUS.md`
  - Dokumentiert STEP448 und den kontrollierten Produktiv-Test.

- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP448_VIP_BUS_FIRST_PRODUCTIVE_TEST.md`
