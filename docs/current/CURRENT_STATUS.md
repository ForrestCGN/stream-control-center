# CURRENT_STATUS – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Stand

```text
LWG-4Q.12N – Final Gamble/Giveaways Cleanup Docs + Next Chat Prompt
```

## Gesamtstand Loyalty / Giveaways / Gamble

Der aktuelle Stand umfasst den abgeschlossenen Giveaways-/Tabs-Cleanup aus LWG-4Q.12J und die danach live getesteten Gamble-Fixes aus LWG-4Q.12K bis LWG-4Q.12M.

## Dashboard-Zuständigkeiten

```text
loyalty_games.js
  → Übersicht
  → Glücksrad
  → Presets
  → Gamble
  → Config
  → Chat/Commands
  → Verlauf
  → Hinweise
  → Redirect/Bridge zum neuen Giveaway-Control

loyalty_giveaways.js
  → Giveaways
  → Giveaway erstellen/bearbeiten
  → Details
  → Live-Steuerung
  → Bound-Wheel-Editor für Giveaways
  → Hard-Delete
```

## Bestätigter Giveaways-/Tabs-Stand

```text
Loyalty → Giveaways öffnet das neue Giveaway-Control.
Die Tab-Leiste bleibt vollständig sichtbar.
Gamble und Config sind auch im Giveaways-Modul erreichbar.
Giveaways bleibt im Giveaways-Control aktiv markiert.
Andere Tabs leiten zurück zu loyalty_games.js.
```

Vollständige Loyalty-Tab-Leiste:

```text
Übersicht
Glücksrad
Presets
Giveaways
Gamble
Config
Chat/Commands
Verlauf
Hinweise
```

## Bestätigter Gamble-Stand

```text
Gamble läuft im Loyalty-Dashboard unter Loyalty → Gamble.
Gamble-Config läuft unter Loyalty → Config → Gamble.
Standalone-Gamble-Seite und STEP232-Gamble-Shell sind entfernt.
Gamble-Textausgabe gibt pro Ergebnis nur noch eine Textvariante aus.
Gamble-Rechnung ist vereinfacht:
  Gewinn = Einsatz dazu
  Verlust = Einsatz weg
Das gilt für feste Einsätze und Prozent-Einsätze.
```

## Aktuelle Gamble-Config-UI

Sichtbar bleiben:

```text
Engine aktiv
Command aktiv
Chat-Antwort
Gewinnchance %
Command-Cooldown pro User
Mindesteinsatz
Maximaleinsatz
Prozent-Einsätze erlauben
Keyword-Einsätze erlauben
```

Entfernt/ausgeblendet:

```text
Auszahlung x
Gamble-Cooldown pro User
Gamble-Cooldown global
```

## Gamble-Zuständigkeit

```text
Command-System
  → !gamble aktiv/aus
  → Command-Cooldown
  → Chat-Antwort-Ziel/Sendefreigabe

Gamble-Engine
  → Einsatz parsen
  → Gewinn/Verlust berechnen
  → Punkte addieren/abziehen
  → Session/Event/Audit/Runtime-Daten
```

## Interne Absicherung nach LWG-4Q.12M

Beim Speichern der Gamble-Config werden intern gesetzt:

```text
games.gamble.payoutMultiplier = 2
games.gamble.userCooldownMs = 0
games.gamble.globalCooldownMs = 0
```

Damit gibt es keine doppelte Cooldown-Logik mehr.

## Wichtige Projektregel

```text
Keine Funktionalität entfernen.
Bestehende echte Dateien/GitHub-dev als Single Source of Truth verwenden.
SQLite-Datenbank niemals ersetzen oder überschreiben.
Änderungen immer mit echten Zielpfaden im ZIP liefern.
```
