# Tagebuch Diagnose-Tab deaktiviert

## Stand

```text
CAN-42.10
```

## Ziel

Die direkte Tagebuch-Diagnose-Extension wird aus der Modul-Seite entfernt/deaktiviert, weil `Admin > Diagnose > Tagebuch` die Informationen jetzt zentral aus dem standardisierten `diagnostics`-Block liest.

## Änderung

Aus `htdocs/dashboard/index.html` entfernt:

```text
/dashboard/modules/tagebuch_readonly_diagnostics.css
/dashboard/modules/tagebuch_readonly_diagnostics.js
```

## Nicht gelöscht

Die Dateien selbst bleiben im Projekt erhalten:

```text
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.css
htdocs/dashboard/modules/tagebuch_readonly_diagnostics.js
```

## Nicht geändert

```text
backend/modules/tagebuch.js
htdocs/dashboard/modules/tagebuch.js
```

## Ergebnis

```text
Tagebuch-Modul-Seite bleibt Bedienseite.
Tagebuch-Diagnose läuft zentral über Admin > Diagnose.
Keine Funktionalität entfernt.
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
