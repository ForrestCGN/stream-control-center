# Prompt für neuen Chat - RDAP Auth / Dashboard / Design

Nutze diesen Prompt im neuen Chat:

```text
Wir arbeiten am Projekt stream-control-center / RDAP Remote Modboard.

WICHTIG: Bitte zuerst diese Dateien im GitHub/dev prüfen/lesen:
- docs/current/START_HERE_FOR_NEW_CHAT.md
- docs/current/RDAP_HANDOFF_AUTH_DASHBOARD2_STOCKT.md
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/TODO.md
- project-state/FILES.md
- project-state/CHANGELOG.md

Repo:
ForrestCGN/stream-control-center
Branch:
dev

Lokales Repo:
D:\Git\stream-control-center

Webserver:
mods.forrestcgn.de
Remote-Modboard live:
https://mods.forrestcgn.de/
Service:
scc-remote-modboard.service
Interner Port:
127.0.0.1:3010

Wichtig:
- /opt/stream-control-center ist auf dem Webserver KEIN Git-Repo.
- Deploy läuft über tools/remote-modboard-deploy.sh.
- GitHub/dev ist Source of Truth.
- Keine Annahmen, zuerst echte Dateien prüfen.
- Keine losen Patches, keine Regex-Skripte, keine unfertigen Teilfiles.
- Immer vollständige Dateien im ZIP mit echten Zielpfaden.
- ZIP per installstep.cmd, testen, dann stepdone.cmd.
- Fehlerfall stepundo.cmd.
- Keine Funktionalität entfernen.
- Keine Secrets ins Repo/Frontend/Chat/Logs.

Aktueller Stand:
- Remote-Modboard läuft live auf mods.forrestcgn.de.
- Twitch Login funktioniert live.
- Browser zeigte: Angemeldet als ForrestCGN.
- Auth/OAuth/Sessions sind aktiv.
- Dashboard1/2 wurden begonnen, aber Design ist NICHT unser geplantes CGN-/Vision-UI-/Neon-Galaxy-Design.
- Der vorige Chat stockte beim Design.

Sofort offene Sicherheit:
- SESSION_SECRET und OAUTH_STATE_SECRET wurden im Chat sichtbar und müssen auf dem Server rotiert werden.
- Danach Service neu starten und ggf. erneut einloggen.

Design-Auftrag:
Bitte NICHT frei weiter CSS/HTML erfinden.
Zuerst echte Designbasis im Repo suchen und prüfen:
- dashboard-v2
- vorhandene CGN-/Neon-Galaxy-Dateien
- ggf. _overlay-start-v2-neon-galaxy.html
- vorhandene Dashboard-/Overlay-CSS/HTML-Strukturen

Dann Forrest eine kurze Bestandsaufnahme geben:
- Welche Designbasis existiert?
- Welche Dateien sind relevant?
- Welche ist am nächsten am geplanten Look?
- Empfehlung, wie Dashboard darauf aufgebaut wird.

Erst nach meinem GO einen ZIP-Step bauen.

Login-Zielarchitektur:
Später soll nicht das Modboard allein Login-Insel sein. Ziel ist:
- zentraler Login auf Hauptseite/zentraler Auth-Seite
- Session zentral in DB
- mods.forrestcgn.de übernimmt/prueft die Session
- Dashboard nur für berechtigte Mods/Streamer/Owner
- nicht eingeloggt -> Login-Seite
- eingeloggt aber nicht berechtigt -> Access-Denied
- berechtigt -> Dashboard

Bis eigener Scope:
Keine Remote-Writes, keine Agent-Actions, keine OBS-/Sound-/Overlay-/Command-Steuerung, keine Migration.
```
```
