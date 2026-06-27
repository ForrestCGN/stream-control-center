# Todo Integration Raw + Counts Fix

## Stand

```text
CAN-42.5c
```

## Ziel

`Admin > Diagnose > Todo` soll die Todo-Zählwerte korrekt aus `GET /api/todo/integration-check` anzeigen und die Rohdaten sollen Status und Integration-Check gemeinsam zeigen.

## Problem

Die Rohdaten zeigten bisher hauptsächlich den Status-Block:

```text
GET /api/todo/status
```

Die Zählwerte liegen aber im Integration-Check:

```text
GET /api/todo/integration-check
```

Außerdem war das Count-Mapping zu früh mit `-` fertig, wenn ein erster Alias leer war.

## Änderung

```text
checkCount() überspringt leere/undefinierte Alias-Werte.
Todo-Rohdaten zeigen jetzt:
- status
- integrationCheck
```

## Erwartete Todo-Werte

```text
User-Stats
Daily-Stats
Settings
Textvarianten
Legacy-Texte
DB
```

## Keine produktiven Aktionen

```text
keine Backend-Änderung
keine API-POSTs
keine DB-Migration
keine Funktionalität entfernt
```
