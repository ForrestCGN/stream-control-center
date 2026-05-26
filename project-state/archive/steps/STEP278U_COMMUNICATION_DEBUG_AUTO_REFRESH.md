# STEP278U - Communication Debug Auto Refresh

## Ziel

Die Communication Debug View soll Bus-Statuswerte automatisch aktualisieren, ohne Seitenreload und ohne manuelles Klicken auf `Status aktualisieren`.

## Version

```text
communication_debug_view v0.1.3
```

## Umsetzung

Geändert:

- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Funktionen:

- Auto-Refresh standardmäßig aktiv.
- Intervall: 2000 ms.
- Button `Auto-Refresh: AN/AUS`.
- Last-Update zeigt Tool-Version und Auto-Zustand.
- Auto-Refresh ruft nur `/api/communication/status` auf.
- Kein Log-Spam bei Auto-Refresh.
- Busy-Schutz während manueller Aktionen.
- Keine sichtbaren STEP-/Build-Anzeigen.

## Test

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Alert-Mirror-Test:

```text
http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Auto%20Refresh%20Test&ttlMs=60000
```

Erwartung:

- `emitted`, `delivered`, `acks` steigen automatisch.
- Event wird ohne Page-Reload sichtbar.
- Auto-Refresh kann aus- und wieder eingeschaltet werden.

## Nicht geändert

- Keine Backend-Codeänderung.
- Keine neue API.
- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite mit Auth/Rollen.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
- Keine Änderung am Master-Test-Overlay.
