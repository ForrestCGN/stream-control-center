# CURRENT CHAT HANDOFF CAN-42.35

## Aktueller Stand

CAN-42.35 dokumentiert die bewusst behaltenen Dashboard-Extensions dauerhaft.

## Wichtig

Die zentrale Dashboard-Diagnose ist bereinigt:

- `htdocs/dashboard/modules/diagnostics.js`
- `htdocs/dashboard/modules/diagnostics.css`
- `GET /api/diagnostics/registry`

Die alten nicht mehr geladenen Diagnose-Dateien sind aus Repo und Live entfernt.

## Bewusst behaltene Extensions

Dokumentiert in:

- `docs/modules/DASHBOARD_EXTENSIONS.md`

Behalten:

- Commands Read-only Diagnose
- Hug erweiterte Read-only-Diagnose
- Message-Rotator erweiterte Read-only-Diagnose
- Bus-Diagnose Read-only Summary
- Bus-Diagnose Subpage Safety
- Overlay-Monitor Safety

## Regel für neue Module

Neue Module müssen direkt berücksichtigen:

- Statusroute
- `diagnostics`-Block
- Registry-Eintrag
- Registry-Coverage
- Doku
- keine neue Diagnose-Extra-Datei ohne explizite Begründung

## Standardtest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
```

Erwartung:

```text
ok: True
missingLoadedModules: 0
registryOnlyEntries: 0
```

## Nächster Schritt

Nach Commit/Push von CAN-42.35 kann wieder fachlich mit dem nächsten Modul weitergearbeitet werden.
