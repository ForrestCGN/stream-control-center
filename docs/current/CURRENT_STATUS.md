# CURRENT_STATUS – stream-control-center

Stand: 2026-06-16

## Aktueller bestätigter Arbeitsstand

```text
LC-CORE-LIVE-CLEANUP-3 – Status/Dashboard auf Aktiv/Inaktiv bereinigt und geprüft
Nächster offener Test: Raffle-Teilnahmekosten live prüfen
```

## Kurzfazit

Der Loyalty-Core läuft produktiv im Live-only-Betrieb. Die zuvor im Shadow-Modus gesammelten Punkte wurden vollständig bereinigt: normale User wurden nach Live migriert, Test-/Bridge-/System-Reste wurden genullt. Shadow ist leer und wird fachlich nicht mehr als Betriebsmodus genutzt. Der normale Status und das Dashboard sind jetzt auf Aktiv/Inaktiv ausgerichtet.

Bestätigt:

```text
Loyalty Core läuft produktiv.
/api/loyalty/status meldet mode=live, enabled=true, shadowMode=false, pointsState=active.
/api/loyalty/balance/urlug meldet balanceShadow=0, balanceLive=1006852, activeBalance=1006852.
/api/loyalty/balance/tronic6 meldet balanceShadow=0, balanceLive=12536, activeBalance=12536.
Migrationstool-Dry-Run meldet candidates=0 totalShadow=0 und excluded=0 excludedShadow=0.
Live ist ab jetzt der einzige relevante Punkte-Stand.
Die normalen Statusfelder streamElementsStillActive/importStatus wurden aus dem Hauptstatus entfernt.
Legacy-Infos bleiben nur noch im Diagnosebereich, wo sie bewusst als technische Hinweise dienen.
```

## Loyalty Live-only / Shadow-Migration

### Migrationsergebnis

```text
Normale User migriert: 468
Nach Live gebuchte Shadow-Summe: 69116 Kekskrümel
Ignored/API-blockierte User wurden nicht nach Live gebucht.
Test-/Bridge-/Diagnose-User wurden aus der Migration ausgeschlossen.
Rest-Shadow-Werte wurden anschließend gezielt genullt.
```

### Abschlussprüfung

```text
node .\tools\loyalty_migrate_shadow_to_live_once.js --dry-run
```

Ergebnis:

```text
candidates=0 totalShadow=0
excluded=0 excludedShadow=0
Keine User mit balanceShadow > 0 gefunden.
```

### Wichtige Referenzwerte

```text
Urlug:
  balanceShadow = 0
  balanceLive   = 1006852
  activeBalance = 1006852
  activeMode    = live

Tronic6:
  balanceShadow = 0
  balanceLive   = 12536
  activeBalance = 12536
  activeMode    = live
```

## Betriebslogik ab jetzt

Fachlich gibt es im Loyalty-Core nur noch:

```text
Aktiv   = live
Inaktiv = off
```

`shadowMode` bleibt aus Kompatibilitätsgründen vorerst als API-Feld vorhanden, ist aber `false`. Alte `mode=shadow`-Werte aus Config/API sollen im Runtime-Pfad nicht mehr zu Shadow-Buchungen führen, sondern als Live behandelt werden.

## Status Live-System

Bestätigte Statuswerte aus `/api/loyalty/status` nach Cleanup-3:

```text
module = loyalty
version = 0.1.24
mode = live
enabled = true
shadowMode = false
pointsState = active
currencyName = Kekskrümel
schema.version = 4
```

Bestätigt: Die alten Hauptstatusfelder `streamElementsStillActive` und `importStatus` sind im normalen Status nicht mehr vorhanden. Legacy-Infos bleiben nur im Diagnosebereich `diagnostics.legacyFallbacks`.

## Raffle / Mini-Spiele – bestätigter Stand

```text
backend/modules/loyalty_giveaways.js
moduleVersion = 0.1.13
moduleBuild = STEP_LC_MINIGAMES_2B_FIX3_TEXT_DB_CLEANUP
```

Bestätigte Raffle-Routen:

```text
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/giveaways/raffle/status   Kompatibilität
```

## Raffle-Config

Aktuell fachlich relevante Config:

```text
enabled
liveOnly
durationSeconds
maxDurationSeconds
prizePoolAmount
entryCostAmount
entryCostEnabled
showPoolInChat = false
```

Command-Felder werden nicht mehr im Raffle-Config-Bereich bearbeitet. Sie bleiben intern erhalten und gehören langfristig nach `Loyalty -> Chat & Befehle` bzw. in das zentrale Command-Modul.

## Teilnahmekosten

Teilnahmekosten wurden backendseitig vorbereitet/eingebaut:

```text
entryCostAmount = 0  -> kostenlos
entryCostAmount > 0  -> entryCostEnabled=true, Join soll Punkte abbuchen
```

Bestätigt:

```text
POST/GET /api/loyalty/raffle/config speichert entryCostAmount=10 und entryCostEnabled=true korrekt.
```

Noch offen:

```text
Live-Test mit !raffle / !join bei genug Punkten
Live-Test mit !join bei zu wenig Punkten
Cancel-Test mit Erstattung bezahlter Teilnahmen
Normaler Ablauf mit Auszahlung und ohne Erstattung
```

## Textsystem / Cleanup

Raffle/Giveaway/Ticket/Wheel-Texte laufen weiter über den vorhandenen Helper:

```text
backend/modules/helpers/helper_texts.js
helper_texts.renderModuleText(...)
```

Keine eigene Zufallslogik wurde gebaut.

Bestätigt:

```text
Alte aktive mehrzeilige Sammelvarianten wurden für loyalty_giveaways Textbereiche bereinigt.
Prüfung auf aktive Varianten mit Zeilenumbrüchen lieferte keine Ausgabe.
Raffle nutzt produktiv neue Keys raffle.public.*.
Alte raffle.* Seed-Keys wurden aus dem aktiven Pfad entfernt/bereinigt.
```

## Dashboard-Stand

Geänderte Dashboard-Dateien im aktuellen Stand:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
```

Bestätigt:

```text
Mini-Spiele ist Status-/Bedienseite.
Raffle-Config wurde aus Mini-Spiele herausgezogen.
Einstellungen -> Raffle zeigt nur fachliche Config.
Texte -> Raffle zeigt nur Raffle-Texte.
Dropdown „Alle Textbereiche“ wurde entfernt.
Texttabelle zeigt immer nur den aktuell gewählten Bereich.
Loyalty-Core-Dashboard ist auf Aktiv/Inaktiv bzw. Live-only bereinigt.
Dashboard-Beschreibung „Shadow-Runner“ wurde entfernt.
Status-/Config-Anzeige nutzt keine Import-/StreamElements-Hauptfelder mehr.
```

## Nicht geändert

```text
Keine produktive SQLite ersetzt.
Keine Transaktionen gelöscht.
Keine Raffle-Gewinnerregel geändert.
Keine Command-Registry umgebaut.
Keine Alert-Produktivumschaltung.
Keine neue Raffle-Parallelstruktur gebaut.
DB-Spalten balance_shadow, total_earned_shadow, total_spent_shadow wurden noch nicht gedroppt.
Diagnose-Legacyfelder unter diagnostics wurden nicht entfernt.
```
