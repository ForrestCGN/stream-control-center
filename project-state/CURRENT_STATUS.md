# Current Status

## Stand

Aktueller Fokus: VIP30 / 30 Tage VIP im `stream-control-center`.

VIP30-STEP1 wurde lokal getestet:

```text
/api/vip30/status -> ok=True
status -> ready_step1_db_bus_dashboard_logging
```

Communication-Bus-Status zeigte `module:vip30` korrekt unter `status.clients` mit Online-Status und Heartbeats.

## VIP30-STEP2

Vorbereitet ist `VIP30-STEP2 Twitch Capability Check`.

Ziel:

```text
Prüfen, ob die bestehende Twitch-Auth für den späteren VIP30-Live-Flow geeignet ist.
```

Neue/erweiterte Routen:

```text
/api/vip30/twitch/capability
/api/vip30/twitch/scopes
```

Geprüft werden:

```text
channel:manage:redemptions
channel:manage:vips
Broadcaster/User-Match
Token-Gültigkeit über /api/twitch/auth/validate
```

Sicherheitsregel:

```text
Keine Twitch-Schreibaktion in STEP2.
Keine VIP-Vergabe.
Kein Fulfill/Cancel.
```
