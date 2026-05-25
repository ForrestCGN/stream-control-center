# NEXT STEPS – nach STEP407 VIP PRODUCTIVE BUS MIRROR DESIGN

## Nächster empfohlener Schritt

`STEP408 – VIP Productive Bus Mirror Feature Flag`

## Ziel

Die Grundlage für einen späteren optionalen produktiven VIP-/Mod-Bus-Mirror vorbereiten, ohne ihn sofort produktiv zu aktivieren.

## Empfohlene Umsetzung für STEP408

- Settings ergänzen oder vorbereiten:
  - `productiveBusMirrorEnabled: false`
  - `productiveBusMirrorChannel: vip.sound`
  - `productiveBusMirrorRequireAck: false`
  - `productiveBusMirrorReplayable: true`
  - `productiveBusMirrorTtlMs: 60000`
- Status-/Integration-Check um Mirror-Settings erweitern.
- Default bleibt aus.
- Keine echten Mirror-Events senden, wenn wir den Schritt bewusst klein halten.

## Alternative für direkten Code-STEP

`STEP408 – VIP Productive Bus Mirror Implementation`

Dann nur mit:

- Default `productiveBusMirrorEnabled=false`
- Eventbereich `vip.sound.*`
- `mirrorOnly: true`
- `doNotDisplay: true`
- Bus-Fehler dürfen VIP-Command nicht abbrechen
- keine Änderung an `/api/sound/play`
- keine Änderung an Sound-System-Queue
- keine Änderung am Overlay-Rendering

## Nicht machen ohne eigenen STEP

- Kein produktives `vip.overlay.show` für echte VIP-/Mod-Sounds.
- Keine Entfernung der Sound-System-Anzeige.
- Keine Änderung an `/api/sound/play`.
- Keine Queue-/Prioritätsänderung.
- Keine Daily-Usage-Änderung.
- Keine DB-Migration ohne additiven Plan.
- Kein Dashboard-Umbau.
- Keine Registrierung von `/api/vip`.
