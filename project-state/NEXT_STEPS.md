# NEXT STEPS

Stand: DASHUI6C / Übergabe für neuen Chat vorbereitet  
Datum: 2026-06-23

## Nächster sinnvoller Schritt

```text
DASHUI7 / Erste read-only Statusseite mit echter API-Anbindung planen
```

Empfohlener Kandidat:

```text
Remote Agent Status
```

## DASHUI7 zuerst nur planen

Prüfen/planen:

- Welche bestehenden API-Endpunkte gibt es?
- Ob ein neuer read-only Endpoint nötig ist.
- Welche Daten `Remote Agent Status` anzeigen soll.
- Was echte Backend-Daten sind.
- Was vorerst Placeholder bleibt.
- Loading/Error/Offline/Online-Zustände.
- Welche Frontend-Dateien betroffen wären.
- Welche Backend-Dateien betroffen wären.
- Welche Tests nötig sind.
- Ob Node-Neustart nötig wäre.

## Nicht in DASHUI7

- keine Agent-Aktion ausführen
- kein produktives `agent.ping`
- kein Start/Stop
- keine Schreibfunktion
- keine DB-Änderung
- keine OBS-/Sound-/Media-/Overlay-Steuerung
- keine Commands/Kanalpunkte
- kein Login-System improvisieren
- keine produktiven Locks schreiben

## Wichtig

Vor Umsetzung:

```text
erst prüfen/planen, dann auf Forrests go warten
```
