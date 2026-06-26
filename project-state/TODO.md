# TODO

Stand: RDAP83_STREAM_PC_CONNECTION_HANDSHAKE_REJECT_DIAGNOSTIC  
Datum: 2026-06-26

## Jetzt

```text
RDAP83 lokal einspielen.
Node-Checks ausfuehren.
git status und diff pruefen.
Wenn sauber: stepdone.cmd.
Danach Webserver-Deploy, weil Code unter remote-modboard/ geaendert wird.
```

## Danach

```text
Webserver-Deploy aus frischem GitHub/dev-Clone unter _deploy_tmp.
Serverseitige Tests fuer /api/remote/agent/status, /api/remote/status und /api/remote/routes.
Optionalen /agent-ws Reject-Test ausfuehren.
Neuer Chat mit docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP83.md.
RDAP84_STREAM_PC_CONNECTION_ACCESS_KEY_HANDSHAKE_PLAN vorbereiten.
```

## RDAP83 Aufgaben

```text
- Nur Diagnose fuer abgelehnte /agent-ws Verbindungsversuche.
- In-Memory-Zaehler/letzte Ablehnung.
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
