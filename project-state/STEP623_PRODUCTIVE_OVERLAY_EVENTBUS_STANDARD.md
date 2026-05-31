# STEP623 – Produktive Overlay-Inventur + EventBus-Standard

## Ergebnis

TTS, Deathcounter V2 und Challenge Status wurden ohne Funktionsentfernung an den gemeinsamen Overlay-Bus-Client angebunden. Dadurch liefern sie künftig dieselbe technische Basis wie das STEP622-Testoverlay:

- `bus_hello`
- echte `bus_heartbeat` alle 5 Sekunden
- ACK-Unterstützung des shared Clients
- Meta-Daten mit Overlay-Datei, Rolle und Host-Erwartung

## Geänderte Dateien

```text
htdocs/overlays/_overlay-tts.html
htdocs/overlays/_overlay-deathcounter-v2.html
htdocs/overlays/_overlay-challenge_status.html
docs/current/OVERLAY_EVENTBUS_STANDARD_STEP623.md
project-state/STEP623_PRODUCTIVE_OVERLAY_EVENTBUS_STANDARD.md
README_STEP623_PRODUCTIVE_OVERLAY_EVENTBUS_STANDARD.md
```

## Bewusst nicht geändert

```text
htdocs/overlays/_overlay-alerts-v2.html
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/vip_sound_overlay_v2.html
```

Diese drei wurden in STEP621D bereits mit echten Heartbeats versehen. Eine spätere technische Vereinheitlichung auf den shared Client kann separat erfolgen, damit keine funktionierende Overlay-Logik versehentlich gestört wird.

## Offene Punkte

- OBS-Quelle ↔ Bus-Client Mapping fehlt noch.
- Dashboard-Namen sind weiterhin teilweise technische IDs.
- Reparaturaktionen sind noch nicht gebaut.
- Browserquellen-Erfassung aus OBS muss ggf. noch angepasst werden, falls `/api/obs/browser-sources` keine Quellen liefert.
