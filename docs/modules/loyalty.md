# Modul: loyalty

Stand: 2026-06-11  
Aktueller bestätigter Stand: STEP216 / LWG-5.8

## Zweck

`loyalty` verwaltet Kekskrümel, verfügbare Punkte, Reservierungen, Ranking, Transaktionen und Runtime-Command-Antworten.

## Bestätigte Runtime-Basis

```text
loyalty version = 0.1.13
mode            = shadow
enabled         = true
currency        = Kekskrümel
```

## STEP216-Testinhalt

Kontrolliert geprüft werden:

```text
Viewer darf keine Punkte vergeben.
Mod darf Punkte vergeben.
Mod darf Punkte nicht hart setzen.
Broadcaster darf Punktestand per diff-basierter Transaktion setzen.
Nach Test wird Zielpunktestand wiederhergestellt.
Transaktionshistorie bleibt erhalten.
```

## Sicherheitsregel

`setpoint` darf nicht hart überschreiben, sondern erzeugt eine ausgleichende Transaktion über die Differenz. Das ist wichtig, damit Audit/History nachvollziehbar bleibt.

## Standard-Testziel

```text
step216_testuser
```

Der Testuser wird nach dem Test wieder auf den Ausgangsstand gesetzt.
