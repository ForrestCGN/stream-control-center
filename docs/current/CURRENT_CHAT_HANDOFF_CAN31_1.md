# Current Chat Handoff - CAN31.1

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

CAN-31.1 vorbereitet: WebSocket connect/disconnect Log wird durch eine Summary gedrosselt.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene Schritte davor

```text
CAN-28.1 Modul-Loader Log Summary umgesetzt und live geprüft.
CAN-29.1 Discord clientReady Deprecation Fix umgesetzt und live geprüft.
CAN-30.1 SQLite ExperimentalWarning dokumentiert und akzeptiert.
CAN-31.0 WS connect/disconnect Log geprüft.
```

## CAN-31.1 Inhalt

Betroffene Datei:

```text
backend/server.js
```

Änderung:

```text
Einzelne WS connect/disconnect Logs werden durch eine kurze Summary ersetzt.
```

Erwartete neue Logzeile:

```text
[WS] clients=... connectedDelta=... disconnectedDelta=... connectedTotal=... disconnectedTotal=...
```

## Nicht geändert

```text
Keine WebSocket-Routen.
Kein dispatchWsMessage.
Keine Modul-Handler.
Keine Broadcast-Logik.
Keine Overlay-Logik.
Keine Dashboard-Dateien.
Keine DB.
Keine OBS-Aktion.
Keine produktiven Flows.
Keine Funktionalität entfernt.
```

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\server.js
.\stepdone.cmd "CAN-31.1 WS Connect Log Summary"
```

Danach Node neu starten und prüfen:

```text
[WS] clients=... connectedDelta=... disconnectedDelta=... connectedTotal=... disconnectedTotal=...
```

## Empfohlener nächster Schritt

```text
CAN-31.1 Live-Test auswerten.
Danach CAN-31.2 Testergebnis dokumentieren.
```
