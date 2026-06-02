# Current Chat Handoff - CAN30.1

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-30.1 abgeschlossen: SQLite ExperimentalWarning wurde analysiert, dokumentiert und aktuell bewusst akzeptiert.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene Schritte

```text
CAN-26.5 Deploy-Script um docs/project-state erweitert.
CAN-27.1 Getrackten htdocs/htdocs Doppelordner entfernt.
CAN-27.2 Repo/Live-Doku-Sync erfolgreich geprüft.
CAN-28.1 Modul-Loader Log Summary umgesetzt und live geprüft.
CAN-28.2 Testergebnis dokumentiert.
CAN-29.1 Discord clientReady Deprecation Fix umgesetzt und live geprüft.
CAN-29.2 Testergebnis dokumentiert.
CAN-30.0 SQLite ExperimentalWarning analysiert.
CAN-30.1 SQLite ExperimentalWarning dokumentiert.
```

## CAN-30 Analyse

Die Warning kommt aus:

```text
backend/modules/sqlite_core.js
```

Ursache:

```text
const { DatabaseSync } = require("node:sqlite");
db = new DatabaseSync(dbPath);
```

Live-DB:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Entscheidung

```text
Keine Codeänderung.
Keine DB-Änderung.
Keine Warning-Unterdrückung.
Kein DB-Treiberwechsel.
Kein DB-Core-Umbau ohne eigenen Plan mit Backup/Rollback.
```

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN30_1.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-30.1 abgeschlossen. Nächster Schritt: CAN-31.0 neuen Arbeitsblock bewusst auswählen.
```

## Mögliche nächste Kandidaten

```text
1. WS connect/disconnect Log optional drosseln oder zusammenfassen.
2. Dashboard-Kosmetik Overlay-Monitor / Bus-Diagnose weiter glätten.
3. EventBus read-only Diagnose weiter ausbauen.
4. Ein konkretes Modul als nächstes an Bus-/Status-/Doku-Regeln anpassen.
5. Langfristigen DB-Core-Treiberwechsel separat planen, aber nicht direkt umsetzen.
```
