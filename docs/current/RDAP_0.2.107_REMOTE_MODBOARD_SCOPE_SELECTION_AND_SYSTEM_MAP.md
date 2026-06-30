# RDAP 0.2.107 - Remote Modboard Scope Selection and System Map

## Ziel

0.2.107 ist ein Doku-only Scope-Schnitt.

Der Media-Picker-Block bleibt abgeschlossen. Der naechste Projektbereich soll bewusst gewaehlt werden, bevor wieder Runtime-Code geaendert wird.

## Ausgangslage

Aktueller bestaetigter Stand:

```text
0.2.106 - Media Picker Module Docs Closeout
```

Der Media-Picker ist dokumentiert als:

```text
read-only
mod-tauglich
online/lokal angeglichen
dokumentiert
ohne Writes
ohne Gates
ohne Agent-Actions
```

Modul-Doku:

```text
docs/modules/media-picker.md
```

## Systemkarte

### 1. Media-Picker / Media-System

Status:

```text
abgeschlossen
read-only
online/lokal bestaetigt
keine Runtime-Aenderung offen
```

Relevante Doku:

```text
docs/modules/media-picker.md
```

Wichtig:
- Nicht weiter nebenbei aufblasen.
- Nur wieder anfassen, wenn Forrest im Alltag konkreten UI-Polish oder Fehler meldet.
- Keine Upload/Edit/Delete-Aktion ohne separaten Scope.

### 2. Lokales Dashboard-v2

Status:

```text
lokaler Media-Picker angeglichen
read-only
Browser-Test bestaetigt
```

Bestaetigung:

```text
Media-System funktioniert wie im ModBoard.
```

Lokale Runtime-Dateien aus 0.2.104:

```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

### 3. Remote-Modboard online

Status:

```text
Media-Picker online live ok
Remote-Modboard bleibt UI-Wahrheit
```

Wichtig:
- Online-Code nicht fuer lokale Sonderlogik verbiegen.
- Online/lokal ueber Runtime-Profil trennen.
- Keine Online->Agent Dateiaktion.

### 4. Agent / Sync / Permission

Status:

```text
nur eigener Scope
nicht nebenbei
```

Vor jeder Aenderung:
- relevante Dateien lesen,
- Permission-/Confirm-/Audit-/Lock-/Readback-Grenzen planen,
- keine Datei- oder Prozessaktion ohne separaten Plan.

### 5. DB / Writes / Gates

Status:

```text
tabu ohne eigenen Write-Scope
```

Fuer Writes gilt zwingend:
- Permission,
- Confirm,
- Audit,
- Lock,
- Readback,
- Rollback-/Fehlerstrategie,
- explizites `go`.

Keine DB-Zeilen veraendern, keine Migration, kein Gate aktivieren, kein Tombstone-Execute ohne eigenen Scope.

### 6. UI / Mod-Hauptansicht

Leitlinie:

```text
Mod-UI statt Entwickler-UI
CGN-Design
keine technischen Labels
keine weissen Browser-Standard-Dropdowns
keine Warnboxen ohne echten Fehler
```

Sichtbare Begriffe muessen alltagstauglich bleiben.

## Sinnvolle naechste Richtungen

```text
A. Admin-/User-/Permission-Bereich wieder aufnehmen.
B. Lokales Dashboard-v2 allgemein gegen Remote-Modboard angleichen.
C. Agent-/Sync-Scope separat planen.
D. Weitere Modul-Dokus fuer bestaetigte Bereiche erstellen.
E. Geparkte Env-Diagnose `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` separat planen.
```

## Empfehlung

Naechster Runtime-Block sollte nicht mehr Media-Picker sein.

Empfohlener naechster Entscheid:

```text
RDAP_0.2.108_NEXT_RUNTIME_SCOPE_PLAN
```

Dort soll Forrest den Bereich auswaehlen oder der aktuelle Projektstatus wird nach offenen Admin-/User-/Permission-Themen durchsucht.

## Ergebnis

0.2.107 erzeugt keine Runtime-Aenderung.

Es dokumentiert:
- Media-Picker abgeschlossen,
- Systemgrenzen klar,
- naechste Runtime-Arbeit nur nach bewusster Scope-Auswahl.
