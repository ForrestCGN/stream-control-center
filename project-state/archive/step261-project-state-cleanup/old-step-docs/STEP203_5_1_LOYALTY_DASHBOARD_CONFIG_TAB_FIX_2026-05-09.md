# STEP203.5.1 - Loyalty Dashboard Config Tab Fix

Stand: 2026-05-09

## Problem

Der Tab `Konfig` im Loyalty-Dashboard blieb leer.

Ursache:

```text
GET /api/loyalty/settings
```

liefert die Settings als direktes Array unter:

```text
settings: [...]
```

Der Dashboard-Helper `rows()` konnte bisher nur Objekte mit `rows`, `users`, `data.rows` oder `data.users` auslesen.

## Fix

Geändert:

```text
htdocs/dashboard/modules/loyalty.js
```

Anpassung:

```text
rows() akzeptiert jetzt direkte Arrays sowie settings/data.settings.
```

## Keine Backend-Änderung

- keine API geändert
- keine DB geändert
- keine Settings geändert
- keine Funktionalität entfernt

## Test

```powershell
node -c htdocs\dashboard\modules\loyalty.js
```

Dashboard:

```text
Community -> Loyalty -> Konfig
```

Erwartung:

```text
Settings-Gruppen werden angezeigt:
Core
Features
Watch
Stream-State
Presence
Auto Runner
Rest
```
