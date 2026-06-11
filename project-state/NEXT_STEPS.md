# NEXT_STEPS

Stand: 2026-06-11

## Direkt als nächstes

1. StreamElements `!points` / `!punkte` deaktivieren oder umbenennen.
2. Im echten Twitch-Chat final prüfen:

```text
!punkte
!points
```

## Nächster Entwicklungs-STEP Vorschlag

### STEP216 / LWG-5.8 – Admin-Points kontrolliert testen

Ziel:

```text
!givepoints @user amount
!punkte give @user amount
!setpoint @user amount
!punkte set @user amount
```

Regeln:

```text
- givepoints nur Mod/Streamer
- setpoint nur Streamer/Owner
- Transaktionshistorie erhalten
- Test mit Dummy/User und Rückbuchung
- keine breite Freigabe ohne Test
```

## Danach möglich

### STEP217 / LWG-5.9 – Gamble kontrollierter Test

```text
!gamble 100
!gamble 50%
```

Regeln:

```text
- crypto.randomInt
- nicht vorhersagbar
- Einsatz maximal verfügbare Punkte
- Config/Cooldowns/Textvarianten prüfen
- erst API-Test, dann Live-Freigabe
```
