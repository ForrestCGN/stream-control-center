# STEP350 – Alert Dashboard Control + Bus Correlation View

## Ziel

Alert-System, Alert-SoundBundle und SoundBus im Dashboard sichtbar zusammenführen und den Dev-Testpfad für Alert-Bus-Modi kontrollierbar machen.

## Änderungen

- `backend/modules/alert_system.js`
  - `MODULE_STEP = 350`
  - Status-Metadaten `alertDashboardCorrelation` ergänzt.
- `htdocs/dashboard/modules/alerts.js`
  - neuer Tab `Bus / Sync`
  - neue Bus-/Sync-Seite mit Output-Modus, Watchdog und Alert-SoundBundle-Korrelation
  - Modus speichern über bestehende `/api/alerts/config` API
  - `bus_only` mit Bestätigungsschutz
- `htdocs/dashboard/modules/alerts.css`
  - Styling für Bus-/Sync-Karten, KPIs und Tabellen

## Nicht geändert

- keine Alert-Queue-Logik
- keine Sound-Queue-Logik
- keine Bundle-/activeBundleLock-Logik
- keine SoundBus-Event-Logik
- keine Overlay-Bus-only-Produktivmigration
- keine DB-Migration

## Test

1. Backend neu starten.
2. `/api/alerts/status` und `/api/sound/status` prüfen.
3. Dashboard öffnen: `Alerts → Bus / Sync`.
4. V5-Testscript ausführen.
5. Prüfen: `alertStep=350`, `soundStep=340`, `alertBundlesFailed=0`, `soundBusErrors=0`, `queuedCount=0`, `activeBundleLock` leer.
