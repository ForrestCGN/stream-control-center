# CAN-42.12c - Generischer Diagnostics-Details-Block

## Ziel

Die zentrale Dashboard-Diagnose soll nicht nur für Todo/Tagebuch modul-spezifische Detailwerte anzeigen. Wenn ein Modul einen standardisierten `diagnostics`-Block in seiner Statusroute liefert, sollen vorhandene Informationen generisch angezeigt werden.

## Umsetzung

Neue Datei:

```text
htdocs/dashboard/modules/diagnostics_generic_details.js
```

Einbindung in:

```text
htdocs/dashboard/index.html
```

Der neue Renderer arbeitet ausschließlich read-only und nutzt vorhandene GET-Statusrouten. Er ergänzt auf Modul-Detailseiten, wenn vorhanden:

```text
diagnostics.counts
diagnostics.database
diagnostics.state
diagnostics.queue
diagnostics.runtime
diagnostics.warnings
diagnostics.errors
```

Zusätzlich zieht er die allgemeinen Detail-Metriken aus `diagnostics` als Strings nach:

```text
Version
Schema
Routen
Config-Quelle
Textsystem
Letzter Fehler
```

## Nicht geändert

```text
Keine Backend-Dateien
Keine produktiven POST-Routen
Keine Hug-/Command-/Tagebuch-/Todo-Logik
Keine DB-Migration
Keine Command-/Hug-Ausführung
Keine Funktionalität entfernt
```

## Erwartung

Module wie Hug und Commands zeigen automatisch ihre `diagnostics.counts` an. Künftige Module profitieren ebenfalls, sobald sie standardisierte Diagnostics-Daten liefern.
