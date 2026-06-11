# NEXT STEPS

Stand: STEP233 / Project Audit nach STEP232

## Sofortiger nächster Schritt

Keine neuen Features bauen.
Keine neuen Apply-Scripte bauen.
Keine neuen Patch-/Regex-Fixes bauen.

## Reihenfolge für den nächsten Arbeitsblock

1. GitHub/dev und Live-System vergleichen.
2. Echte Dashboard-Struktur prüfen.
3. STEP232-Dateien bewerten:
   - behalten
   - bereinigen
   - zurücknehmen
   - neu sauber integrieren
4. Erst danach neuen Dashboard-Schritt planen.

## Dateien/Strukturen, die vor jeder weiteren Dashboard-Arbeit geprüft werden müssen

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/`
- `htdocs/dashboard/loyalty-gamble.html`
- `htdocs/dashboard/modules/loyalty-gamble.js`
- `htdocs/dashboard/modules/loyalty-gamble.css`
- `htdocs/dashboard/modules/loyalty-gamble-nav.js`
- `htdocs/dashboard/modules/loyalty-gamble-shell-card.js`
- `htdocs/dashboard/modules/loyalty-gamble-shell-card.css`
- `config/dashboard_navigation_loyalty_gamble.json`
- `config/dashboard_shell_loyalty_gamble.json`
- `config/loyalty_gamble_dashboard_ui.json`

## Nächster sinnvoller STEP

STEP234 / Dashboard Audit & Bereinigungsentscheidung

Ziel:
- keine neue Funktion
- keine Runtime-Änderung
- nur echte Struktur prüfen
- entscheiden, was mit STEP232 passiert
