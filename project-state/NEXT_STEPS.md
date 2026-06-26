# NEXT_STEPS

Stand: RDAP88_STREAM_PC_CONNECTION_CORRECT_BEARER_REJECT_ONLY_TEST_CONFIRMED  
Datum: 2026-06-26

## Naechster Step

```text
RDAP89_STREAM_PC_CONNECTION_RUNTIME_ENABLE_PLAN
```

## Ziel

```text
Plan fuer spaetere Runtime-Freigabe der Stream-PC Verbindung erstellen.
Noch keine Runtime aktivieren.
Noch keine Verbindung akzeptieren.
Keine produktiven Remote-Actions.
Keine Secret-Ausgabe.
```

## Ausgangspunkt RDAP88

```text
- RDAP86 Access-Key-Compare ist live bestaetigt.
- RDAP87 hat sicheres Env-Setup dokumentiert.
- RDAP87B hat AGENT_ACCESS_KEY gesetzt und falschen Bearer getestet.
- RDAP88 hat korrekten Bearer sicher getestet.
- accessKeyConfigured true ist live bestaetigt.
- Falscher Bearer liefert invalid_connection_proof.
- Korrekter Bearer liefert runtime_not_effectively_enabled.
- Verbindung bleibt HTTP 503 / disabled.
- acceptsAgentConnections bleibt false.
- actionEnabled bleibt false.
- productiveAgentRuntime bleibt false.
- Kein Key/Bearer/Token-Hash/Token-Laenge sichtbar.
```

## RDAP89 planen

```text
- Bedingungen fuer spaeteren akzeptierten /agent-ws Handshake definieren.
- Zwei-Stufen-Freigabe beibehalten.
- AGENT_RUNTIME_ENABLED=true allein darf nicht reichen.
- Moeglichen zweiten Explicit-Enable-Schalter planen.
- Reihenfolge fuer Accept, Online-Status und Heartbeat trennen.
- Heartbeat-Receiver erst separat planen oder klar als read-only Runtime-Bestandteil abgrenzen.
- Agent-online-Status erst separat planen oder klar begrenzen.
- Agent-Actions strikt getrennt spaeter planen.
```

## Strikt nicht machen

```text
Keine akzeptierte Agent-Verbindung in RDAP89.
Keine Runtime-Aktivierung in RDAP89.
Keine OBS-Steuerung.
Keine Sound-Ausloesung.
Keine Overlay-Schaltung.
Keine Command-/Channelpoints-Steuerung.
Keine freie Shell.
Keine freie Datei-/Prozess-/URL-Ausfuehrung.
Keine produktiven Writes.
Keine DB-Migration ohne separaten Plan.
Keine neue Permission ohne separaten Plan.
Keine produktive Agent-Action-Queue.
Keine Secret-Ausgabe.
```

## Admin-Notes

```text
Admin-Notes eingefroren.
Nur bei echtem Fehler wieder anfassen.
```
