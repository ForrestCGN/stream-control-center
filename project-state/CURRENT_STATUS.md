# CURRENT_STATUS

## Aktueller Arbeitsstand CAN-42.18

CAN-42.18 vorbereitet: Birthday `/api/birthday/status` liefert zusätzlich einen standardisierten `diagnostics`-Block für die zentrale Admin-Diagnose.

Geändert:

```text
backend/modules/birthday.js
```

Ergebnis:

- `MODULE_VERSION` wurde auf `0.6.1` erhöht.
- `MODULE_BUILD = "diagnostics-standard"` wurde ergänzt.
- `MODULE_META.build` wurde ergänzt.
- `/api/birthday/status` liefert zusätzlich:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`
- Der `diagnostics`-Block enthält `counts`, `database`, `state`, `warnings`, `errors` und `lastError`.

Nicht geändert:

```text
Birthday-Command-Ausführung
automatische Geburtstagsgrüße
Tagebuch-/Chat-Ausgabe
Birthday-Show-/Party-/Queue-Logik
Upload-/Import-/Media-Logik
Admin-User-/Settings-/Texteditor-Routen
DB-Migrationen
Dashboard-Dateien
```

Keine Funktionalität entfernt.
