# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP16_HANDOFF_VISIBLE_NEXT
Datum: 2026-06-24

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP16_HANDOFF_VISIBLE_NEXT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_UI1.txt
```

## Aktueller bestätigter Stand

```text
RDAP16_HANDOFF_VISIBLE_NEXT
```

RDAP15 wurde abgeschlossen. Danach wurde dieser Handoff vorbereitet, damit der nächste Chat mit sichtbarem Fortschritt starten kann.

## Live-Basis

```text
Remote-Modboard public read-only:
https://mods.forrestcgn.de/api/remote/

Interner Service:
127.0.0.1:3010

Systemd:
scc-remote-modboard.service
```

## Bestätigte Live-Funktionen

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/auth/me
GET /api/remote/auth/permissions/check?permission=remote.view
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

OAuth bleibt deaktiviert:

```text
GET /api/remote/auth/twitch/start    -> HTTP 403
GET /api/remote/auth/twitch/callback -> HTTP 403
```

## Wichtigste Entscheidungen

### Struktur

Wenn fachlich passend:

```text
vorhandene Module/Services/Routen erweitern
```

Neue Module nur, wenn die Verantwortung wirklich nicht sauber in vorhandene Struktur passt.

### Server-Scripts

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.

### resourceType

RDAP15 Entscheidung:

```text
Hybrid
```

Neue Lock-Konzepte müssen typisierte Resource-Keys planen:

```text
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
command:twitch:clip
```

## Nächster Fokus

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

Ziel:

Eine erste sichtbare Remote-Modboard-Webseite / UI-Seite bauen, rein read-only.

Keine Login-/OAuth-/Write-/Agent-Aktivierung.

## Weiterhin verboten

- kein Login aktivieren
- kein Twitch-OAuth aktivieren
- keine Cookies setzen
- keine Sessions erstellen
- keine Session-Verlaengerung
- kein last_seen_at Update
- keine produktiven DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung
- keine Secrets ins Repo, Frontend, Logs oder Chat
