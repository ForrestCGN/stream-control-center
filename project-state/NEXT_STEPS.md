# NEXT_STEPS

## Nach STEP CAN-8.6

Marker: STEP_CAN8_6_NEXT_STEPS

Naechster sinnvoller Schritt:

~~~text
CAN-8.7: Recovery-Preflight Check-Matrix planen
~~~

Ziel von CAN-8.7:

~~~text
Noch kein produktiver Code.
Noch keine Preflight-Route.
Noch kein Prepare/Execute.
Nur festlegen, welche read-only Checks spaeter geliefert werden sollen.
~~~

Zu klaeren:

~~~text
Welche Checks pruefen RecoveryReadiness?
Welche Checks pruefen Safety-Flags?
Welche Checks pruefen Dashboard/Auth/Audit-Basis?
Welche Checks pruefen Queue/Sound/Alert/Overlay-Zustand?
Welche Checks blockieren spaetere Prepare-/Execute-Stufen?
Welche Felder braucht das Dashboard?
~~~

Regel bleibt:

~~~text
Keine Recovery-Ausfuehrung ohne separate Planung, Owner/Admin, Audit, Bestaetigung, Duplikat-Sperre, Safety-Stop und Rollback-Regel.
~~~
