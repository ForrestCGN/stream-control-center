# Current Chat Handoff - CAN36.3b

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

CAN-36.3b vorbereitet: zusätzlicher `Read-only`-Tab im Message-Rotator wird entfernt.

## Grund

Der Message-Rotator besitzt bereits einen sichtbaren Tab:

```text
Diagnose
```

Der zusätzliche Tab:

```text
Read-only
```

war inkonsequent und doppelt.

## Änderung

```text
htdocs/dashboard/index.html lädt message_rotator_readonly_diagnostics.css nicht mehr.
htdocs/dashboard/index.html lädt message_rotator_readonly_diagnostics.js nicht mehr.
message_rotator_readonly_diagnostics.js ist inert/no-op.
message_rotator_readonly_diagnostics.css ist leer.
```

## Erwarteter Tab-Aufbau

```text
Übersicht | Settings | Items | Nachrichten | Diagnose
```

## Nicht geändert

```text
backend/modules/message_rotator.js
htdocs/dashboard/modules/message_rotator.js
```

## Nicht ausgelöst

```text
Keine Message.
Kein Start/Stop.
Kein Tick.
Kein Next/Manual.
Keine Preview.
Kein Reload.
Keine Live-Status-Force-Abfrage.
Keine Settings gespeichert.
Keine Texte/Varianten gespeichert oder gelöscht.
Keine DB-Migration.
Keine Twitch-/Chat-Nachricht.
Keine OBS-/Sound-/Queue-Aktion.
Keine Funktionalität entfernt.
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-36.3b Entferne Message Rotator Readonly Tab"
```

Danach prüfen:

```text
Dashboard > Message-Rotator
Tabs: Übersicht | Settings | Items | Nachrichten | Diagnose
Kein Tab Read-only
```

## Nächster Schritt

```text
CAN-36.4 Testergebnis dokumentieren.
```
