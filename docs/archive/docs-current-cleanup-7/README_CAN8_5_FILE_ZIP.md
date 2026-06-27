# CAN-8.5 Datei-ZIP

Diese ZIP nach `D:\Git\stream-control-center` entpacken.

Danach ausführen:

~~~cmd
node -c htdocs\dashboard\modules\bus_diagnostics.js
.\stepdone.cmd "CAN-8.5 Recovery-Preflight Dashboard read-only angezeigt"
~~~

Danach im Dashboard prüfen:

~~~text
Event-Bus / Communication Bus -> Recovery -> Preflight
~~~

Es dürfen keine Recovery- oder Simulation-Buttons sichtbar sein.
