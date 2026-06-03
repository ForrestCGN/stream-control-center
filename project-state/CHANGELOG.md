# CHANGELOG

## CAN-42.15 - Sound-System Status-Diagnostics

Geändert:

- `backend/modules/sound_system.js`
  - `MODULE_VERSION` auf `0.1.21` erhöht.
  - `MODULE_BUILD = "diagnostics-standard"` ergänzt.
  - `MODULE_META.build` ergänzt.
  - Read-only Helper `safeCountTableRows()` ergänzt.
  - Read-only Helper `buildStandardDiagnostics()` ergänzt.
  - `/api/sound/status` liefert zusätzlich `moduleVersion`, `moduleBuild`, `diagnosticVersion`, `routes`, `routeCount`, `dataEndpoints` und `diagnostics`.

Der neue `diagnostics`-Block enthält:

- `counts` für Queue, aktive Sounds, konfigurierte Sounds, Routen, Settings, SoundBus-, CommandBus- und CAN-Bus-Zähler.
- `database` mit Adapter, Pfad, Schema-Version und Settings-Tabelle.
- `state` mit Enabled/Pause/Phase, Client-, Device-, Discord-, SoundBus- und CAN-Bus-Status.
- `warnings`, `errors`, `lastError`.

Nicht geändert:

- keine Sound-Ausführung
- keine Queue-/Parallel-/Bundle-Logik
- keine Play-/Stop-/Skip-/Pause-/Resume-Routen
- keine EventBus-Test-/Command-Routen
- keine Overlay-/Device-/Discord-Playback-Logik
- keine DB-Migration
- keine Dashboard-Dateien
- keine Funktionalität entfernt
