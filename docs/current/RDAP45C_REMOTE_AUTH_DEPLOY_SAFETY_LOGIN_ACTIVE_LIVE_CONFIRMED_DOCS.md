# RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS

Datum: 2026-06-26  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Doku-only / Live-Bestaetigung

## Zweck

RDAP45C dokumentiert den live bestaetigten Stand nach RDAP45B:

```text
Twitch-Login ist aktiv/freigegeben.
twitch/start darf bei aktivem Login HTTP 302 liefern.
twitch/callback ohne gueltigen OAuth-State muss weiterhin HTTP 403 liefern.
Das Deploy-Script akzeptiert den aktiven Login-Zustand.
Admin-Notizen RDAP44 bleiben unveraendert live.
```

## Hintergrund

Beim RDAP44/RDAP45 Deploy wurde sichtbar:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
```

RDAP45 hatte daraus zunaechst Option A gebaut: Twitch-OAuth-Start nur mit explizitem Release-Gate `RDAP_TWITCH_OAUTH_START_RELEASED=true`.

Im Live-Betrieb wurde danach klar:

```text
Der Dashboard-Login wird bereits aktiv genutzt.
Der Login-Button nutzt den lokalen Twitch-Fallback.
twitch/start HTTP 302 ist bei aktivem Login korrekt.
```

RDAP45B hat deshalb den Deploy-Safety-Check korrigiert.

## Live-Bestaetigung RDAP45B

Bestaetigte Server-Ausgaben:

```text
curl -s -o /dev/null -w "twitch/start HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/start
twitch/start HTTP 302

curl -s -o /dev/null -w "twitch/callback HTTP %{http_code}\n" https://mods.forrestcgn.de/api/remote/auth/twitch/callback
twitch/callback HTTP 403
```

Zusaetzlich bestaetigt:

```text
Login funktioniert wieder.
```

## RDAP44 Gegenpruefung

Live-Asset-Pruefung:

```text
curl -fsS http://127.0.0.1:3010/assets/rdap28-admin-notes.js | grep -n "DEFAULT_TARGET_USER\|adminNotesTargetSelect\|TARGET_USER_UID"
```

Bestaetigt:

```text
DEFAULT_TARGET_USER vorhanden.
adminNotesTargetSelect vorhanden.
TARGET_USER_UID nicht vorhanden.
```

Damit bleibt RDAP44 live intakt:

```text
Admin-Notizen haben Zieluser-Auswahl.
Default bleibt ForrestCGN / tw:127709954.
Read/Create nutzen den ausgewaehlten Zieluser.
```

## Richtiger Safety-Stand ab RDAP45B/RDAP45C

```text
twitch/start HTTP 302 ist erlaubt, wenn Twitch-Login bewusst aktiv/freigegeben ist.
twitch/start HTTP 403 ist erlaubt, wenn Twitch-Login gesperrt ist.
twitch/callback HTTP 403 ohne gueltigen OAuth-State ist Pflicht.
Andere Start-Codes bleiben Deploy-Safety-Fehler.
```

## Live-Env-Hinweis

Auf dem Live-System wurde fuer den aktiv genutzten Login gesetzt:

```text
RDAP_TWITCH_OAUTH_START_RELEASED=true
```

Das bedeutet:

```text
Twitch-OAuth-Start ist bewusst freigegeben.
Das ist Auth-/Session-Scope.
Es ist keine Freigabe fuer Remote-Writes, Agent-Actions, OBS, Sound, Overlay, Commands oder Channelpoints.
```

## Weiterhin deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
Physisches Delete
Community-Read fuer Admin-Notizen
Permission-Verwaltung in der UI
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Geaenderte Dateien in RDAP45C

```text
docs/current/RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP45C.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht geaendert

```text
Kein Backend-Code.
Kein Frontend-Code.
Keine DB-Migration.
Keine Config-Datei im Repo.
Kein Webserver-Deploy noetig.
```
