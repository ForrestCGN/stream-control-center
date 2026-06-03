# CHANGELOG

## CAN-42.12c - Dashboard generischer Diagnostics-Details-Renderer

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_generic_details.js
project-state/*
docs/current/*
```

Details:

```text
- Neuer read-only Renderer für generische Detailwerte aus diagnostics-Blöcken.
- Anzeige von diagnostics.counts, diagnostics.database, diagnostics.state, diagnostics.queue, diagnostics.runtime, warnings und errors, wenn vorhanden.
- Version/Schema/Routen/Config/Textsystem/Fehler werden generisch aus diagnostics nachgezogen.
- Keine Backend-Änderung.
- Keine produktiven Aktionen.
- Keine Funktionalität entfernt.
```
