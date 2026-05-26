# STEP278R - Version Display Cleanup

## Ziel

STEP-Angaben sollen ab sofort nur noch für Doku, Projektstand, Changelog, ZIP-Namen und Übergaben genutzt werden. Module, Tools, APIs und UI-Ausgaben sollen sichtbar nur Versionsnummern anzeigen.

## Geändert

- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Debug View

Die Debug View wurde auf `v0.1.1` aktualisiert.

Sichtbar entfernt:

- Badge `STEP278Q · Test / Debug`
- Anzeige `0.6.0 / STEP278P`
- Tool-Info `0.1.0 / STEP278Q`
- Step-/Build-Felder in Log-/Details-Ausgaben

Sichtbar jetzt:

- `Communication Bus · Test / Debug`
- Modulversion nur als `0.6.0`
- Toolversion nur als `Tool v0.1.1`

## Neue Regel

Dokumentiert in:

```text
docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md
```

## Bewusst nicht geändert

- Keine Backend-Codeänderung.
- Keine API-Felder entfernt.
- Keine neue API.
- Keine Datenbankmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Keine Änderung am Master-Test-Overlay.
- Keine Änderung am Communication Helper.
