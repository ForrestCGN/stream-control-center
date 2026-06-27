# VIP-System Statusroute ToDo

## Stand

```text
CAN-42.4d
```

## Aktueller Zustand

`Admin > Diagnose` zeigt das VIP-System aktuell als:

```text
Unbekannt / Statusroute fehlt
```

Grund:

```text
GET /api/vip/status existiert aktuell nicht oder ist nicht angebunden.
```

## Späteres Ziel

Eine saubere VIP-Diagnose-Statusroute ergänzen:

```text
GET /api/vip/status
```

## Wunschfelder

```text
ok
module
version
enabled
schemaVersion
activeVipCount
maxVipSlots
expiringSoon
lastError
database/config/text status
```

## Wichtig

Aktuell ist `Unbekannt / Statusroute fehlt` korrekt und kein echter VIP-Fehler. Die Route wird später in einem eigenen VIP-CAN ergänzt.
