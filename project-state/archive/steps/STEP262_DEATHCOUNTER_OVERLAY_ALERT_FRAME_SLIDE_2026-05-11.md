# STEP262 - DeathCounter Overlay Alert-Frame Design + Slide-In/Out

Stand: 2026-05-11

## Ziel

Das bestehende DeathCounter-V2-Overlay wurde optisch an den Alert-Aussenrahmen angepasst und die Sichtbarkeitsanimation wurde auf Slide von oben umgestellt.

## Geaendert

```text
htdocs/overlays/_overlay-deathcounter-v2.html
```

## Inhaltliche Anpassungen

- Aussenrahmen der DeathCounter-Bar nutzt jetzt einen Alert-aehnlichen CGN-Verlauf:
  - Cyan oben
  - Lila/Purple Verlauf
  - dunkler Glass-/Neon-Hintergrund
- Kein zusaetzlicher Innenrahmen fuer die Haupt-Bar.
- Count-Boxen wurden optisch an den neuen Look angepasst, ohne die Count-Funktion zu veraendern.
- Bar blendet nicht mehr nur aus, sondern slidert von oben hinein und nach oben wieder heraus.
- Runner-/Lichtschimmer auf der Bar wurde ergaenzt.

## Bewusst nicht geaendert

```text
Backend/API
DB-Storage
Streamer.bot Commands
WebSocket-Handling
Polling-Fallback
Spieler-Mapping
Zusatzspieler-Logik
Marquee-System fuer lange Namen
Count-/Name-Animationen
Sensenmann-Trennzeichen
```

## Funktionalitaet erhalten

Die JavaScript-Logik des Overlays wurde nicht veraendert. Der Script-Block ist gegenueber der gelieferten Ausgangsdatei unveraendert geblieben.

Erhalten bleiben:

```text
/api/deathcounter/v2/state
/api/deathcounter/v2/overlay
WebSocket deathcounter_v2_* Events
5s Polling-Fallback
lastRenderSignature gegen unnoetige Re-Renders
Ping-Pong-Marquee fuer lange Namen
Spielerlayout: zweiter Extra links, Forrest/Engel Mitte, erster Extra rechts
```

## Test

Lokal geprueft:

```text
node --check auf extrahiertem Overlay-Script: OK
```

Nach Live-Deploy testen:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

OBS-Test:

```text
- Overlay anzeigen
- Overlay ausblenden
- !rip / !del ausloesen
- langer Name / Zusatzspieler pruefen
```

## Ergebnis

Nur die Optik und Sichtbarkeitsanimation wurden angepasst. Keine DeathCounter-Funktion wurde entfernt.
