# Current Status

Stand: 2026-06-28

Aktuell: `0.2.20B - Agent Heartbeat slim + OBS Live-State read-only`.

Umgesetzt:

```text
- OBS-Seite bleibt Mod-Bedienflaeche read-only.
- Aktuelle OBS-Szene wird prominent angezeigt.
- Lokaler Live-Scene-Refresh bleibt ueber /api/remote-agent/obs/live/status moeglich.
- Stream-PC-Agent kann OBS-Live-State read-only ueber bestehende Agent-WSS-Verbindung senden.
- Heartbeat ist schlank und enthaelt kein OBS-Inventar, damit Webserver-WSS stabil bleibt.
- Neuer Online-Endpunkt: /api/remote/agent/obs/live/status.
- Webserver speichert Live-State nur in Memory.
- Inventar bleibt langsam/manuell.
- Produktive Szenen werden aus inventory.scenes gefiltert: Name beginnt nicht mit `_`.
- Interne `_`-Szenen werden in der normalen Mod-Ansicht ausgeblendet.
- Audioquellen zeigen read-only Mute-Status, ohne Mute/Unmute-Button.
- Quellen werden nur als kompakte Vorschau angezeigt.
- Rollen-/Rechte-Zielbild fuer spaetere OBS-Bedienung ist sichtbar vorbereitet.
```

Nicht umgesetzt / weiterhin verboten:

```text
keine OBS-Steuerung
keine Agent-Actions
keine produktiven Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS requestType Payloads
keine Secrets in Logs, Status, UI oder Doku
```
