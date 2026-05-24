# CURRENT_STATUS

## STEP278R

Version Display Cleanup und neuer verbindlicher Anzeige-Standard ergänzt.

Neu:

- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `project-state/STEP278R_VERSION_DISPLAY_CLEANUP.md`

Geändert:

- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Tool-Version:

```text
communication_debug_view v0.1.1
```

Neue verbindliche Regel:

- Module, Code, APIs, Tools und UI-Ausgaben zeigen sichtbar nur Versionsnummern.
- STEP-Angaben werden nur noch für Doku, Projektstand, Changelog, ZIP-Namen und Übergaben genutzt.
- Keine neuen sichtbaren `Version / STEP...` Anzeigen.
- Bestehende API-Felder wie `moduleBuild` dürfen aus Kompatibilitätsgründen vorerst bestehen bleiben, werden aber in UI-/Debug-Ausgaben nicht mehr angezeigt.

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

## STEP278Q

Communication Bus Debug View ergänzt.

Neu:

- `htdocs/public/tools/communication_debug_view.html`
- `project-state/STEP278Q_COMMUNICATION_DEBUG_VIEW.md`

Funktionen:

- lesbare Bus-Übersicht für Stats, Versionen und Zähler
- Client-Ansicht mit Status, Modul, Version, Heartbeat, ACK und Capabilities
- Event-Ansicht mit Replay-/ACK-Flags, Delivery, ACK-Count und Ablaufzeit
- Watchdog-Diagnose mit aktuellen Problemen
- Recovery-Anzeige für `includeRecovered=1`
- historische Issues aus `issues[]`
- Buttons für Status, Watchdog, Watchdog-Tracking, Recovery, Replay und Reset
