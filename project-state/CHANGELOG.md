# CHANGELOG

## 2026-06-26 - RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS

```text
- Sicheres Env-Setup fuer AGENT_ACCESS_KEY dokumentiert.
- Env-Datei /etc/stream-control-center/remote-modboard.env dokumentiert.
- Sichere Dateirechte fuer Env-Datei dokumentiert.
- Lokale Key-Generierung auf dem Webserver mit openssl rand -base64 48 dokumentiert.
- Klar dokumentiert: Kein Key im Repo, Chat, Doku, Status, UI oder Logs.
- Sichere Pruefung runtime.accessKeyConfigured true dokumentiert.
- Falscher-Bearer-Test nach gesetztem Key dokumentiert.
- Erwartung invalid_connection_proof bei falschem Bearer und gesetztem Key dokumentiert.
- Weiterhin keine akzeptierte Stream-PC Verbindung.
- Weiterhin keine Runtime-Aktivierung.
- Keine Agent-Actions.
- Keine DB-Migration.
- Keine neue Permission.
- Doku-only.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP86 live serverseitig bestaetigt dokumentiert.
- /api/remote/agent/status mit statusApiVersion rdap_agent86.v1 bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- Reject-Test falsches Auth-Schema bestaetigt: invalid_connection_proof.
- Reject-Test Bearer bei nicht gesetztem AGENT_ACCESS_KEY bestaetigt: access_key_not_configured.
- rejectCount 2 bestaetigt.
- Keine Verbindung, keine Actions, keine DB, keine Secrets bestaetigt.
- Naechsten Step RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```
