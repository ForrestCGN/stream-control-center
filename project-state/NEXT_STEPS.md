# NEXT_STEPS

## Kurzfristig

- STEP279 einspielen und committen.
- Im Live-Betrieb beobachten, ob der ursprüngliche Alert-Fehler erneut auftritt.
- Bei erneutem Fehler zuerst Communication Debug View prüfen:
  - Bus Mirror / Timing
  - Echtes Alert-Overlay ACK
  - Overlay Watchdog Issues
  - Recovery-Status

## Bei erneutem Fehler

1. Screenshot oder JSON aus der Communication Debug View sichern.
2. Prüfen, ob `overlayClients` 0 war.
3. Prüfen, ob `missingFinishAck` gesetzt wurde.
4. Prüfen, ob `overlaySentAt` und `busMirrorSentAt` vorhanden waren.
5. Optional manuell `Overlay Recovery Clear` auslösen.

## Später möglich, aber noch nicht empfohlen

- Automatische Recovery-Policy nur nach real bestätigtem Fehlerfall.
- OBS-Browser-Reload nur als explizite, sichere Admin-Aktion.
- Alert-Overlay selbst zusätzlich mit sichtbarem internen Health-/Render-ACK erweitern.
