# Current System Status

## STEP278U - Communication Debug Auto Refresh

Communication Debug View wurde auf `v0.1.3` erweitert.

Neu/Geändert:

- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Version:

```text
communication_debug_view v0.1.3
```

Funktionen:

- Auto-Refresh ist standardmäßig aktiv.
- Status wird alle 2 Sekunden über `/api/communication/status` aktualisiert.
- Auto-Refresh kann über Button ein-/ausgeschaltet werden.
- Last-Update zeigt Tool-Version und Auto-Refresh-Zustand.
- Auto-Refresh schreibt keinen Log-Spam.
- Während manueller Aktionen pausiert Auto-Refresh kurz über Busy-Schutz.
- Keine sichtbaren STEP-/Build-Anzeigen.

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Keine Produktivmigration.
- Keine DB-/OBS-/Dashboard-Änderung.

## STEP278T - Overlay Reconnect Deploy Robustness

Master-Test-Overlay `v0.1.3` ergänzt mit Hello-/Heartbeat-Watchdog und Forced-Reconnect bei stale Verbindung.

## STEP278S - Controlled Alert Mirror Test

Communication Bus `v0.7.0` mit reiner Test-Route `/api/communication/test-alert` für `visual.alert.play` ergänzt.
