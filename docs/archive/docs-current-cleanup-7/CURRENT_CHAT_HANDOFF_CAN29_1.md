# Current Chat Handoff - CAN29.1

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

CAN-29.1 vorbereitet: Discord.js `ready` DeprecationWarning wird durch `clientReady` behoben.

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
CAN-26.5 Deploy-Script um docs/project-state erweitert.
CAN-27.1 Getrackten htdocs/htdocs Doppelordner entfernt.
CAN-27.2 Repo/Live-Doku-Sync erfolgreich geprüft.
CAN-28.1 Modul-Loader Log Summary umgesetzt und live geprüft.
CAN-28.2 Testergebnis dokumentiert.
CAN-29.0 Discord ready/clientReady DeprecationWarning geprüft.
```

## CAN-29.1 Inhalt

Betroffene Datei:

```text
backend/modules/discord.js
```

Änderungen:

```text
MODULE_VERSION 0.1.0 -> 0.1.1
client.once('ready', ...) -> client.once('clientReady', ...)
```

## Ziel

Die bisherige Node-Warnung soll verschwinden:

```text
DeprecationWarning: The ready event has been renamed to clientReady to distinguish it from the gateway READY event and will only emit under that name in v15. Please use clientReady instead.
```

Der normale Log soll weiterhin erscheinen:

```text
[discord] ready as ...
```

## Nicht geändert

```text
Keine Login-Logik.
Kein Token-/Config-Verhalten.
Keine Voice-/Sound-Funktionen.
Keine Discord-Routen.
Keine Bridge-Funktionen.
Keine Queue-Funktionen.
Keine DB.
Keine OBS-Aktion.
Keine Dashboard-Dateien.
Keine produktiven Flows.
Keine Funktionalität entfernt.
```

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\discord.js
.\stepdone.cmd "CAN-29.1 Discord clientReady Deprecation Fix"
```

Danach Node neu starten und prüfen:

```text
[discord] ready as ...
```

Die DeprecationWarning zum alten `ready`-Event soll nicht mehr erscheinen.

## Empfohlener naechster Schritt

```text
CAN-29.1 Live-Test auswerten.
Danach CAN-29.2 Testergebnis dokumentieren.
```
