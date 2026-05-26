# STEP248 - DeathCounter Spieler-Detail Quick-Corrections

Stand: 2026-05-11

## Ziel

Die Spieler-Detailansicht im DeathCounter-Dashboard wurde um schnelle, aber bewusst abgegrenzte Korrektur-Aktionen erweitert.

## Geändert

```text
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
```

## Funktion

Im Spieler-Tab zeigt die Detailkarte jetzt einen Bereich „Aktuelles Spiel korrigieren“:

```text
+1 Tod
-1 Tod
Steuerung öffnen
```

Die Aktionen nutzen weiterhin die bestehende zentrale Command-API:

```text
/api/deathcounter/v2/command?command=rip&input0=@spieler&sendChat=0
/api/deathcounter/v2/command?command=rip&input0=@spieler&input1=del&sendChat=0
```

`-1 Tod` fragt weiterhin per Browser-Confirm nach Bestätigung.

## Bewusst nicht geändert

```text
backend/modules/deathcounter_v2.js
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Actions/Exports
```

## Wichtig

Die Quick-Corrections wirken auf das aktuelle DeathCounter-Spiel. Korrekturen für alte/andere Spiele bleiben ein späterer Schritt und sollten erst mit sauberer DB-/Event-Historie umgesetzt werden.
