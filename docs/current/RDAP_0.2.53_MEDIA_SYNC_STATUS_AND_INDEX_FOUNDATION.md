# RDAP 0.2.53 - Media Sync Status and Index Foundation

## Ziel

Dieser Step bereitet das Media-Modul auf eine vollstaendige und spaeter bidirektionale Synchronisierung vor.

Online soll die Media-Liste fuer Mods nicht dauerhaft aus einem begrenzten Agent-Memory-Frame kommen, sondern aus einem persistenten Online-Index in MariaDB. Lokal bleibt der Stream-PC die Datei-Wahrheit.

## Problem

Die bisherige Online-Liste kann unvollstaendig sein, weil der Agent-WSS-Compact-Transport aktuell nur eine begrenzte Anzahl Media-Items sendet. Bei Forrests aktuellem Stand wurden 334 gueltige/gesehene Dateien erkannt, online kamen aber nur 120 Items an.

## Zielarchitektur

```text
Stream-PC / lokal:
- scannt die echten Media-Dateien
- ist Datei-Wahrheit
- kann lokal direkt anzeigen

Webserver / online:
- speichert Media-Index persistent in MariaDB
- Remote-Modboard liest Media-Liste fuer Mods aus dem Online-Index

Sync:
- Full-Sync uebertraegt alle validen Dateien in Chunks
- Delta-Sync uebertraegt spaeter Aenderungen
- Online-Aenderungen werden spaeter als Agent-Auftraege modelliert
```

## UI

Das Media-Modul zeigt einen Sync-Statusbereich mit Fortschritt und Detailfenster. Dort wird sichtbar, ob der aktuelle Online-Stand vollstaendig ist oder noch aus dem begrenzten Compact-Transport kommt.

## Sicherheitsgrenzen

```text
Keine DB-Migration in diesem Step.
Keine DB-Item-Writes in diesem Step.
Keine Datei-Inhalte.
Keine absoluten Pfade.
Keine Upload/Edit/Delete-Buttons.
Keine Agent-Actions.
Keine produktiven Media-Writes.
```

## Naechster Schritt

```text
RDAP_0.2.54_MEDIA_INDEX_FULL_SYNC_TO_DB
```

Dort wird der eigentliche Full-Sync in Chunks und der kontrollierte MariaDB-Index technisch umgesetzt.
