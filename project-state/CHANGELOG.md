# CHANGELOG

## RDAP1 / Remote Dashboard Agent Plan – 2026-06-22

- Neue Plan-Datei ergänzt:
  - `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- Neue Rollen-/Rechte-Plan-Datei ergänzt:
  - `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- Projektstatus auf Dashboard-v2/Webserver-Agent-Planung aktualisiert:
  - `project-state/CURRENT_STATUS.md`
  - `project-state/NEXT_STEPS.md`
  - `project-state/TODO.md`
  - `project-state/FILES.md`
- Festgehalten:
  - Dashboard-v2 startet nicht mit Design/Bootstrap.
  - Priorität ist sichere Webserver↔Stream-PC-Anbindung.
  - Stream-PC verbindet sich später aktiv per WSS/WebSocket zum Webserver.
  - Keine Portfreigabe am Stream-PC.
  - Keine freien Shell-/Datei-/Prozessbefehle.
  - Remote-Actions nur über Allowlist.
  - Rechteprüfung, requestId, expiresAt, Ergebnisantwort und Audit sind Pflicht.
  - Multi-User und Bearbeitungs-Locks sind Pflichtbestandteil der Planung.
  - Twitch-Rollen helfen nur bei der Erkennung; lokale Dashboard-Rechte entscheiden konkret.
  - Spezialrolle `Sound-Profi` und optionale Rolle `Media-Manager` sind geplant.
- Kein Backend geändert.
- Kein Dashboard geändert.
- Keine DB geändert.
- Keine Config geändert.
- Keine Runtime-Datei geändert.

## HT4.3 / Central Event Overlay CGN Base Style – 2026-06-22

- `htdocs/overlays/central_event_overlay.html` auf Version `0.1.3` / Step `HT4.3` gebracht.
- Erste CGN-Basisoptik ergänzt.
- HypeTrain Start, Level-Up, Ende und Rekord sichtbar bestätigt.
- Payload-Anzeige aus HT4.2 bleibt erhalten.
- Overlay bleibt am Communication Bus angebunden.
- Kein Backend geändert.
- Kein Dashboard geändert.
- Keine DB geändert.
- Keine OBS-Quelle geändert.

## HT4.2 / Central Event Overlay Payload Display – 2026-06-22

- Payload-Darstellung im zentralen Overlay robuster gemacht.
- HypeTrain-Felder wie Level, Total/Punkte, Ziel/Goal, Rekordtyp und Supporter werden angezeigt, wenn vorhanden.
- Fallback-Anzeige bleibt erhalten.
- Kein Backend geändert.
- Keine DB geändert.

## HT4.1 / HypeTrain Channel Aliases – 2026-06-22

- Echte HypeTrain-Overlay-Channels im zentralen Overlay ergänzt.
- Getestete Channels:
  - `hypetrain.overlay.start`
  - `hypetrain.overlay.level_up`
  - `hypetrain.overlay.end`
  - `hypetrain.overlay.record`
- Kein Backend geändert.
- Keine DB geändert.

## HT4.0 / Central Event Overlay Base – 2026-06-22

- Neue zentrale Overlay-Datei angelegt:
  - `htdocs/overlays/central_event_overlay.html`
- Anbindung an vorhandenen Overlay-Bus-Client vorbereitet.
- Heartbeat/Registrierung am Communication Bus bestätigt.
- Keine bestehenden Overlays gelöscht.
- Kein eigenes paralleles HypeTrain-Overlay-System gebaut.
