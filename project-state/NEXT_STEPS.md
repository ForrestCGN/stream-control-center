# NEXT STEPS

Stand: LWG-4Q.12R / Documentation & Next Chat Handoff
Datum: 2026-06-12

## Sofortiger nächster Schritt

Vor neuer Umsetzung zuerst prüfen:

1. GitHub/dev und Live-System abgleichen.
2. Aktuelle echte Dateien lesen.
3. Prüfen, ob die letzten ZIPs LWG-4Q.12O/P/Q bereits per `stepdone.cmd` übernommen wurden.
4. Nur dann gezielt weiterplanen.

## Nächster fachlicher Arbeitsblock

### A) Config-Tab konsolidieren

Ziel:

- Diverse Modul-Configs sauber im zentralen Loyalty-`Config`-Tab bündeln.
- Keine doppelten Config-UIs pro Modul bauen, wenn zentrale Config-Struktur möglich ist.
- Bestehende Save-/Load-Routen und Berechtigungen prüfen.

Vor Umsetzung prüfen:

```text
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/commands.js
config/*loyalty*
config/*dashboard*
```

Nicht ungeprüft ändern:

- Backend-Routen.
- Datenbank.
- Command-System.
- Rechte-/Sessionmodell.

### B) Eigener Texte-Tab

Ziel:

- Text-Configs aus den Config-Flächen herauslösen.
- Eigener Tab `Texte` oder vergleichbarer Name.
- Dropdown zur Auswahl einzelner Module/Textbereiche.
- Varianten pro Text-Key dashboardfähig anzeigen/bearbeiten.

Vor Umsetzung prüfen:

```text
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
htdocs/dashboard/modules/loyalty_games.js
module_texts
module_text_variants
```

Wichtig:

- Keine neue Parallel-Textstruktur bauen.
- Vorhandene `module_texts` / `module_text_variants` nutzen.
- Texte weiterhin kategorisiert und variantenfähig halten.

### C) Gamble-Langzeitstatistik

Aktueller Zustand:

- Gamble-Statistik im Modal basiert nur auf geladenen Command-Logs im Frontend.

Später sauber planen:

- Backend-Route für echte aggregierte Gamble-Statistik.
- Zeitraumfilter.
- User-Statistik:
  - Spiele
  - Gewinne
  - Verluste
  - Gewinnrate
  - Einsatz gesamt
  - Netto
  - letzter Gamble

Vor Umsetzung prüfen:

```text
backend/modules/commands.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
command_execution_log
loyalty transaction/audit Tabellen
```

### D) StreamElements abschalten

Später manuell/extern erledigen:

- StreamElements-Gamble/Roulette abschalten.
- Ziel: Nur HeimaufsichtCGN antwortet auf Gamble.

## Standard-Testblock bei Dashboard-JS-Änderungen

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```

## Standard-Testblock bei Backend-Gamble-/Loyalty-Änderungen

```powershell
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
node -c .\backend\modules\commands.js
```

## Nach erfolgreicher Übernahme dieses Doku-Steps

```powershell
.\stepdone.cmd "LWG-4Q.12R Documentation and Next Chat Handoff"
```
