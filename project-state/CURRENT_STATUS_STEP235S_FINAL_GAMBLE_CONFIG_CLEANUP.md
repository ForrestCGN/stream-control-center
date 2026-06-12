# PROJECT STATE – STEP235S Final Gamble Config Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center

## Final bestätigter Stand

```text
STEP235S – Final Gamble Config Cleanup
```

## Zusammenfassung

Der Gamble-Config-Cleanup im Loyalty-Dashboard ist abgeschlossen.

```text
Loyalty ist fest in der Dashboard-Shell registriert.
Gamble ist in Loyalty integriert.
Gamble-Config liegt unter Loyalty → Config → Gamble.
Standalone-Gamble-Dateien wurden entfernt.
STEP232-/Gamble-Shell-Reste sind nicht mehr vorhanden.
Runtime-Shell-Fallback aus loyalty_games.js wurde entfernt.
Actor-/Rollenfelder sind aus der normalen UI entfernt.
Cooldowns werden in Sekunden angezeigt.
Backend/API/DB/Audit bleiben unverändert.
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

## Rechte-/Session-System

```text
Kommt später.
Aktuell nur vorbereitet.
getDashboardActor() kann später window.CGN.auth.user nutzen.
Bis dahin Fallback: forrestcgn / ForrestCGN / streamer.
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
LWG-4Q.12 – Giveaways-UI nach LWG-4Q.11 klein und manuell prüfen
```

Regel:

```text
Ein Giveaway, ein Prüfpunkt, danach löschen.
Keine großen UI-assisted Scripts.
```
