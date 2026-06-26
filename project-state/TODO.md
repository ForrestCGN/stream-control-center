# TODO

Stand: RDAP87_STREAM_PC_CONNECTION_ACCESS_KEY_ENV_SETUP_DOCS  
Datum: 2026-06-26

## Jetzt

```text
RDAP87 lokal einspielen.
git status und diff pruefen.
Wenn sauber: stepdone.cmd.
```

## Danach

```text
Kein Webserver-Deploy fuer RDAP87, weil Doku-only.
AGENT_ACCESS_KEY bei Bedarf manuell auf dem Webserver in /etc/stream-control-center/remote-modboard.env setzen.
Danach Service neu starten und nur sichere Statuswerte pruefen.
RDAP87B_DOCS_LIVE_CONFIRM_AND_NEXT_PROMPT vorbereiten.
```

## RDAP87 Aufgaben

```text
- Env-Pfad fuer AGENT_ACCESS_KEY dokumentieren.
- Sichere Dateirechte dokumentieren.
- Key-Generierung lokal auf dem Webserver dokumentieren.
- Kein echter Key in Repo/Chat/Doku.
- Statuspruefung accessKeyConfigured true dokumentieren.
- Falscher-Bearer-Test nach gesetztem Key dokumentieren.
- Keine akzeptierte Stream-PC Verbindung.
- Keine Actions.
- Keine DB.
- Keine Secret-Ausgabe.
```

## Nicht machen

```text
- Kein Backend-Code.
- Kein Webserver-Deploy.
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
