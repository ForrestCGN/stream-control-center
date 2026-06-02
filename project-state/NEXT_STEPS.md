# NEXT_STEPS

## Naechster Schritt

```text
Sound-Request/ACK/Fehler/Queue-Status sauber definieren und produktionssicher vorbereiten.
```

## Ziel

Nicht sofort Sound abspielen, sondern zuerst den Bus-Kommunikationsvertrag fuer Sound klaeren:

```text
Request-ID
Command
Source
RequestedBy
Priority
Queue-Status
ACK/Accepted
Started
Queued
Failed
Finished
Timeout
```

## Danach

```text
Alert-System an Sound-Bus-Status koppeln
VIP/Overlay nachziehen
Channelpoints nachziehen
Recovery/Selbstheilung spaeter
```
