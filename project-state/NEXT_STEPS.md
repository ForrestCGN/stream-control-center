# NEXT_STEPS

## Nach STEP CAN-8.7

Marker: STEP_CAN8_7_NEXT_STEPS

Naechster sinnvoller Schritt:

~~~text
CAN-8.8: Recovery-Preflight Check-Matrix read-only Statusfelder planen
~~~

Ziel von CAN-8.8:

~~~text
Noch kein Code.
Noch keine Preflight-Route.
Nur konkrete Minimal-Checks und Summary-Felder fuer einen spaeteren Backend-Code-Step festlegen.
~~~

Zu klaeren:

~~~text
Welche Checks kommen minimal in recoveryPreflight.checks[]?
Welche Checks sind blocking=true?
Welche Checks sind nur info/warning?
Welche Summary-Felder werden benoetigt?
Wie bleibt die Ausgabe read-only?
~~~

Regel bleibt:

~~~text
Keine Prepare-/Execute-Logik und keine Recovery-Ausfuehrung ohne separate Planung, Owner/Admin, Audit, Bestaetigung, Duplikat-Sperre, Safety-Stop und Rollback-Regel.
~~~
