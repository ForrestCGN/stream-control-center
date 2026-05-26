# STEP251 - DeathCounter Dashboard Extra Players

Stand: 2026-05-11

## Ziel

Die DeathCounter-Dashboard-Steuerung kann Zusatzspieler jetzt direkt verwalten, ohne Twitch-Chat oder Streamer.bot.

## Neu im Dashboard

Im Tab `Steuerung` gibt es einen neuen Bereich `Zusatzspieler`:

```text
- Zusatzspieler hinzufügen
- Zusatzspieler entfernen
- alle Zusatzspieler leeren
- Anzeige aktiver Zusatzspieler
- Anzeige der Grenze aus maxExtraPlayers
```

## Technisches Verhalten

Die Dashboard-Buttons nutzen weiter die zentrale Command-API:

```text
/api/deathcounter/v2/command?command=dcount&input0=add&input1=@user&sendChat=0
/api/deathcounter/v2/command?command=dcount&input0=remove&input1=@user&sendChat=0
/api/deathcounter/v2/command?command=dcount&input0=clear&sendChat=0
```

Damit bleibt die Logik an einer Stelle im Backend. Das Dashboard schreibt nicht direkt in JSON, SQLite oder State-Dateien.

## Zusätzlich angepasst

- `getVisiblePlayers()` berücksichtigt jetzt Standardspieler plus Zusatzspieler.
- Die Übersicht zeigt damit alle aktuell sichtbaren Overlay-Spieler korrekt an.
- Die Steuerung blendet bereits sichtbare Spieler im Hinzufügen-Dropdown aus.
- Entfernen zeigt nur aktive Zusatzspieler an.

## Betroffene Dateien

```text
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
```

## Nicht geändert

```text
backend/modules/deathcounter_v2.js
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Actions/Exports
```

## Tests

```text
node --check htdocs/dashboard/modules/deathcounter.js
```

Empfohlene Live-Tests:

```text
Community → DeathCounter → Steuerung
- Zusatzspieler hinzufügen
- Zusatzspieler entfernen
- Zusatzspieler leeren
- Übersicht prüfen: sichtbare Spieler müssen Standard + Extras anzeigen
```
