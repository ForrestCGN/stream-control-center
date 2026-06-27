# Current Chat Handoff – LWG-4Q.12P Gamble UI Cleanup

## Ziel

Der Gamble-Tab wurde visuell aufgeräumt. Die normale Ansicht zeigt keine technische Audit-Liste mehr.

## Änderung

Datei:

```text
htdocs/dashboard/modules/loyalty_games.js
```

Umgesetzt:

- Gamble-Hauptansicht reduziert auf Status, Chance, Cooldown, Netto/Kurzstatistik.
- Technische `dashboard_config_write`-Audit-Liste aus der Hauptansicht entfernt.
- Button `Statistik öffnen` öffnet ein Modal mit Spielerübersicht.
- Button `Audit öffnen` öffnet ein separates Modal für Config-Audit.
- Statistik aggregiert aktuell die zuletzt geladenen Command-Logs.

## Nicht geändert

```text
Backend
Datenbank
Gamble-Berechnung
Punktebuchung
Command-Logik
Cooldown-Logik
Giveaway-Control
StreamElements-Abschaltung
```

## Wichtig

Die Spieler-Statistik ist aktuell eine Frontend-Auswertung aus `/api/commands/logs?limit=80`. Für eine echte Langzeitstatistik muss später eine Backend-Route geplant werden.

## Folgeschritte

Geplant, aber in diesem Step noch nicht umgesetzt:

1. Diverse Config-Bereiche sauber in den zentralen Config-Tab bringen.
2. Text-Configs in einen eigenen Tab verschieben.
3. Text-Tab mit Dropdown für einzelne Module aufbauen.
4. Für echte Gamble-Langzeitstatistik Backend-API prüfen/planen.

## Tests

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
```
