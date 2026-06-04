# NEXT CHAT HANDOFF – Shoutout-System / AutoShoutout CAN-44

Stand: 2026-06-04

## Einstieg im neuen Chat

Bitte direkt hier weitermachen:

```text
Wir arbeiten am ForrestCGN stream-control-center.
Aktueller Fokus: Shoutout-System / AutoShoutout / Dashboard.
Letzter abgeschlossener Stand: CAN-44.19.4 Dokumentation nach Shoutout-Texttab.
Nächster geplanter Schritt: CAN-44.20 – Shoutout Dashboard Reorganisation.
```

## Wichtigste Projektregeln

```text
Keine Funktionalität entfernen.
Keine DB ersetzen oder neu bauen.
Aktive app.sqlite niemals überschreiben.
Sanfte Migrationen only.
DB-Logik möglichst MariaDB-kompatibel planen.
Vorhandene Helper nutzen.
Keine Parallelstrukturen.
Alles sinnvoll Konfigurierbare in Config/DB/Helper.
Texte über helper_texts/module_text_variants.
ZIPs mit echten Zielpfaden.
Bei neuen Modulen/Steps Doku aktualisieren.
```

## Aktueller Shoutout-Stand

Backend:

```text
backend/modules/clip_shoutout.js
MODULE_VERSION = 0.2.25
API_PREFIX = /api/clip-shoutout
```

Dashboard:

```text
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/shoutout_texts.js
```

Texttab:

```text
Dropdown-Layout
Kategorie Dropdown
Text-Key Dropdown
Varianten Editor
Migration / Kompatibilität eingeklappt
```

Routen:

```text
GET  /api/clip-shoutout/texts
POST /api/clip-shoutout/texts
GET  /api/clip-shoutout/texts/migration
```

Textsystem:

```text
module_text_variants
module_texts als Legacy/Kompatibilität
shoutout.* Keys vorbereitet
auto.greeting bleibt Legacy/Fallback
Runtime noch nicht umgestellt
```

## Bestätigter Test

Der Nutzer hat `/api/clip-shoutout/texts` und `/api/clip-shoutout/texts/migration` erfolgreich getestet.

Ergebnis:

```text
ok true
moduleVersion 0.2.25
count 15
variantCount 23
dryRun true
noRuntimeChange true
dashboardReady true
```

## Aktuelle UX-Entscheidung

Listenlayout war schlecht.
Dropdown-Layout ist besser und akzeptiert.

Wichtig:
Immer responsive denken. Nicht nur auf Forrests aktueller Auflösung designen.

## Nächster STEP: CAN-44.20

Ziel:
Das gesamte Shoutout-Dashboard neu organisieren.

Vorgeschlagene neue Tabs:

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

## Umsetzungsempfehlung für CAN-44.20

Erst Plan/Bestandsabgleich, dann Code:

1. Aktuelle Dashboard-Dateien aus GitHub/dev prüfen.
2. Bestehende Tabs und Routen mappen.
3. Zielstruktur final bestätigen.
4. Dann Dashboard in kleinen Steps umbauen.
5. Texttab aus CAN-44.19.3 beibehalten.
6. AutoShoutout nicht mehr als angeflanschten Extra-Tab wirken lassen.
7. Production/Live-Test in Diagnose zusammenführen.
8. Settings/Test in echte Einstellungen aufteilen.

## Später

```text
CAN-44.21 Runtime Text-Key Migration
```

Ziel:
Runtime schrittweise auf `shoutout.*` Textkeys umstellen, alte Config-Texte und Legacy-Keys aber als Fallback behalten.

## Noch nicht machen ohne Go

- komplette Runtime-Textumstellung
- Entfernen von auto.greeting
- DB-Tabellen löschen
- alte Auto-Text-Routen entfernen
- komplettes Dashboard-Shell-Redesign
- rechte Navigation nach oben verschieben

Die Idee mit oberer, immer sichtbarer Navigation ist notiert, aber ein späterer größerer Dashboard-Shell-Step.
