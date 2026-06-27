# CAN-42.12b - Hug Diagnostics Display Fix

## Ziel

Die zentrale Dashboard-Diagnose soll beim Hug-System dieselben Werte anzeigen, die `/api/hug/status` nach CAN-42.12 bereits korrekt liefert.

## Befund

PowerShell/API-Test nach CAN-42.12:

```text
moduleVersion = 0.1.1
moduleBuild = diagnostics-standard
diagnostics.version = 0.1.1
diagnostics.health = ok
```

Dashboard-Anzeige:

```text
Version = 0.1
Routen = -
```

## Umsetzung

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
```

`index.html` lädt nach `diagnostics.js` das neue Ergänzungsscript:

```html
<script src="/dashboard/modules/diagnostics_hug_display_fix.js"></script>
```

Das Script:

- ist read-only,
- löst nur GET auf `/api/hug/status` aus,
- patcht nur sichtbare Diagnose-Metriken im Hug-Detailpanel,
- führt keine Admin-/Backend-/Produktivaktion aus.

## Nicht geändert

```text
Kein Backend geändert
Keine Hug-/Rehug-Logik geändert
Keine DB geändert
Keine produktive Route geändert
Keine Funktionalität entfernt
```

## Test

```powershell
.\stepdone.cmd "CAN-42.12b Dashboard Hug diagnostics display fix"
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js
```

Dashboard:

```text
Admin > Diagnose > Hug-System
Version = 0.1.1
Routen = 1 oder echte Routenzahl
```
