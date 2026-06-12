# NEUER CHAT PROMPT – stream-control-center / Loyalty Giveaways + Gamble

Bitte diesen Prompt im neuen Chat einfügen.

---

Wir arbeiten am Projekt `ForrestCGN/stream-control-center`.

## Arbeitsweise

Sprache: Deutsch.  
Bitte immer Schritt für Schritt arbeiten.  
Erst aktuellen Stand prüfen, dann Prüfblock nennen, dann auf mein `go` warten.  
Keine Funktionalität entfernen.  
Keine Annahmen über vorhandene Dateien treffen, sondern aktuelle echte Dateien/GitHub-dev bzw. hochgeladene ZIPs als Single Source of Truth nutzen.  
SQLite-Datenbank niemals ersetzen/überschreiben. Migrationen nur sanft per `CREATE TABLE IF NOT EXISTS` oder sichere Migration.

Repo:

```text
ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
```

Nach ZIP-Entpacken nutzt Forrest:

```powershell
.\stepdone.cmd "STEP-NAME"
```

## Aktueller Stand

Stand ist `LWG-4Q.12N – Final Gamble/Giveaways Cleanup Docs`.

## Giveaways

Giveaways sind im neuen Giveaway-Control.

```text
loyalty_games.js
  → Übersicht, Glücksrad, Presets, Gamble, Config, Chat/Commands, Verlauf, Hinweise

loyalty_giveaways.js
  → Giveaways, Giveaway erstellen/bearbeiten, Details, Live-Steuerung, Bound-Wheel-Editor, Hard-Delete
```

Wichtig:

```text
Loyalty → Giveaways öffnet neues Giveaway-Control.
Tabs bleiben vollständig sichtbar.
Gamble und Config bleiben erreichbar.
Alte Inline-Giveaway-Seite in loyalty_games.js nicht wieder einführen.
Alter Inline-Giveaway-Wheel-Editor nicht wieder einführen.
```

Vollständige Tab-Leiste:

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

## Gamble aktueller Stand

Gamble ist integriert unter:

```text
Loyalty → Gamble
Loyalty → Config → Gamble
```

Standalone-Gamble-Seiten/Shells sind entfernt.

Wichtige abgeschlossene Fixes:

```text
LWG-4Q.12K:
Gamble-Textausgabe gibt pro Ergebnis nur eine Textvariante aus.
Problem war: mehrere aktive Varianten wurden als mehrzeiliger Text in eine Chatnachricht geklebt.

LWG-4Q.12L:
Gamble-Engine rechnet jetzt einfach:
  Gewinn = Einsatz dazu
  Verlust = Einsatz weg
Gilt für feste Einsätze und Prozent-Einsätze.

LWG-4Q.12M:
Gamble-Config-UI aufgeräumt:
  Auszahlung x entfernt
  Gamble-Cooldown pro User entfernt
  Gamble-Cooldown global entfernt
  Command-Cooldown pro User bleibt sichtbar
```

## Gamble-Zuständigkeit

```text
Command-System:
  !gamble aktiv/aus
  Command-Cooldown
  Chat-Antwort/sendResultToChat

Gamble-Engine:
  Einsatz parsen
  Gewinn/Verlust berechnen
  Punkte addieren/abziehen
  Session/Event/Audit/Runtime-Daten
```

Nicht wieder doppelt einbauen:

```text
Engine-Cooldown zusätzlich zum Command-Cooldown
sichtbarer Auszahlungsmultiplikator
Brutto-Payout-Modell im Chat
```

## Aktuelle Gamble-Config-UI

Sichtbar:

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

Nicht sichtbar:

```text
Auszahlung x
Gamble-Cooldown pro User
Gamble-Cooldown global
```

Intern beim Dashboard-Speichern:

```text
games.gamble.payoutMultiplier = 2
games.gamble.userCooldownMs = 0
games.gamble.globalCooldownMs = 0
```

## Zuletzt relevante Dateien

```text
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/commands.js
backend/modules/helpers/helper_texts.js
```

## Prüfroutine

Bei UI-/Backend-Änderungen immer testen:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
```

## Aktuell offene nächste Schritte

```text
1. StreamElements-Gamble/Roulette abschalten, damit nur HeimaufsichtCGN antwortet.
2. Live-Abnahme !gamble 100 und !gamble 10%.
3. Giveaway-Control optisch weiter glätten.
4. Wheel-/Preset-/Bound-Wheel-Begriffe vereinheitlichen.
5. Command-/Chat-Seite auf zentrale Cooldown-/Aktiv-Schalter prüfen.
6. Später echtes Dashboard-Rechtesystem anbinden.
```

## Wichtig

Wenn ich `go` sage, erst echte Dateien prüfen und dann gezielt ändern.  
Bitte keine Parallelstrukturen erfinden.  
Bitte keine alten STEP232-/Standalone-Gamble-Shells wieder verwenden.
