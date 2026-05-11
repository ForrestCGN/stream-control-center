# CURRENT_SYSTEM_STATUS - STEP251 Update

DeathCounter V2 unterstützt Zusatzspieler jetzt auch über das Dashboard.

Neu im Dashboard:

```text
Community → DeathCounter → Steuerung → Zusatzspieler
```

Funktionen:

```text
- Zusatzspieler hinzufügen
- Zusatzspieler entfernen
- alle Zusatzspieler leeren
- aktive Zusatzspieler als Pills anzeigen
- Grenze aus maxExtraPlayers anzeigen
```

Technisch:

- Dashboard nutzt weiterhin die zentrale Command-API `/api/deathcounter/v2/command`.
- Dashboard schreibt nicht direkt in JSON, SQLite oder State-Dateien.
- `sendChat=0` verhindert Chat-Ausgaben bei Dashboard-Aktionen.
- Übersicht/Sichtbare-Spieler-Anzeige nutzt jetzt Standardspieler plus Zusatzspieler.

Nicht geändert:

```text
backend/modules/deathcounter_v2.js
backend/modules/twitch.js
app.sqlite
data/deathcounter/deathcounter.v2.json
htdocs/overlays/_overlay-deathcounter-v2.html
Streamer.bot Actions/Exports
```
