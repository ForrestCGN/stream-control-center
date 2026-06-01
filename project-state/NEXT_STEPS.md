## Nach STEP CAN-8.9

Marker: STEP_CAN8_9_NEXT_STEPS

Nächster sinnvoller Schritt:

```text
CAN-8.10: Recovery-Preflight Check-Matrix Live-Test und Abnahme dokumentieren
```

Zu prüfen:

```text
recoveryPreflight.checks[] wird geliefert
recoveryPreflight.checkSummary wird geliefert
recoveryPreflight.scope[] wird geliefert
canPrepare bleibt false
canExecute bleibt false
Safety-Felder bleiben ohne produktive Berührung
```

## Nach STEP CAN-8.8

Marker: STEP_CAN8_8_NEXT_STEPS

Naechster sinnvoller Schritt:

~~~text
CAN-8.9: Recovery-Preflight Check-Matrix read-only Statusfelder im Backend umsetzen
~~~

Erlaubter Scope:

~~~text
Nur backend/modules/bus_diagnostics.js
Nur additive read-only recoveryPreflight-Felder
Keine neue API-Route
Keine POST-/Command-Route
Keine Recovery-Ausfuehrung
Keine Dashboard-Code-Aenderung
Keine Config-/DB-Aenderung
Keine produktive Flow-Aenderung
~~~

Vor CAN-8.9:

~~~text
Vollstaendige echte backend/modules/bus_diagnostics.js verwenden.
Version gezielt erhoehen.
Build-Marker gezielt aktualisieren.
node -c backend\modules\bus_diagnostics.js ausfuehren.
~~~

Nach CAN-8.9 testen:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryPreflight.checkSummary | Select-Object total,ok,warning,blocked,error,hasBlockingChecks
$s.recoveryPreflight.checks | Select-Object key,category,ok,severity,blocking,reason | Format-Table -AutoSize
$s.summary | Select-Object recoveryPreflightCheckCount,recoveryPreflightCheckOkCount,recoveryPreflightCheckWarningCount,recoveryPreflightCheckBlockedCount,recoveryPreflightCheckErrorCount,recoveryPreflightHasBlockingChecks
~~~
