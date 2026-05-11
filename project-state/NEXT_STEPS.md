# NEXT STEP - Nach STEP250 DeathCounter DCOUNT Extra Players

## Direkt testen

Im Twitch-Chat oder per API:

```text
!dcount
!dcount add @urlug
!dcount add @RoxxyFoxxyCGN
!dcount add @DritterUser
!dcount remove @urlug
!dcount clear
!dcount reset
```

Erwartung:

```text
- `!dcount` toggelt Overlay.
- `add` fügt maximal 2 Zusatzspieler hinzu.
- dritter Zusatzspieler wird mit Hinweis blockiert.
- `remove` entfernt nur Zusatzspieler, nicht Standardspieler.
- `clear` entfernt alle Extras.
- `reset` setzt auf Standardspieler zurück.
```

## Nächster sinnvoller Bau-Step

```text
STEP251: DeathCounter Dashboard-Steuerung um Extra-Spieler add/remove/clear erweitern
```

Noch nicht direkt blind bauen:

```text
- JSON-State durch DB ersetzen
- app.sqlite neu bauen oder überschreiben
- alte Count-Logik entfernen
```
