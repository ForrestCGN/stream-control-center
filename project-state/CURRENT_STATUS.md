# CURRENT STATUS

Stand: RDAP1 / Remote Dashboard Agent Plan
Datum: 2026-06-22

## Aktueller bestätigter Runtime-Stand

Das Projekt `stream-control-center` hat für HypeTrain die zentrale Overlay-Basis vorbereitet.

Bestätigt aus dem vorherigen Stand HT4.3:

- HypeTrain Backend bleibt auf `0.2.3 / STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`.
- Start-Sound ist aktiv: `mediaId 1618`, `hasMedia true`.
- Rekord-Sound ist aktiv: `mediaId 1602`, `hasMedia true`.
- Level-Up und Ende sind fachlich noch offen, weil dafür noch keine Sounds/Medien ausgewählt wurden.
- Tagebuch-Endeintrag bleibt aktiv und unabhängig von Sound-/Overlay-Aktionen.
- Sound läuft weiterhin über `sound_system`.
- Kein separates HypeTrain-Overlay-System wird gebaut.

## Central Event Overlay

Neue zentrale Overlay-Datei aus HT4.x:

- `htdocs/overlays/central_event_overlay.html`

Aktueller Overlay-Stand:

- Version `0.1.3`
- Step `HT4.3`

Bestätigt:

- `overlay:central_event_overlay` ist am Communication Bus verbunden.
- Status `connected: True`.
- Status `online`.
- Heartbeat aktiv.
- HypeTrain `start` sichtbar getestet.
- HypeTrain `level_up` sichtbar getestet.
- HypeTrain `end` sichtbar getestet.
- HypeTrain `record` sichtbar getestet.
- Payload-Anzeige ist robust vorbereitet.
- Erste CGN-Basisoptik ist eingebaut.

## Neuer Planungsstand RDAP1

Neu geplant und dokumentiert:

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`

RDAP1 ist ein reiner Planungs-/Doku-Step für Dashboard-v2 und die spätere sichere Webserver↔Stream-PC-Anbindung.

Festgelegt:

- Dashboard-v2 startet nicht mit Design oder Bootstrap.
- Priorität ist sichere Webserver↔Stream-PC-Anbindung.
- Webserver wird öffentliche Zentrale.
- Stream-PC wird lokaler Agent/Ausführer.
- Verbindung läuft später aktiv vom Stream-PC zum Webserver per WSS/WebSocket.
- Keine Portfreigabe am Stream-PC.
- Keine freien Shell-/Datei-/Prozessbefehle.
- Remote-Actions nur über Allowlist.
- Jede Remote-Aktion braucht Rechteprüfung, requestId, expiresAt, Ergebnisantwort und Audit.
- Multi-User und Bearbeitungs-Locks werden von Anfang an eingeplant.
- Twitch-Rollen werden berücksichtigt, lokale Dashboard-Rechte entscheiden aber konkret.
- Spezialrolle `Sound-Profi` ist geplant.
- Optionale Rolle `Media-Manager` ist vorgemerkt.

## Nicht geändert durch RDAP1

- kein Backend-Code
- kein Dashboard-Code
- keine DB-Änderung
- keine Config-Änderung
- keine OBS-Änderung
- kein Agent-Code
- kein Auth-/Permission-Code
- keine Runtime-Datei
- kein Bootstrap-/Design-Entscheid

## Dokumentation

Neu/aktualisiert:

- `docs/current/REMOTE_DASHBOARD_AGENT_PLAN.md`
- `docs/current/DASHBOARD_ROLES_PERMISSIONS_MATRIX.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
