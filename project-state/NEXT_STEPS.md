## Nach STEP CAN-9.0

Marker: STEP_CAN9_0_NEXT_STEPS

Naechster sinnvoller Arbeitsblock:

~~~text
CAN-9.1: Recovery-Preflight Route Datenmodell und Sicherheitsvertrag planen.
~~~

Ziel von CAN-9.1:

~~~text
Noch kein produktiver Code.
Noch keine POST-/Command-Route.
Noch keine Recovery-Ausfuehrung.
Nur Datenmodell, Route-Grenze, Safety-Felder und Tests fuer eine spaetere read-only GET-Route definieren.
~~~

Vor jedem Code-Step pruefen:

~~~text
backend/modules/bus_diagnostics.js
~~~

Regeln bleiben:

~~~text
Keine Auto-Recovery
Kein Alert-Replay
Kein Sound-Replay
Kein Overlay-Retry
Keine Dashboard-Buttons fuer Recovery
Keine produktive Flow-Aenderung
~~~
