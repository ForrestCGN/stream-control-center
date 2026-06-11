# Modul: commands

Stand: 2026-06-11  
Aktueller bestätigter Zielstand: STEP214 / LWG-5.6

## Zweck

`commands` ist das zentrale Chat-Command-System. Es verarbeitet Twitch-Chat-Events über den Communication Bus, prüft Command-Definitionen, Berechtigungen und Cooldowns und ruft anschließend die Zielmodule per HTTP auf.

## STEP214 / LWG-5.6

Neu vorbereitet:

```text
Command-Result-Chat-Send-Bridge
```

Ablauf:

```text
Command erkannt
→ Zielmodul ausführen
→ result.data.message lesen
→ falls Command-Konfiguration sendResultToChat=true
→ vorhandenes twitch_presence.sendChatMessage(...) nutzen
→ Ergebnis im command_execution_log dokumentieren
```

## Wichtig

Es wird kein neuer Twitch-Sender gebaut. Die Ausgabe läuft über:

```text
backend/modules/twitch_presence.js
```

## Schutz gegen doppelte Ausgaben

Die zentrale Ausgabe wird nur aktiv, wenn ein Command bzw. das Modul-Result dies ausdrücklich erlaubt:

```text
config.sendResultToChat=true
oder result.data.send=true / result.data.streamerbot_send=1
```

Damit senden bestehende Module nicht plötzlich doppelt.

## Aktueller Einsatz

Aktiviert für:

```text
!punkte / !points
```

Nicht aktiviert für:

```text
!givepoints
!setpoint
!gamble
!duell
!raffle
!roulette
```
