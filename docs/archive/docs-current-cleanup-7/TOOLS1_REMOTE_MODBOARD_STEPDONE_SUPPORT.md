# TOOLS1 - Remote-Modboard Support fuer stepdone.cmd

Stand: TOOLS1_REMOTE_MODBOARD_STEPDONE_SUPPORT
Datum: 2026-06-24

## Zweck

TOOLS1 erweitert `stepdone.cmd`, damit Aenderungen unter `remote-modboard/` kuenftig wie normale Projektdateien behandelt werden.

Problem vor TOOLS1:

- `stepdone.cmd` hat Doku/Projektdateien committed.
- `remote-modboard/backend/...` blieb danach offen.
- Der Abschluss meldete trotzdem `[ok]`.
- Dadurch mussten Remote-Modboard-Dateien wiederholt manuell gezielt nachcommitted werden.

## Geaendert

`stepdone.cmd`:

- JS-Syntaxcheck erkennt jetzt auch:

```text
remote-modboard/backend/*.js
```

- Erlaubte Projektbereiche enthalten jetzt:

```text
remote-modboard
```

- Abschlusspruefung bricht mit Fehler ab, wenn nach Commit/Push noch relevante Projektdateien offen sind.

## Weiterhin verboten

- kein `git add .`
- keine Secrets
- keine `.env`
- keine SQLite-/DB-Dateien
- keine ZIP/7z/Backup-Dateien
- keine Token/Secret/Password/Credential-Dateien
- keine Datenbank-/Server-Aenderung

## Erwartetes Ergebnis

Kuenftige RDAP-/Remote-Modboard-Steps sollen nicht mehr jedes Mal manuell nachcommitted werden muessen, wenn nur Dateien unter `remote-modboard/` offen bleiben.
