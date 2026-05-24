# Current System Status

## STEP278S - Controlled Alert Mirror Test

Ein kontrollierter Alert-Mirror-Test wurde über den Communication Bus ergänzt.

Versionen:

```text
communication_bus v0.7.0
communication_debug_view v0.1.2
```

Neu:

- `project-state/STEP278S_CONTROLLED_ALERT_MIRROR_TEST.md`

Geändert:

- `backend/modules/communication_bus.js`
- `htdocs/public/tools/communication_debug_view.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neue Test-Route:

```text
/api/communication/test-alert
```

Test-URL:

```text
http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Alert%20Mirror%20Test
```

Funktionen:

- sendet ein alert-ähnliches Testevent über den Communication Bus
- nutzt `channel: visual.alert` und `action: play`
- dient nur dem Mirror-/Transporttest für Master-Test-Overlay und Debug View
- Debug View besitzt einen Button `Alert Mirror Test`
- neue/überarbeitete API-Ausgaben nutzen sichtbar nur Versionsnummern

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

## STEP278R - Version Display Cleanup

Sichtbare STEP-/Build-Anzeigen wurden aus der Communication Debug View entfernt und ein verbindlicher Anzeige-Standard für Module ergänzt.
