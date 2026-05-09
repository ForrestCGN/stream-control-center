# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Loyalty / Twitch Presence

STEP203.3.2 behebt den fehlenden Safety-Net für `loyalty_stream_state`.

Aktueller Stand:

- Routen aus STEP203.3.1 sind registriert.
- `ensureStreamStateRow()` legt die Tabelle `loyalty_stream_state` jetzt selbst per `CREATE TABLE IF NOT EXISTS` an, falls sie fehlt.
- Keine bestehenden Daten werden gelöscht oder geändert.
