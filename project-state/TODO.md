# TODO

Stand: RDAP86_STREAM_PC_CONNECTION_ACCESS_KEY_COMPARE_DISABLED  
Datum: 2026-06-26

## Jetzt

```text
RDAP86 lokal einspielen.
Node-Checks ausfuehren.
git status und diff pruefen.
Wenn sauber: stepdone.cmd.
Danach Webserver-Deploy, weil Code unter remote-modboard/ geaendert wird.
```

## Danach

```text
Webserver-Deploy aus frischem GitHub/dev-Clone unter _deploy_tmp.
Serverseitige Tests fuer /api/remote/agent/status, /api/remote/status und /api/remote/routes.
/agent-ws Reject-Tests fuer Auth-Schema und Bearer-Vergleich ausfuehren.
RDAP86B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT vorbereiten.
```

## RDAP86 Aufgaben

```text
- Access-Key-Compare fuer /agent-ws disabled Guard.
- AGENT_ACCESS_KEY nur serverseitig lesen.
- Authorization Bearer nur intern vergleichen.
- falsches Auth-Schema -> invalid_connection_proof.
- nicht gesetzter Key -> access_key_not_configured.
- falscher Bearer -> invalid_connection_proof.
- korrekter Bearer -> runtime_not_effectively_enabled.
- Keine akzeptierte Agent-Verbindung.
- Keine Actions.
- Keine DB.
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
