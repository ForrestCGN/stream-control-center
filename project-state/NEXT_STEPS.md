# Next Steps

Stand: 2026-06-28

Naechster Schritt nach `0.2.13`:

```text
0.2.13 lokal testen und stepdone, wenn passend.
```

Pruefen:

```text
- /api/remote/local-dashboard/obs/status liefert moduleVersion 0.2.13.
- OBS-Status kommt aus remote_agent-Komponentenstatus.
- safety zeigt obsControlEnabled false / noAgentActionExecution true.
- /api/remote/status zeigt obsModule readonly_foundation.
- /dashboard-v2 bleibt sichtbar und unveraendert.
```

Danach:

```text
0.2.14 - OBS Inventar read-only vorbereiten
```

Ziel 0.2.14:

```text
- aktuelle Szene read-only,
- Szenenliste read-only,
- Quellenliste read-only,
- Audioquellen read-only,
- weiterhin keine Steuerung.
```

Nicht tun:

```text
- keine Szenenwechsel,
- keine Mutes,
- keine Quellen-Sichtbarkeit aendern,
- keine produktiven Agent-Actions,
- keine parallele lokale UI bauen.
```
