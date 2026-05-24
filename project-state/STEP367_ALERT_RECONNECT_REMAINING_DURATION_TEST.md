# STEP367_ALERT_RECONNECT_REMAINING_DURATION_TEST

## Zweck
Diagnosepaket für den STEP365-Fix.

Es prüft, ob ein Alert-Reconnect nach OBS-Browserquellen-Reload nur noch die verbleibende Restdauer sendet.

## Erwartetes Ergebnis
Nach STEP365 muss im Log bei Reconnect stehen:

- `recoveryMode=reconnect_resend_remaining_duration`
- `sent=True`
- `remainingMs` kleiner als `totalMs`
- bei erneutem Reload wird `remainingMs` weiter kleiner

## Nicht geändert
Keine Codeänderung. Nur Diagnose.
