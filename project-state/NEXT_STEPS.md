# NEXT_STEPS

## Direkt nächster Schritt

```text
CAN-42.4d anwenden und Sichttest machen.
```

## Prüfung

```text
Dashboard > Admin > Diagnose
```

Erwartung:

```text
Todo -> OK, wenn Status/Schema/Channels/DB ok sind
VIP-System -> Unbekannt / Statusroute fehlt
Fehlerzähler bleibt 0, sofern keine echte Route defekt ist
```

## Danach

```text
CAN-42.5 - Todo-Diagnose-Tab aus Todo-Modul entfernen/deaktivieren
```

Voraussetzung:

```text
Admin > Diagnose > Todo bildet die bisherigen Todo-Diagnosewerte ausreichend ab.
```

## Später

```text
VIP-System Statusroute ergänzen:
GET /api/vip/status
```
