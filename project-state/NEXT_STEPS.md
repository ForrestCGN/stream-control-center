# NEXT STEP - Nach STEP262 DeathCounter Overlay Alert-Frame Design

## Direkt testen

In OBS bzw. Browserquelle pruefen:

```text
- Overlay wird von oben eingeblendet.
- Overlay wird nach oben ausgeblendet.
- Count-Aenderung animiert weiterhin.
- Lange Namen laufen weiterhin per Ping-Pong-Marquee.
- Zusatzspieler erscheinen weiter korrekt: zweiter Extra links, Kernspieler Mitte, erster Extra rechts.
```

API-/Backend-Test:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

## Aktuell nicht noetig

```text
- DeathCounter-Storage weiter anfassen
- Overlay-JavaScript umbauen
- API-Routen aendern
- Streamer.bot Actions anpassen
```

## Naechster sinnvoller Schritt

Erst nach Live-/OBS-Test entscheiden:

```text
- Feinschliff an Breite/Hoehe/Farben
- oder neues Modul / anderer Projektblock
```
