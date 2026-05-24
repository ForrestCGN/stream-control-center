# CURRENT_SYSTEM_STATUS_APPEND — STEP371

## Alert Overlay Bus Shadow Adapter

STEP371 ergänzt das bestehende Alert-Overlay um einen Shadow-Adapter für Communication-Bus-Envelopes.

Wichtig: Der produktive Alert-Pfad bleibt weiterhin Legacy. Es wird nicht auf Bus umgeschaltet.

### Legacy bleibt aktiv

Das Overlay verarbeitet weiterhin:

- `op=alert_system`
- `event=play`
- `event=clear`
- `event=finished`

### Zusätzlich vorbereitet

Das Overlay kann nach Anwendung des Patch-Skripts zusätzlich Bus-Envelopes lesen:

- `channel=visual.alert`
- `action=play`
- `action=clear`
- `payload.alert`

Für Bus-Events sendet das Overlay `bus_ack` mit `received` und später `finished`.

### Offene Punkte

- STEP372: Shadow-Bus-Test bauen.
- Danach erst entscheiden, ob ein produktiver Bus-Modus vorbereitet wird.
- Known Issue bleibt separat: verwaister Sound-System `activeBundleLock` kann Birthday/VIP blockieren.
