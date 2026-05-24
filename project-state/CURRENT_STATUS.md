# CURRENT_STATUS

## STEP278U

Communication Debug Auto Refresh ergänzt.

Version:

```text
communication_debug_view v0.1.3
```

Geändert:

- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278U_COMMUNICATION_DEBUG_AUTO_REFRESH.md`

Funktionen:

- Auto-Refresh ist standardmäßig aktiv.
- Bus-Status wird alle 2 Sekunden automatisch aktualisiert.
- Button `Auto-Refresh: AN/AUS` ergänzt.
- Last-Update zeigt Tool-Version und Auto-Refresh-Zustand.
- Auto-Refresh schreibt keinen Log-Spam.
- Auto-Refresh pausiert während manueller Aktionen per Busy-Schutz.
- Keine sichtbaren STEP-/Build-Anzeigen.

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite mit Auth/Rollen.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
- Keine Änderung am Master-Test-Overlay.

## STEP278T

Overlay Reconnect Deploy Robustness ergänzt.

Version:

```text
overlay_master_test v0.1.3
```

Funktionen:

- Master-Test-Overlay v0.1.3.
- Keine sichtbare STEP-/Build-Anzeige im Overlay.
- `MODULE_META.build` aus dem Overlay entfernt.
- Hello-Ack-Watchdog.
- Heartbeat-Ack-Watchdog.
- Forced-Reconnect bei stale Verbindung.

## STEP278S

Controlled Alert Mirror Test ergänzt.

Versionen:

```text
communication_bus v0.7.0
communication_debug_view v0.1.2
```

Neue Test-Route:

```text
/api/communication/test-alert
```
