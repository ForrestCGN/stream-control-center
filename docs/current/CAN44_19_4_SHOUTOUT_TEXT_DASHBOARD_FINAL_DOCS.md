# CAN-44.19.4 – Shoutout Text Dashboard Final Docs / Chat-Handoff

Stand: 2026-06-04

## Zweck

Dieser Dokumentations-STEP schließt die aktuelle Arbeitsphase am gemeinsamen Shoutout-/AutoShoutout-Textbereich ab und bereitet den Wechsel in einen neuen Chat vor.

Es wurden keine Code-, Datenbank- oder Runtime-Änderungen vorgenommen. Dieser STEP enthält ausschließlich aktualisierte Projekt-/Übergabe-Dokumentation.

## Abgeschlossener Arbeitsstand

Die Schritte CAN-44.14 bis CAN-44.19.3 wurden abgeschlossen:

- CAN-44.14: Shoutout-System Dashboard-Strukturplan.
- CAN-44.15: Standards Alignment für DB, Config, Helper und Texte.
- CAN-44.16: Text-Inventar und Text-Key-Migrationsplan.
- CAN-44.17: gemeinsame Text-Routen geplant.
- CAN-44.18: Backend-Foundation für gemeinsame Text-Routen umgesetzt.
- CAN-44.19: gemeinsamer Texte-Tab im Dashboard.
- CAN-44.19.1: UI-Cleanup.
- CAN-44.19.2: Dropdown-Layout.
- CAN-44.19.3: Dropdown-Polish.

## Aktuell bestätigter Zustand

Der Texte-Tab ist optisch und funktional als Zwischenstand akzeptiert.

Der Nutzer bestätigte nach CAN-44.19.3 sinngemäß:
> Wenn ok, dokumentieren, aktualisieren, todo usw und dann neuer Chat

Der letzte Screenshot zeigt:

- Header-Card `Shoutout-System / Texte`.
- Kategorie-Dropdown.
- Text-Key-Dropdown.
- aktuelle Auswahl `shoutout.chat.accepted`.
- Editor mit Variantenfeld.
- Kategorie-Badge `Chat-Shoutout`.
- Migration/Kompatibilität kompakt und eingeklappt.
- keine sichtbaren alten Listenlinks mehr.

## Backend-Status

Aktives Modul:

```text
backend/modules/clip_shoutout.js
MODULE_NAME = clip_shoutout
MODULE_VERSION = 0.2.25
API_PREFIX = /api/clip-shoutout
```

Neue zentrale Text-Routen aus CAN-44.18:

```text
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
```

Kompatibilität:

```text
alte Auto-Text-Route bleibt:
GET/POST /api/clip-shoutout/auto/texts

alte Config-Texte bleiben Fallback
alte Legacy-Key auto.greeting bleibt Fallback
Runtime wurde noch nicht auf shoutout.* umgestellt
```

## Getestete Backend-Ausgabe

Der Nutzer testete erfolgreich:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts" |
  ConvertTo-Json -Depth 10

Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/texts/migration" |
  ConvertTo-Json -Depth 10
```

Ergebnis:

```text
ok: true
module: clip_shoutout
moduleVersion: 0.2.25
table: module_text_variants
count: 15
variantCount: 23
dashboardReady: true
migration dryRun: true
noRuntimeChange: true
```

## Aktuelle Textkategorien

```text
Legacy AutoShoutout
Chat-Shoutout
AutoShoutout
Offizieller Twitch-Shoutout
System
```

Zielkategorien für neue Keys:

```text
shoutout.chat
shoutout.auto
shoutout.official
shoutout.dashboard
shoutout.system
```

## Aktuelle wichtige Textkeys

```text
auto.greeting                         Legacy/Fallback
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.failed
shoutout.chat.duplicate
shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.alreadyQueued
shoutout.auto.alreadyReceived
shoutout.auto.cooldown
shoutout.auto.waitingStartScene
shoutout.auto.disabled
shoutout.official.queued
shoutout.official.failed
shoutout.system.textsSaved
```

## Dashboard-Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
htdocs/dashboard/modules/shoutout_texts.js
htdocs/dashboard/modules/shoutout_texts.css
```

Der neue Textbereich wurde bewusst als eigener Dashboard-Baustein gebaut, statt den bestehenden `shoutout.js` sofort komplett umzubauen.

## Design-/UX-Erkenntnis

Der erste Textbereich mit Listenlayout wirkte schlecht, weil er links gedrängt war und rechts viel leeren Raum erzeugte.

Das aktuelle Dropdown-Layout ist als besserer Zwischenstand akzeptiert:

- responsive-freundlicher
- weniger leere Fläche
- leichter verständlich
- besser für unterschiedliche Auflösungen

Wichtige spätere Designregel:
Nicht nur für Forrests aktuelle Auflösung bauen. Layouts müssen sauber umbrechen.

## Nächster großer Punkt

Nach diesem Chat soll das Shoutout-Dashboard neu organisiert werden.

Geplante Zielstruktur:

```text
Übersicht
Chat-Shoutout
AutoShoutout
Queues
Texte
Verlauf
Statistik
Eingehend
Diagnose
Einstellungen
```

Der Nutzer erwähnte zusätzlich:
Die rechte Navigation könnte später eventuell in eine obere, immer sichtbare Leiste wandern, damit darunter mehr Platz für Dashboard-Inhalte ist. Das ist ein späterer größerer Dashboard-/Layout-Umbau und nicht Teil von CAN-44.19.x.

## Nicht erledigt / bewusst offen

- Runtime nutzt noch nicht primär `shoutout.*` Textkeys.
- Alter Legacy-Key `auto.greeting` bleibt noch sichtbar und als Fallback erhalten.
- Dashboard insgesamt ist noch nicht neu organisiert.
- AutoShoutout ist noch ein eigener angehängter Tab/Baustein.
- Texte wurden technisch editierbar gemacht, aber inhaltlich müssen sie später nochmal überarbeitet werden.
- Rechte-/Top-Navigation ist nur als spätere Idee notiert.
