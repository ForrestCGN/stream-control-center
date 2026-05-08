# STEP199.4 Status-Notiz – TTS integration-check + Settings-Sanitizing

Stand: 2026-05-08

## Kurzfassung

TTS wird um den letzten Standard-Endpunkt ergänzt:

```text
GET /api/tts/integration-check
```

Zusätzlich wird die Ausgabe von `/api/tts/settings` und `/api/tts/admin/settings` bereinigt, damit keine Secret-ähnlichen Felder oder Google-Keyfile-Pfade im Dashboard/API-Output erscheinen.

## Wichtig

Diese Änderung ist ein kleiner Sicherheits-/Standardisierungs-Step.

Keine Funktionalität wird entfernt.
Keine DB-/JSON-/Secret-Dateien werden geändert.
