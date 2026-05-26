# STEP278S - Controlled Alert Mirror Test

## Ziel

Ein alert-ähnliches Testevent soll kontrolliert über den Communication Bus an das Master-Test-Overlay gesendet werden.

Dieser Schritt ist keine Produktivmigration des Alert-Systems.

## Versionen

```text
communication_bus v0.7.0
communication_debug_view v0.1.2
```

## Neue Route

```text
GET /api/communication/test-alert
```

Beispiel:

```text
http://127.0.0.1:8080/api/communication/test-alert?user=ForrestCGN&type=bits&amount=100&message=Alert%20Mirror%20Test
```

## Bus-Event

```text
channel: visual.alert
action: play
```

## Payload

Die Payload enthält ein alert-ähnliches Objekt mit Test-/Mirror-Markierung.

## Debug View

Die Communication Debug View wurde auf `v0.1.2` erhöht und enthält einen Button `Alert Mirror Test`.

## Anzeige-Standard

Neue/überarbeitete Modul-/Tool-Ausgaben zeigen nur Versionsnummern. STEP-Angaben bleiben Doku-/Projektstand-Historie.

## Nicht geändert

- keine Änderung an `/api/alerts/*`
- keine Alert-DB-/Queue-Änderung
- keine Sound-System-Änderung
- keine TTS-Änderung
- keine VIP-Änderung
- kein Ersatz von `broadcastWS`
- keine Dashboard-Auth-/Rollenänderung
- keine OBS-Änderung
- keine Änderung am Master-Test-Overlay
