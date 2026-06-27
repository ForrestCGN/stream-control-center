# Todo Integration Mapping

## Stand

```text
CAN-42.4d
```

## Ziel

`Admin > Diagnose > Todo` soll Todo nur dann als Warnung anzeigen, wenn wirklich ein relevanter Integrationspunkt auffällig ist.

## Änderung

Die zentrale Diagnose bewertet Todo robuster:

```text
explizit integration.ok === false -> Warnung/Fehler
explizit integration.healthy === false -> Warnung/Fehler
DB-Check ok === false -> Warnung
fehlende Channels -> Warnung
Schema bereit + alle Channels konfiguriert -> OK
Schema bereit + Checks vorhanden + keine fehlenden Channels -> OK
```

## Grund

Der alte Todo-Diagnose-Tab zeigte Integration OK, während die zentrale Ampel Todo noch als Warnung bewertet hat. Die neue Logik nutzt daher nicht nur `integration.ok/healthy`, sondern auch Schema-, Channel- und DB-Signale.

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
