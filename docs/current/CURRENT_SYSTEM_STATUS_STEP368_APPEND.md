# CURRENT_SYSTEM_STATUS – STEP368 Append

## Alert / SoundBus

STEP365 wurde erfolgreich getestet und durch STEP367 bestätigt.

Der Alert-Reconnect sendet bei OBS-Browserquellen-Reload während eines laufenden Alerts nur noch die Restlaufzeit an das Overlay. Die Anzeige wird dadurch nicht mehr künstlich verlängert.

Bestätigt:

- Alert läuft während OBS-Reload weiter
- Overlay erhält Reconnect-Recovery
- `recoveryMode = reconnect_resend_remaining_duration`
- `remainingMs < totalMs`
- bei weiterem Reload wird `remainingMs` kleiner
- Sound/TTS startet nicht erneut
- Queue bleibt stabil
- Alert-Lifecycle wird nach Ende sauber geleert

## Weiterhin offen

Separater Sound-System-Befund:
Ein verwaister `activeBundleLock` kann die Queue blockieren, wenn `current` und `currentBundle` bereits leer sind. Dies wurde als Known-Issue festgehalten und ist nicht Teil des Alert-Reconnect-Fixes.

## Nächster geplanter Schritt

STEP369_ALERT_OUTPUT_BUS_CONTRACT_AUDIT

Vor einem späteren Wechsel von Alert-Output `legacy` zu einem stabileren Bus-/Overlay-Vertrag soll der tatsächliche Event-/Payload-/Ack-Vertrag geprüft und dokumentiert werden.
