# START HERE FOR NEW CHAT - stream-control-center / RDAP Remote Modboard

Stand: RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT
Datum: 2026-06-24

## Wichtigster Kontext

Der vorherige Chat stockte beim Dashboard2-Design. Nicht weiter frei am Design herumprobieren.

## Aktueller bestätigter Stand

Remote-Modboard/Auth:

- `https://mods.forrestcgn.de/` live
- Twitch Login funktioniert
- Browser zeigte `Angemeldet als ForrestCGN`
- Auth/OAuth/Sessions aktiv
- Dashboard2 begonnen, aber Design noch nicht passend

## Sofort beachten

Die zuerst erzeugten `SESSION_SECRET` und `OAUTH_STATE_SECRET` standen im Chat. Diese müssen rotiert werden:

```bash
openssl rand -base64 48
openssl rand -base64 48
nano /etc/stream-control-center/remote-modboard.env
systemctl restart scc-remote-modboard.service
```

## Arbeitsweise

- GitHub/dev ist Source of Truth.
- Zuerst echte Dateien aus GitHub/dev prüfen.
- Keine Annahmen über vorhandene Dateien.
- Keine losen Patches oder Regex-Skripte.
- Vollständige Dateien in ZIPs mit echten Zielpfaden liefern.
- ZIPs per `installstep.cmd` einspielen.
- Nach Test erst `stepdone.cmd`.
- Fehlerfall `stepundo.cmd`.
- Keine Funktionalität entfernen.
- Keine Secrets ins Repo/Frontend/Chat/Logs.

## Geplante Login-Zielarchitektur

Später soll der Login zentral über die Hauptseite laufen:

```text
forrestcgn.de / zentrale Login-Seite
-> zentrale Session in DB
-> mods.forrestcgn.de übernimmt/prueft Session
-> Modboard zeigt Dashboard nur bei passender Rolle/Recht
```

Das aktuelle Twitch-Login im Modboard ist eine Übergangslösung.

## Gewünschter Flow

```text
Nicht eingeloggt
-> Login-Seite

Eingeloggt, aber nicht berechtigt
-> Access-Denied + Ausloggen/zurück

Eingeloggt + berechtigt
-> Dashboard
```

## Nächster sinnvoller Schritt

Nicht `Dashboard3` frei bauen, sondern zuerst:

```text
RDAP_DESIGN1_REAL_CGN_BASE
```

Aufgabe:

1. Repo/GitHub/dev nach echter Designbasis prüfen
2. `dashboard-v2` und vorhandene CGN-/Neon-Galaxy-Dateien suchen
3. relevante Design-/CSS-/HTML-Dateien anzeigen/zusammenfassen
4. Forrest entscheiden lassen, welche Basis gilt
5. erst danach Dashboard optisch umbauen

Danach:

```text
RDAP_AUTH2_CENTRAL_LOGIN_READY
```

Ziel:

- zentralen Hauptseiten-Login vorbereiten
- Return-To/Redirect-Flow planen
- Cookie-/Session-Domain-Konzept planen
- Modboard übernimmt zentrale Session

## Weiterhin verboten

- keine Remote-Writes
- keine Agent-Actions
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Command-Steuerung
- keine Migration ohne Backup/Rollback/Go
