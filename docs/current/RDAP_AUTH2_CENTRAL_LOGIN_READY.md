# RDAP_AUTH2_CENTRAL_LOGIN_READY

Stand: 2026-06-24

## Zweck

Dieser Step bereitet die spaetere zentrale Login-Schicht fuer ForrestCGN / stream-control-center / Remote-Modboard vor, ohne den aktuell funktionierenden Twitch-Login im Modboard hart umzubauen.

Zielarchitektur:

```text
forrestcgn.de/login
ODER
mods.forrestcgn.de/login

-> beide fuehren in dieselbe zentrale Auth-/Session-Schicht
-> gemeinsame serverseitige User-/Identity-/Session-Wahrheit in derselben Datenbank
-> mods.forrestcgn.de prueft serverseitig Session + Permission remote.view
```

## Sicherheitsgrundsatz

Nicht erlaubt:

- Login-Daten im Link weiterreichen
- Twitch-Tokens im Frontend speichern
- Sessionwerte im Frontend anzeigen
- Sessionwerte in Logs/Chat/Repo schreiben
- Dashboard-Buttons als Sicherheitsbarriere verwenden
- produktive Actions ohne serverseitige Permission pruefen

Erlaubtes Ziel:

- Cookie enthaelt nur eine Session-ID
- echte Sessiondaten liegen serverseitig in DB
- forrestcgn.de und mods.forrestcgn.de nutzen dieselben Session-/User-Tabellen
- Modboard liest/validiert nur serverseitig
- direkte API-Aufrufe ohne passende Rechte bleiben blockiert

## Gemeinsame Datenbank als Ziel

Forrests Idee, dieselbe Datenbank fuer `forrestcgn.de` und `mods.forrestcgn.de` zu nutzen, ist die bevorzugte Zielrichtung.

Geplante gemeinsame Tabellen/Wahrheit:

```text
dashboard_users
dashboard_identities
dashboard_sessions
```

Heute existiert die Session-/User-Logik bereits im Modboard-Kontext. Spaeter soll die Hauptseite dieselbe Wahrheit nutzen statt eine zweite Login-Insel zu bauen.

## Login-Einstieg

Neu vorbereitet:

```text
GET /api/remote/auth/login/plan
GET /api/remote/auth/login/start
```

`/api/remote/auth/login/start` ist der neutrale Einstieg.

Aktuell:

```text
CENTRAL_AUTH_MODE=local_twitch_fallback
-> Redirect zu /api/remote/auth/twitch/start
```

Spaeter:

```text
CENTRAL_AUTH_MODE=central
-> Redirect zu https://forrestcgn.de/login?returnTo=https://mods.forrestcgn.de/
```

Damit kann das Frontend immer denselben Einstieg nutzen, waehrend das Backend spaeter die Zielquelle umschaltet.

## Config / Env Vorbereitung

Neue optionale Env-Werte:

```text
CENTRAL_AUTH_MODE=local_twitch_fallback
CENTRAL_AUTH_BASE_URL=https://forrestcgn.de
CENTRAL_AUTH_LOGIN_PATH=/login
CENTRAL_AUTH_LOGOUT_PATH=/logout
```

Noch nicht aktiv schalten, solange die zentrale Hauptseiten-Auth nicht fertig ist.

## Aktueller aktiver Zustand nach diesem Step

- Der funktionierende Modboard-Twitch-Login bleibt erhalten.
- Der Login-Button nutzt den neutralen Einstieg `/api/remote/auth/login/start`.
- Die Statusroute zeigt `centralAuth` als vorbereitet.
- Die Routenuebersicht zeigt die neuen Login-Plan-/Login-Start-Routen.
- Keine Remote-Writes.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung.
- Keine DB-Migration.
- Keine Secrets im Repo.

## Spaetere Umsetzung

Naechster eigener Auth-Step, wenn die Hauptseite bereit ist:

```text
RDAP_AUTH3_CENTRAL_SESSION_SWITCH
```

Dann erst:

1. zentrale Login-Seite auf `forrestcgn.de` bauen/aktivieren
2. Session-Cookie-Domain pruefen, wahrscheinlich `.forrestcgn.de`
3. gemeinsame Session-DB finalisieren
4. `mods.forrestcgn.de` auf zentrale Session-Pruefung stellen
5. Logout fuer beide Einstiege sauber definieren
6. Rollen/Rechte serverseitig erzwingen
7. Audit fuer produktive Actions vorbereiten

## Bekannte offene Punkte

- `SESSION_SECRET` und `OAUTH_STATE_SECRET` muessen auf dem Server rotiert werden, weil sie im Chat sichtbar waren.
- Danach `scc-remote-modboard.service` neu starten.
- Danach Browser-Login erneut pruefen.
- Design bleibt eigener Step: `RDAP_DESIGN1_REAL_CGN_BASE`.
