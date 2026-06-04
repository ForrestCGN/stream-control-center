# CURRENT_STATUS

Stand: 2026-06-04
Projekt: `stream-control-center`

## Aktueller stabiler Arbeitsstand

Die aktuelle Arbeitsphase am Shoutout-/AutoShoutout-System ist abgeschlossen.

Aktueller Fokus war das gemeinsame Shoutout-Textsystem:

```text
Modul: backend/modules/clip_shoutout.js
MODULE_VERSION: 0.2.25
API_PREFIX: /api/clip-shoutout
Text-Tabelle: module_text_variants
Dashboard-Texttab: htdocs/dashboard/modules/shoutout_texts.js
```

## Abgeschlossene CAN-44 Schritte

```text
CAN-44.14  Shoutout Dashboard Structure Plan
CAN-44.15  Shoutout System Standards Alignment
CAN-44.16  Shoutout Text Inventory Migration Plan
CAN-44.17  Shoutout Text Backend Routes Plan
CAN-44.18  Shoutout Text Backend Foundation
CAN-44.19  Shoutout Text Dashboard Tab
CAN-44.19.1 Shoutout Text UI Cleanup
CAN-44.19.2 Shoutout Text Dropdown Layout
CAN-44.19.3 Shoutout Text Dropdown Polish
CAN-44.19.4 Dokumentation / Übergabe
```

## Aktuell bestätigter Zustand

Der gemeinsame Texte-Tab im Shoutout-System ist vorhanden und als Zwischenstand optisch akzeptiert.

Der Texttab nutzt Dropdowns statt Listenlayout:

```text
Kategorie-Dropdown
Text-Key-Dropdown
Editor darunter
Varianten als einzelne Felder
Migration/Kompatibilität kompakt eingeklappt
```

## Getestet

Backend-Routen wurden erfolgreich getestet:

```text
GET /api/clip-shoutout/texts
GET /api/clip-shoutout/texts/migration
```

Erwartetes Ergebnis wurde erreicht:

```text
ok: true
moduleVersion: 0.2.25
table: module_text_variants
count: 15
variantCount: 23
migration: dryRun true
noRuntimeChange true
dashboardReady true
```

## Projektstandards weiterhin verbindlich

```text
Keine Funktionalität entfernen.
DB niemals neu bauen/ersetzen.
Aktive app.sqlite nicht überschreiben.
Schemaänderungen nur sanft und migrationsfähig.
Neue DB-Logik möglichst MariaDB-kompatibel planen.
Vorhandene Helper verwenden, keine Parallelstrukturen.
Texte über helper_texts/module_text_variants.
Config über bestehende Config-Helper/DB-Settings.
ZIPs immer mit echten Zielpfaden liefern.
GitHub/dev und Live bewusst synchron halten.
```

## Wichtiger UX-Hinweis

Dashboard-Layouts dürfen nicht nur auf Forrests aktueller Auflösung gut aussehen. Neue Layouts müssen responsive funktionieren und bei kleineren Breiten sinnvoll umbrechen.

## Nächster Hauptfokus

Im neuen Chat soll der größere Dashboard-Umbau des Shoutout-Systems geplant und umgesetzt werden:

```text
Shoutout-System Dashboard neu organisieren
AutoShoutout sauber integrieren
Chat-Shoutout als eigenen Bereich führen
Texte-Tab beibehalten
Diagnose/Produktion/Live-Test zusammenführen
Einstellungen klar trennen
```
