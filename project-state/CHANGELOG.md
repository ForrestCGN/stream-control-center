# CHANGELOG

## 2026-06-26 - RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- AGENT_ACCESS_KEY-Konfiguration auf dem Webserver live bestaetigt.
- /api/remote/agent/status mit runtime.accessKeyConfigured true bestaetigt.
- Falscher Bearer nach gesetztem Key bestaetigt: HTTP 503 / reason=invalid_connection_proof.
- rejectCount 1 nach falschem Bearer bestaetigt.
- lastRejectAccessKeyConfigured true bestaetigt.
- lastRejectConnectionProofCompared true bestaetigt.
- acceptsAgentConnections false bestaetigt.
- actionEnabled false bestaetigt.
- productiveAgentRuntime false bestaetigt.
- secretsExposed false bestaetigt.
- bearerTokenLogged false bestaetigt.
- tokenLengthLogged false bestaetigt.
- tokenHashLogged false bestaetigt.
- Kein echter Key in Chat/Doku/Git/Status/UI/Logs dokumentiert.
- Naechsten Step RDAP88_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS

```text
- Sicheres Setzen von AGENT_ACCESS_KEY in /etc/stream-control-center/remote-modboard.env dokumentiert.
- Kein Key im Repo/Chat/Doku/Status/UI/Logs.
- Pruefung ueber accessKeyConfigured true dokumentiert.
- Falscher Bearer nach gesetztem Key soll invalid_connection_proof liefern.
- Korrekter Bearer darf weiterhin nur runtime_not_effectively_enabled liefern, solange Runtime disabled bleibt.
- Keine Runtime-Aktivierung.
- Keine akzeptierte Verbindung.
- Keine Agent-Actions.
- Doku-only.
```

## 2026-06-26 - RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP86 live serverseitig bestaetigt dokumentiert.
- /api/remote/agent/status mit statusApiVersion rdap_agent86.v1 bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- Reject-Test falsches Auth-Schema bestaetigt.
- Reject-Test Bearer bei nicht gesetztem AGENT_ACCESS_KEY bestaetigt.
- rejectCount 2 bestaetigt.
- Keine Verbindung, keine Actions, keine DB, keine Secrets bestaetigt.
- Naechsten Step RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS vorbereitet.
- Doku-only.
```
