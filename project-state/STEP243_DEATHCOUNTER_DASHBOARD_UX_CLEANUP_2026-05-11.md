# STEP243 - DeathCounter Dashboard UX Cleanup

Stand: 2026-05-11

## Ziel

DeathCounter-Dashboard nach dem ersten Browser-Test schlanker und praktischer machen.

## Geändert

```text
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
```

## Inhalt

- Übersicht bleibt kurz und zeigt Status, KPIs und sichtbare Spieler.
- Spieler-Tab erhält Suche und Sortierung.
- Statistik-Tab zeigt KPIs und Toplisten weiter, jetzt sauberer als eigener Bereich.
- Settings werden nach Bereichen gruppiert: Commands, Chat-Ausgabe, Overlay, Streamstart.
- Texte werden nach Kategorien gruppiert: Fehler/Hinweise und Tode/Statistiken.
- Steuerung erhält Warnhinweis und Bestätigungsabfragen für Reset und -1 Tod.

## Bewusst nicht geändert

```text
backend/modules/deathcounter_v2.js
app.sqlite
data/deathcounter/deathcounter.v2.json
DeathCounter Overlay HTML
Streamer.bot Actions
```

Keine Count-/State-Migration, kein Overlay-Design-Refresh.

## Tests

```powershell
node --check htdocs/dashboard/modules/deathcounter.js
```

Browser-Test:

```text
http://127.0.0.1:8080/dashboard/
Community -> DeathCounter
```

Prüfen:

```text
- Tabs schalten sauber.
- Übersicht ist kurz.
- Spieler-Suche und Sortierung funktionieren.
- Settings sind gruppiert.
- Texte sind nach Kategorien gruppiert.
- Reset und -1 fragen nach Bestätigung.
```
