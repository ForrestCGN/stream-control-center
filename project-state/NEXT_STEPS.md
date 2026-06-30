# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.107_NEXT_SYSTEM_SCOPE_SELECTION`

## Ausgangslage

`0.2.106 - Media Picker Module Docs Closeout` ist ein Doku-only Abschluss.

Bestaetigt:
- Media-Picker online ist live ok.
- Media-Picker lokal funktioniert wie im ModBoard.
- Online und lokal sind read-only.
- Modul-Doku wurde erstellt:
  `docs/modules/media-picker.md`
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.

## Media-Picker ist damit abgeschlossen als

```text
read-only
mod-tauglich
online/lokal angeglichen
dokumentiert
ohne Writes
ohne Gates
ohne Agent-Actions
```

## Naechstes Ziel

Naechsten Projektbereich bewusst auswaehlen.

Moegliche Richtungen:

```text
1. Media-System geparkt lassen und anderen RDAP-/Remote-Modboard-Bereich beginnen.
2. Kleinen Media-Picker UI-Alltags-Polish planen, falls Forrest im Betrieb etwas auffaellt.
3. Separaten Sync-/Agent-/Permission-Scope vorbereiten.
4. Geparkte Env-Diagnose `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` separat planen.
5. Modul-Doku fuer weitere bestehende Bereiche nachziehen.
```

## Harte Regeln fuer naechsten Runtime-Scope

```text
GitHub/dev zuerst lesen
relevante Dokus lesen
echte Dateien lesen
Plan nennen
auf go warten
vollstaendige Ersatzdateien liefern
keine Patch-Scripte
keine Funktionalitaet entfernen
keine Writes ohne Permission/Confirm/Audit/Lock/Readback
keine Gates ohne separaten Plan
keine Agent-Actions ohne separaten Plan
```
