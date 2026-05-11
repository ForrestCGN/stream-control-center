# NEXT STEP - Nach STEP249 DeathCounter Command rawInput Parser-Fix

## Direkt testen

Streamer.bot-FetchURLs auf `rawInput=%rawInput%` stellen und im Chat testen:

```text
!dcount
!dcount show
!dcount hide
!rip @ForrestCGN
!rip @ForrestCGN del
!tode
!tode @ForrestCGN
```

Erwartung:

```text
- !dcount toggelt das Overlay
- !rip zählt korrekt hoch
- !rip del zählt korrekt zurück
- !tode antwortet über Backend/Bot
- Streamer.bot sendet keine zusätzliche Chatnachricht
```

## Danach sinnvoll

```text
STEP250: DeathCounter Streamer.bot Minimal-Actions live finalisieren und alte Actions deaktiviert dokumentieren
```

Noch nicht direkt blind bauen:

```text
- bestehende JSON-State-Datei ersetzen
- app.sqlite neu bauen oder überschreiben
- alte Count-Logik entfernen
```
