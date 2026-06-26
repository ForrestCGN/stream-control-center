# TODO

Stand: RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED  
Datum: 2026-06-26

## Jetzt erledigt

```text
RDAP88 Correct-Bearer-Reject-Only-Test live bestaetigt:
- AGENT_ACCESS_KEY lokal auf Webserver geladen.
- Echter Key nicht ausgegeben.
- Bearer nicht ausgegeben.
- Token-Laenge nicht ausgegeben.
- Token-Hash nicht ausgegeben.
- Korrekter Bearer -> HTTP 503 / reason=runtime_not_effectively_enabled.
- runtime.accessKeyConfigured true.
- runtime.acceptsAgentConnections false.
- runtime.effectiveEnabled false.
- lastRejectAccessKeyConfigured true.
- lastRejectConnectionProofCompared true.
- Keine Verbindung.
- Keine Actions.
- Keine DB.
- Keine Secrets.
```

## Naechster Schritt

```text
RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```

## RDAP89 Aufgaben

```text
- Runtime-Freigabe nur planen, noch nicht aktivieren.
- Bedingungen fuer spaeteren Accept dokumentieren.
- Zwei-Stufen-Freigabe festlegen.
- AGENT_RUNTIME_ENABLED=true allein darf nicht reichen.
- Optionalen zweiten Explicit-Enable-Schalter planen.
- Heartbeat/Online/Actions getrennt halten.
- Keine Secret-Ausgabe.
```

## Nicht machen

```text
- Keine weitere Admin-Notes-Politur.
- Kein Delete/Deactivate.
- Keine OBS-/Sound-/Overlay-/Command-Actions.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
- Keine produktiven Writes.
- Kein sichtbares Hauptmodul Agent.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Secret-Ausgabe.
```
