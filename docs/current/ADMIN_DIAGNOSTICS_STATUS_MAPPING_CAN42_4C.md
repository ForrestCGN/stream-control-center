# Admin-Diagnose Statusmapping Fix

## Stand

```text
CAN-42.4c
```

## Ziel

Fehlende Statusrouten sollen nicht als echter Modulfehler erscheinen. Sie werden als `Unbekannt / Statusroute fehlt` angezeigt.

## Änderung

```text
VIP-System mit fehlender /api/vip/status Route wird nicht mehr als Fehler gezählt.
Todo-Integration wird robuster bewertet.
HTML/404-Fehlertexte werden sauber gekürzt/normalisiert.
```

## Bewertungslogik

```text
Status erreichbar + keine Auffälligkeit = OK
Status erreichbar + auffälliger Check = Warnung
Status nicht erreichbar wegen echter Fehler = Fehler
Statusroute fehlt/404/Cannot GET = Unbekannt
```

## Todo

Todo gilt als OK, wenn:

```text
Status erreichbar
Schema bereit
Integration-Checks vorhanden
keine fehlenden Channels
DB nicht als Fehler gemeldet
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
