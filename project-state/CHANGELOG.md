# CHANGELOG

## 2026-06-26 - RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP86 live serverseitig bestaetigt dokumentiert.
- /api/remote/agent/status mit statusApiVersion rdap_agent86.v1 bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- Access-Key-Compare prepared/disabled bestaetigt.
- Reject-Test falsches Auth-Schema bestaetigt: HTTP 503 / reason=invalid_connection_proof.
- Reject-Test Bearer bei nicht gesetztem AGENT_ACCESS_KEY bestaetigt: HTTP 503 / reason=access_key_not_configured.
- rejectCount 2 bestaetigt.
- lastRejectReason access_key_not_configured bestaetigt.
- lastRejectAccessKeyConfigured false bestaetigt.
- lastRejectConnectionProofCompared false bestaetigt.
- Keine Verbindung, keine Actions, keine DB, keine Secrets bestaetigt.
- bearerTokenLogged false, tokenLengthLogged false und tokenHashLogged false bestaetigt.
- Naechsten Step RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```

## 2026-06-26 - RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED

```text
- Access-Key-Compare im bestehenden disabled /agent-ws Guard vorbereitet.
- AGENT_ACCESS_KEY wird nur serverseitig aus process.env gelesen.
- Authorization Bearer wird nur intern verglichen.
- access_key_not_configured als sicherer Ablehnungsgrund ergaenzt.
- invalid_connection_proof fuer falsches Auth-Schema/falschen Bearer-Wert vorbereitet.
- runtime_not_effectively_enabled fuer korrekten Proof bei weiterhin disabled Runtime vorbereitet.
- agent-runtime-disabled.service.js erweitert.
- agent-status.service.js auf rdap_agent86.v1 erweitert.
- /api/remote/agent/status zeigt accessKeyComparePrepared.
- /api/remote/status .agent zeigt sichere Access-Key-Compare-Summary.
- /api/remote/routes .agentStatusFoundation zeigt sichere Access-Key-Compare-Summary.
- server.js MODULE_BUILD auf RDAP86 gesetzt.
- Keine akzeptierte Agent-Verbindung.
- Kein echter WebSocket-Handshake.
- Kein Heartbeat-Receiver.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Admin-Notes-Aenderung.
- Keine Secret-Ausgabe.
- Keine Bearer-Token-/Token-Laengen-/Token-Hash-Ausgabe.
```

## 2026-06-26 - RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT

```text
- RDAP85 live serverseitig bestaetigt dokumentiert.
- /api/remote/agent/status mit statusApiVersion rdap_agent85.v1 bestaetigt.
- /api/remote/status .agent bestaetigt.
- /api/remote/routes .agentStatusFoundation bestaetigt.
- Reject-Test missing_agent_id bestaetigt.
- Reject-Test unknown_agent_id bestaetigt.
- Reject-Test missing_connection_proof bestaetigt.
- rejectCount 3 bestaetigt.
- Keine Verbindung, keine Actions, keine DB, keine Secrets bestaetigt.
- Naechsten Step RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED vorbereitet.
- Doku-only.
- Kein Webserver-Deploy noetig.
```
