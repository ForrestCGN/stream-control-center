# Modul: loyalty

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP215 / LWG-5.7

## Zweck

`loyalty` verwaltet die Kekskrümel-Punkte, verfügbare Punkte, Reservierungen, Ranking und Runtime-Command-Antworten.

## Bestätigte Runtime-Version

```text
loyalty version = 0.1.13
mode            = shadow
enabled         = true
currency        = Kekskrümel
```

## Bestätigter Command

```text
!punkte
!points
```

Der Command zeigt verfügbare Punkte und Rang:

```text
available = balance - reserved
rank      = Platz X von Y
```

Beispiel aus dem bestätigten Test:

```text
ForrestCGN, laut Rentnerkasse hast du 3412 verfügbare Kekskrümel...
```

## Bestätigte Ausgabe-Kette

```text
loyalty runtime erzeugt result.message
commands.js liest result.data.message
commands.js sendet über twitch_presence
Twitch-Chat zeigt Antwort
```

## Aktive / freigegebene Commands

```text
!punkte
!points
```

## Weiterhin gesperrt

```text
!givepoints
!setpoint
!gamble
!duell
!raffle
!roulette
```

## Hinweise

StreamElements `!points` / `!punkte` muss deaktiviert oder umbenannt bleiben, um doppelte oder falsche Antworten zu vermeiden.
