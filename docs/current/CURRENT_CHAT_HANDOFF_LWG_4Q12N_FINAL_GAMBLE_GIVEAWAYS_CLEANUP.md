# CURRENT CHAT HANDOFF – LWG-4Q.12N Final Gamble/Giveaways Cleanup Docs

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Giveaways / Gamble

## Kurzfassung

Dieser Stand dokumentiert den finalen Stand nach:

```text
LWG-4Q.12G bis LWG-4Q.12J:
Giveaways-/Tabs-/Legacy-Cleanup

LWG-4Q.12K:
Gamble-Textvarianten-Fix

LWG-4Q.12L:
Gamble Simple Win/Loss Logic

LWG-4Q.12M:
Gamble Config Cleanup
```

## Wichtigster aktueller Stand

```text
Giveaways sind im neuen Giveaway-Control.
Gamble ist im Loyalty-Dashboard integriert.
Gamble-Config ist unter Loyalty → Config → Gamble.
Gamble rechnet jetzt einfach:
  Gewinn = Einsatz dazu
  Verlust = Einsatz weg
Cooldown gehört zum Command-System, nicht doppelt in die Gamble-Engine.
```

## Zuletzt bestätigte Live-Tests

```text
!gamble gibt wieder eine Antwort aus.
Keine mehrfach zusammengeklebten Textvarianten mehr.
Gewinn-/Verlustlogik sieht aktuell gut aus.
Cooldown-Probleme kamen vom Command-Cooldown.
```

## Wichtig: Keine alte Annahme wieder einführen

Nicht wieder zurückbauen auf:

```text
Einsatz immer abziehen + Bruttoauszahlung per payoutMultiplier
sichtbares Feld „Auszahlung x“
Engine-Cooldown zusätzlich zum Command-Cooldown
Standalone-Gamble-Dashboard
STEP232-Gamble-Shell
alte Inline-Giveaway-Seite in loyalty_games.js
```

## Aktuell relevante Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/modules/loyalty_giveaways.css
```

## Aktuelle Testbefehle

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
```

## Nach Änderungen

```powershell
.\stepdone.cmd "PASSENDER STEP-NAME"
```

## Nächste sinnvolle Arbeit

Nicht direkt große neue Systeme anfangen. Erst entscheiden:

```text
Option A:
Gamble/Giveaways Stand sauber live abnehmen und dokumentiert lassen.

Option B:
Giveaway-Control optisch weiter glätten.

Option C:
Chat/Command-Seite prüfen, ob Command-Cooldowns und aktive Commands sauber angezeigt werden.

Option D:
StreamElements-Gamble endgültig abschalten/ersetzen, damit nur noch HeimaufsichtCGN antwortet.
```
