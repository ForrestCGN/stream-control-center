# Current System Status

## STEP278R - Version Display Cleanup

Sichtbare STEP-/Build-Anzeigen wurden aus der Communication Debug View entfernt und ein verbindlicher Anzeige-Standard für Module ergänzt.

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

- Module/Code/API/UI zeigen sichtbar nur Versionsnummern.
- STEP-Angaben bleiben ausschließlich Doku-/Projektstand-/Changelog-/ZIP-/Übergabe-Historie.
- Keine neuen sichtbaren Anzeigen im Muster `vX / STEP...`.

Wichtig:

- Keine Backend-Codeänderung.
- Keine neue API.
- Bestehende API-Felder wie `moduleBuild` bleiben aus Kompatibilitätsgründen vorerst erhalten, werden aber in der Debug View nicht mehr sichtbar angezeigt.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.

## STEP278Q - Communication Bus Debug View

Eine lesbare Debug-Ansicht für den Communication Bus wurde ergänzt.

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```
