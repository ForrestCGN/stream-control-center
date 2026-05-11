# NEXT_STEPS Ergänzung – nach STEP201.3e

Stand: 2026-05-08

## Direkt nach Anwendung prüfen

```powershell
node --check backend\modules\message_rotator.js
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\tests\STEP201_3e_test_message_rotator_routes_integration_check.ps1
```

## Danach

Wenn Message Rotator grün ist:

```text
STEP201 Zwischenmatrix aktualisieren
```

Oder nächster Kandidat:

```text
STEP201.3f – VIP /routes + /integration-check prüfen/planen
```
