# STEP618B – Event-Bus Overlay-Client-Erkennung korrigiert

Stand: 2026-05-30

## Ziel

Der Clients-Tab der Bus-Diagnose soll nur echte Overlay-/Browser-Clients als Overlay anzeigen.

## Problem aus STEP618

`module:overlay_monitor` wurde fälschlich als Overlay gezählt, weil die Klassifizierung auch den Modulnamen auf `overlay` geprüft hat.

Das ist falsch, weil `overlay_monitor` ein Backend-Modul ist.

## Korrektur

Die Overlay-Erkennung ist jetzt enger:

```text
Overlay-Client, wenn:
- type == overlay
- id beginnt mit overlay:
- mode == overlay
```

Nicht mehr ausreichend:

```text
- module enthält overlay
- name enthält overlay
- capability enthält overlay
```

## Betroffene Datei

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

## Bewusst nicht geändert

```text
- kein Backend
- keine neue Moduldatei
- keine Runtime-Config
- kein OBS-Refresh
- keine echten Overlays
- keine DB-Änderung
```

## Test

```powershell
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "Event-Bus Overlay-Client-Erkennung korrigieren"
```

Danach Dashboard hart neu laden:

```text
Admin -> Bus-Diagnose -> Clients
```

Erwartung:

```text
module:overlay_monitor erscheint unter Backend-Module, nicht unter Overlay-Clients.
```
