# Next Steps

Stand: 2026-06-28

Naechster sinnvoller Code-Step nach `0.2.14C`:

```text
0.2.15 - OBS Inventar read-only vorbereiten
```

Ziel:

```text
- Szenen/Quellen/Audio read-only vorbereiten.
- Status-/Modellstruktur fuer OBS-Inventar sauber erweitern.
- Keine Steuerbuttons.
- Keine Szenenwechsel.
- Keine Mute-/Unmute-Aktionen.
- Keine Quellen-Sichtbarkeit aendern.
- Keine Media-Steuerung.
- Keine produktiven Writes.
- Keine Agent-Actions ohne separates Action-Modell.
```

Vor dem naechsten Code-Step zuerst echte Dateien aus GitHub/dev lesen, insbesondere:

```text
remote-modboard/backend/src/routes/obs-readonly.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/modules/system/obs.js
htdocs/dashboard-v2/assets/modules/system/obs.js
backend/modules/local_remote_modboard_adapter.js
backend/modules/remote_agent.js
```

Spaeter separat planen: Navigation in Richtung Live / Control / Loyalty / Community / System / Admin, ohne grossen Umbau im OBS-Inventar-Step.
