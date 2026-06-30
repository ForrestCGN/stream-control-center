# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.108_NEXT_RUNTIME_SCOPE_PLAN`

## Ausgangslage

`0.2.107 - Remote Modboard Scope Selection and System Map` ist Doku-only.

Bestaetigt:
- Media-Picker-Block ist abgeschlossen.
- Media-Picker ist read-only, mod-tauglich, online/lokal angeglichen und dokumentiert.
- Systemkarte wurde erstellt:
  `docs/current/RDAP_0.2.107_REMOTE_MODBOARD_SCOPE_SELECTION_AND_SYSTEM_MAP.md`
- Keine Runtime-Code-Dateien geaendert.
- Kein Backend geaendert.
- Kein Webserver-Deploy noetig.

## Naechstes Ziel

Naechsten Runtime-Bereich bewusst auswaehlen.

Moegliche Richtungen:

```text
A. Admin-/User-/Permission-Bereich wieder aufnehmen.
B. Lokales Dashboard-v2 allgemein gegen Remote-Modboard angleichen.
C. Agent-/Sync-Scope separat planen.
D. Weitere Modul-Dokus fuer bestaetigte Bereiche erstellen.
E. Geparkte Env-Diagnose `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` separat planen.
```

## Vor 0.2.108 lesen

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP_0.2.107_REMOTE_MODBOARD_SCOPE_SELECTION_AND_SYSTEM_MAP.md
docs/modules/media-picker.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_0_2_107.md
```

## Harte Regeln

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
keine zweite lokale UI
keine technischen Labels in der Mod-Hauptansicht
```
