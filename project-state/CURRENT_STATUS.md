# Current Status

Stand: 2026-06-28

Aktuell: `0.2.21 - OBS Allowlist-/Rechte-Modell read-only vorbereitet`.

Umgesetzt und bestaetigt aus 0.2.20C:

```text
- Stream-PC-Agent verbindet per WSS mit dem Webserver.
- Heartbeat ist schlank und wird nicht mehr wegen payload_too_large abgelehnt.
- Schneller Live-State ist vom Heartbeat getrennt.
- Lokaler Live-State liest OBS korrekt.
- Webserver empfaengt aktuelle OBS-Program-Szene.
- Online-Endpoint /api/remote/agent/obs/live/status liefert active=true.
- UI kann Online-Live-Szene anzeigen.
```

Neu in 0.2.21:

```text
- OBS-Allowlist-Modell read-only vorbereitet.
- Rechte-Modell fuer spaetere OBS-Bedienung read-only vorbereitet.
- UI zeigt spaetere Bedienbarkeit als Modell: erlaubt/nicht freigegeben/read-only.
- Keine pauschale Aussage mehr: jede produktive Szene sei spaeter schaltbar.
```

Weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS requestType Payloads
```
