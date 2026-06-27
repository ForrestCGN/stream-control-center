# NEXT CHAT PROMPT - Remote-Modboard Weiterarbeit

Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wahrheit / Arbeitsbasis

- GitHub/dev und lokales Repo `D:\Git\stream-control-center` sind Wahrheit.
- Nicht gegen GitHub/main arbeiten.
- Erst echte Dateien/Dokus lesen, dann Plan nennen, dann auf `go` warten.
- ZIPs muessen echte Repo-Zielpfade enthalten.
- Forrest legt ZIPs in den Downloads-Ordner.
- Lokal: `installstep.cmd` aus `D:\Git\stream-control-center`.
- Danach Checks und `git status`.
- Nur wenn sauber/nachvollziehbar: `stepdone.cmd`.
- `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
- Webserver-Deploy nur bei Code-/Remote-Modboard-Aenderungen, nicht bei Doku-only.
- Nutzerkommunikation mit Version und deutschem Buildnamen. Interne RDAP-Step-IDs nur fuer ZIP/Commit/Deploy/Handoff verwenden.

## Pflicht-Startdateien wirklich lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Aktueller Stand

Aktueller bestaetigter Stand:

```text
0.2.7 - Lokaler Dashboard-Ersatz geplant
```

Umgesetzt:

- Doku-/Plan-Step fuer lokalen Ersatz des alten Dashboards.
- Lokaler Server `backend/server.js` auf Port `8080` ist Wahrheit fuer die lokale Oberflaeche.
- Neue lokale Zieloberflaeche soll `/dashboard-v2` werden.
- `/dashboard` bleibt zuerst stabil/alt und kann spaeter auf `/dashboard-v2` zeigen oder ersetzt werden.
- Alte Dashboard-Funktionen werden nach und nach uebernommen.
- Kritische lokale Module werden einzeln geprueft: Sounds, Alerts, Texte/Configs, Commands/Channelpoints, OBS, Overlays, lokale Bridges, Uploads/Dateien.
- Start je Modul zuerst read-only: anzeigen ja, ausloesen/aendern erstmal nein.
- Keine Codeaenderung, keine DB-Migration, keine Writes, keine Agent-Actions.

Vorher bestaetigt:

```text
0.2.6 - Online-Modoberflaeche bereinigt
```

- Linke Online-Navigation bereinigt.
- Kein Hauptmenue `Lokales Dashboard` in der Online-Modoberflaeche.
- Kein Hauptmenue `Mein Konto` in der linken Navigation.
- Kein `Routen` unter System.
- Technische Details bleiben unter `Admin -> Doku / Details`.
- Konto-/Rechtefunktionen bleiben oben rechts im User-Panel.

## Was NICHT gemacht werden darf

- Kein GitHub/main.
- Keine Codeaenderung nebenbei.
- Keine DB-Migration ohne expliziten Scope.
- Keine Remote-Modboard-Writes ohne Confirm-Write, Permission, Audit, Lock, Backup, Rollback und Readback.
- Keine Agent-Actions.
- Keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions.
- Keine aktiven Module entfernen.
- Keine Funktionen entfernen.
- `/dashboard` nicht blind ersetzen.

## Naechster sinnvoller Arbeitsfokus

```text
0.2.8 - Dashboard-v2 Shell vorbereitet
```

Vor dem Plan unbedingt lesen:

```text
backend/server.js
backend/core/paths.js
htdocs/dashboard-v2/index.html
htdocs/dashboard/index.html
```

Falls `htdocs/...` im Repo nicht vollstaendig abgebildet ist, mit Forrest klaeren, ob die echten lokalen Dateien aus `D:\Streaming\stramAssets\htdocs\...` hochgeladen/abgeglichen werden muessen.

Moeglicher Inhalt:

- echte bestehende lokale Dashboard-Dateien pruefen,
- minimale neue `/dashboard-v2` Shell im Modboard-Look planen,
- `/dashboard` stabil lassen,
- keine Aktionen/Writes,
- erste Startseite read-only.
