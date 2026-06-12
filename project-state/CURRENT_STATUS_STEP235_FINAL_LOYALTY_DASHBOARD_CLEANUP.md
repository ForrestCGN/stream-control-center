# PROJECT STATE – STEP235 Final Loyalty Dashboard Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center

## Final bestätigter Stand

```text
518dd6e4 STEP235M Remove Loyalty Runtime Shell Fallback
9ab5e619 STEP235J Remove Standalone Gamble Dashboard
```

## Zusammenfassung

Der Loyalty-Dashboard-Bereich ist nach STEP235 bereinigt.

```text
Loyalty ist fest in der Dashboard-Shell registriert.
Gamble ist in Loyalty integriert.
Gamble-Config liegt unter Loyalty → Config → Gamble.
Alte Standalone-Gamble-Dateien wurden entfernt.
STEP232-/Gamble-Shell-Reste sind nicht mehr vorhanden.
Runtime-Shell-Fallback aus loyalty_games.js wurde entfernt.
```

## Nicht mehr als Basis verwenden

```text
STEP232
loyalty-gamble.html
loyalty-gamble.js
loyalty-gamble.css
loyalty-gamble-nav.js
loyalty-gamble-shell-card.js
loyalty-gamble-shell-card.css
```

## Aktive Zielstruktur

```text
htdocs/dashboard/app.js
htdocs/dashboard/index.html
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_giveaways.js
```

## Aktive Bedienung

```text
/dashboard
Loyalty → Gamble
Loyalty → Config → Gamble
Loyalty → Core / Kekskrümel
Loyalty → Giveaways
```

## Tests bei weiteren Änderungen

```powershell
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser:

```text
/dashboard lädt.
Loyalty links sichtbar.
Klick auf Loyalty öffnet loyalty_games.
Gamble und Config funktionieren.
Giveaways/Core erreichbar.
Keine 404 auf alte Standalone-Dateien.
Keine Console-Fehler.
```

## Nächster sinnvoller Schritt

```text
STEP235O – Gamble Config Actor-/Rollenfelder prüfen
```

Ziel:

```text
Entscheiden, ob actorLogin/actorRole im normalen Gamble-Config-Tab sichtbar bleiben oder später über echte Dashboard-Session-/Rechteinformationen gesetzt werden.
```
