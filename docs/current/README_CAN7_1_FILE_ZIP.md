# CAN-7.1 Datei-ZIP

Dieses ZIP enthaelt eine echte Backend-Ersatzdatei plus Dokumentation und Projekt-State-Dateien.

## Entpacken nach

~~~text
D:\Git\stream-control-center
~~~

## Danach pruefen

~~~cmd
node -c backend\modulesus_diagnostics.js
.\stepdone.cmd "CAN-7.1 Recovery-Readiness Statusfelder umgesetzt"
~~~

## Backend

Wenn Node nicht automatisch neu startet, Backend danach neu starten.

## Wichtig

CAN-7.1 ist read-only/additiv:

~~~text
Keine neue Route
Keine POST-/Command-Route
Keine Recovery-Ausfuehrung
Keine Dashboard-Buttons
Keine produktive Flow-Aenderung
~~~
