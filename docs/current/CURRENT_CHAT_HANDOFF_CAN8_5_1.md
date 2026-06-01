# CURRENT CHAT HANDOFF – CAN-8.5.1

Stand: 2026-06-01

## Kurzstatus

CAN-8.5 hatte die Preflight-Read-only-Anzeige im Recovery-Tab ergänzt. Der sichtbare `Preflight`-Untertab reagierte nicht auf Klick, weil `preflight` in der erlaubten Subtab-Liste fehlte.

## Fix

`htdocs/dashboard/modules/bus_diagnostics.js` wurde minimal korrigiert:

~~~text
setRecoverySubTab erlaubt jetzt auch: preflight
~~~

## Nicht geändert

Keine Backend-Änderung, keine API-Änderung, keine Recovery-Ausführung, keine Buttons.

## Nächster Schritt

CAN-8.6: Live-Test/Abnahme der Preflight-Dashboard-Anzeige dokumentieren.
