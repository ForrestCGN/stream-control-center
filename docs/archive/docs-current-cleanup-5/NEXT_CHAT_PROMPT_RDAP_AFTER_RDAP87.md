# NEXT CHAT PROMPT - RDAP after RDAP87

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## WICHTIG

GitHub/dev ist Wahrheit. Nicht blind aus Erinnerung arbeiten. Erst Startdateien lesen, dann Plan nennen, dann auf `go` warten.

## Startdateien wirklich lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/RDAP81_STREAM_PC_CONNECTION_HANDSHAKE_AND_ACCESS_KEY_PLAN.md
docs/current/RDAP82_STREAM_PC_CONNECTION_RUNTIME_DISABLED_SKELETON.md
docs/current/RDAP82B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC.md
docs/current/RDAP83B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN.md
docs/current/RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED.md
docs/current/RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED.md
docs/current/RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT.md
docs/current/RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP87.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand nach RDAP87

```text
RDAP86:
- Access-Key-Compare im bestehenden disabled /agent-ws Guard live bestaetigt.
- AGENT_ACCESS_KEY war beim Live-Test noch nicht gesetzt.
- Falsches Auth-Schema -> invalid_connection_proof.
- Bearer bei nicht gesetztem AGENT_ACCESS_KEY -> access_key_not_configured.
- Verbindungen werden weiterhin immer mit 503 abgelehnt.
- Keine akzeptierte Stream-PC Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Keine Agent-Actions.
- Keine DB.
- Keine Secret-Ausgabe.

RDAP86B:
- RDAP86 Live-Bestaetigung dokumentiert.
- Doku-only.

RDAP87:
- Sicheres Setzen von AGENT_ACCESS_KEY in /etc/stream-control-center/remote-modboard.env dokumentiert.
- Kein Key im Repo.
- Kein Key im Chat.
- Kein Key in Doku.
- Kein Key in Logs/Status/UI.
- Nur sichere Pruefung accessKeyConfigured true dokumentiert.
- Weiterhin keine Runtime-Aktivierung.
- Weiterhin keine akzeptierte Verbindung.
- Doku-only.
```

## Harte Grenzen weiterhin

```text
Keine akzeptierte Stream-PC Verbindung ohne separaten Plan und explizites go.
Keine Runtime-Aktivierung ohne separaten Plan.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine Admin-Notes-Politur.
Kein sichtbares Hauptmodul Agent.
Keine Secret-Ausgabe.
Kein AGENT_ACCESS_KEY im Repo.
Kein AGENT_ACCESS_KEY im Chat.
Kein Bearer-Token in Status/UI/Logs.
Keine Token-Laenge und kein Token-Hash in Status/UI/Logs.
```

## Sprachregel

Sichtbar / Doku / Nutzerfokus:

```text
Stream-PC Verbindung
Verbindungen
Webserver <-> Stream-PC
```

Intern / Code / Route weiterhin okay:

```text
agent
agent-status
/api/remote/agent/status
stream-pc-agent
/agent-ws
```

Nicht sichtbar als Hauptmodul verwenden:

```text
Agent -> Agent-Status
```

## Naechster empfohlener Step

```text
RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT
```

Ziel:

```text
- Nach manuellem Env-Setup auf dem Webserver bestaetigen, dass accessKeyConfigured true ist.
- Falscher Bearer muss invalid_connection_proof liefern.
- Optional korrekter Bearer darf nur runtime_not_effectively_enabled liefern.
- Weiterhin keine akzeptierte Verbindung.
- Weiterhin keine Runtime-Aktivierung.
- Keine produktiven Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
- Doku-only.
```

## Vor RDAP87B pruefen

```text
Der echte AGENT_ACCESS_KEY darf nicht in Chat/Doku/Git/Screenshots kopiert werden.
Nur sichere Statuswerte posten:
- accessKeyConfigured true/false
- lastRejectReason
- lastRejectAccessKeyConfigured
- lastRejectConnectionProofCompared
- secretsExposed false
- bearerTokenLogged false
- tokenLengthLogged false
- tokenHashLogged false
```

## Erwartete erste Antwort im neuen Chat

```text
Ich lese zuerst die aktuellen Startdateien aus GitHub/dev und pruefe RDAP81/RDAP82/RDAP82B/RDAP83/RDAP83B/RDAP84/RDAP85/RDAP85B/RDAP86/RDAP86B/RDAP87 sowie die relevanten Runtime-Dateien. Danach nenne ich nur den Plan fuer RDAP87B Live-Bestaetigung und naechsten Prompt. Kein Code/ZIP vor deinem go.
```
