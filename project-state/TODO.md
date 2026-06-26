# TODO

Stand: RDAP85_STREAM_PC_CONNECTION_HANDSHAKE_PRECHECK_DISABLED  
Datum: 2026-06-26

## Jetzt

```text
RDAP85 lokal einspielen.
Node-Checks ausfuehren.
git status und diff pruefen.
Wenn sauber: stepdone.cmd.
Danach Webserver-Deploy, weil Code unter remote-modboard/ geaendert wird.
```

## Danach

```text
Webserver-Deploy aus frischem GitHub/dev-Clone unter _deploy_tmp.
Serverseitige Tests fuer /api/remote/agent/status, /api/remote/status und /api/remote/routes.
/agent-ws Reject-Tests fuer fehlende/falsche/richtige Header ausfuehren.
Neuer Chat mit docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP85.md.
RDAP85B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT vorbereiten.
```

## RDAP85 Aufgaben

```text
- Header-/Handshake-Precheck im bestehenden disabled Guard.
- missing/unknown/missing proof/invalid proof/protocol unsupported sicher diagnostizieren.
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
