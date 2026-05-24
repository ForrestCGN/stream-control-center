# CURRENT_STATUS

## STEP278S

Controlled Alert Mirror Test ergänzt.

Versionen:

```text
communication_bus v0.7.0
communication_debug_view v0.1.2
```

Geändert:

- `backend/modules/communication_bus.js`
- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278S_CONTROLLED_ALERT_MIRROR_TEST.md`

Neue Test-Route:

```text
/api/communication/test-alert
```

Test-URL:

```text
http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Alert%20Mirror%20Test
```

Funktionen:

- sendet ein alert-ähnliches Bus-Event mit `visual.alert.play`
- dient nur als Mirror-/Transporttest
- schreibt nichts in Alert-DB, Alert-Queue, Sound- oder TTS-Systeme
- Debug View enthält einen Button `Alert Mirror Test`
- Communication Bus gibt neue/überarbeitete Modulantworten ohne sichtbare STEP-/Build-Felder aus

Wichtig:

- Keine Produktivmigration des Alert-Systems.
- Keine Änderung an `/api/alerts/*`.
- Keine Alert-DB-/Queue-Änderung.
- Keine Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite mit Auth/Rollen.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
- Keine Änderung am Master-Test-Overlay.

## STEP278R

Version Display Cleanup und neuer verbindlicher Anzeige-Standard ergänzt.

Version:

```text
communication_debug_view v0.1.1
```
