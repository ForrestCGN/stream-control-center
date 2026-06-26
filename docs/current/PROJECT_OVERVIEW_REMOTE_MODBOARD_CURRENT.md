# Projektübersicht – Remote-Modboard / RDAP

Stand: RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD  
Datum: 2026-06-26  
Projekt: `stream-control-center` / `remote-modboard` / RDAP  
Branch: `dev`

## Zweck

Diese Datei fasst den aktuellen Stand des Remote-Modboards zusammen. Sie ersetzt nicht die historischen Step-Dateien, soll aber ab jetzt als zentrale Orientierung fuer neue Chats, Planung und Umsetzung dienen.

Das Remote-Modboard ist die geplante externe Moderations- und Admin-Oberflaeche fuer ForrestCGN. Es soll langfristig ausgewaehlten Personen erlauben, bestimmte Stream-, Community- und Verwaltungsfunktionen kontrolliert zu bedienen, ohne dass diese Personen direkten Zugriff auf den Stream-PC, OBS, Server-Shells, Datenbanken oder freie Systembefehle erhalten.

## Warum es gebaut wird

Das vorhandene lokale `stream-control-center` steuert bereits viele Bereiche rund um Stream, Overlays, Sounds, Events und Dashboard. Das Remote-Modboard soll darauf aufbauen, aber sauber getrennt und sicherer werden:

```text
- Webserver als oeffentliche, abgesicherte Zentrale.
- Login und Rechtepruefung serverseitig.
- Remote-Modboard als Webseite fuer berechtigte User.
- Spaeter Stream-PC-Agent als aktiver Client zum Webserver.
- Keine Portfreigabe am Stream-PC.
- Keine freien Shell-/Datei-/Prozessbefehle aus der Weboberflaeche.
```

## Grundarchitektur

```text
Browser / berechtigter User
        |
        v
https://mods.forrestcgn.de/
        |
        v
Remote-Modboard Backend auf Webserver
        |
        | spaeter WSS/EventBus/Allowlist
        v
Stream-PC-Agent im lokalen Netz
        |
        v
OBS / Sounds / Overlays / Stream-Funktionen
```

Aktuell ist vor allem die Webserver-Seite mit Auth-, Rechte-, Admin-User- und Admin-Notes-Basis aufgebaut. Agent-/OBS-/Sound-/Overlay-Steuerung ist weiterhin bewusst nicht produktiv freigegeben.

## Wichtige Orte

```text
GitHub Repo:
https://github.com/ForrestCGN/stream-control-center

Branch:
dev

Lokales Repo:
D:\Git\stream-control-center

Lokales Live-System:
D:\Streaming\stramAssets

Remote-Modboard Webserver-Service:
/opt/stream-control-center/remote-modboard

Webserver-Deploy-Arbeitsordner:
/opt/stream-control-center/_deploy_tmp

Remote-Modboard Public URL:
https://mods.forrestcgn.de/

Interner Service:
http://127.0.0.1:3010/

Systemd-Service:
scc-remote-modboard.service
```

Wichtige Regel: `/opt/stream-control-center` auf dem Webserver ist kein Git-Repository. Deploys laufen aus einem frischen GitHub/dev-Clone unter `_deploy_tmp` ueber `tools/remote-modboard-deploy.sh`.

## Aktueller Funktionsstand

Bestaetigt:

```text
- Remote-Modboard-Webseite laeuft ueber mods.forrestcgn.de.
- Backend-Service laeuft intern auf Port 3010.
- Twitch-/Session-/Auth-Basis ist aufgebaut.
- Dashboard-Zugriff wird serverseitig geprueft.
- Routen-/Status-/Auth-/Permission-Diagnostik existiert.
- Admin-User-Modell kann gelesen werden.
- Admin-User-Detail ist read-only sichtbar.
- Admin-Notes sind sichtbar.
- Admin-Notes Create funktioniert.
- Admin-Notes Update/Speichern funktioniert.
- Admin-Notes Delete/Deactivate sind weiterhin nicht sichtbar bzw. deaktiviert.
- Admin-Notes wurden optisch enttechnisiert.
- Technische Statusbloecke wurden aus der normalen Admin-Notes-Hauptansicht entfernt.
```

## Admin-Notes aktueller Backend-Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Create/Update bleiben nur unter serverseitigen Bedingungen moeglich. Das Backend entscheidet weiter ueber Session, Permission, Confirm-Write, Audit, Lock und Readback.

## Bewusst deaktiviert / verboten

```text
- Admin-Note Deactivate
- physisches Delete
- Community-Read fuer Admin-Notizen
- Permission-Verwaltung in der UI
- Rollen-/Gruppen-Schreibverwaltung
- Session-Revocation in der UI
- Agent-Steuerung
- OBS-Steuerung
- Sound-Steuerung
- Overlay-Steuerung
- Command-/Channelpoints-Steuerung
- freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
- DB-Migrationen ohne separaten Plan, Backup und Readback
- neue produktive Writes ohne separaten Sicherheits-Scope
```

## Sicherheitsmodell

Produktive Writes duerfen nicht nebenbei entstehen. Fuer jeden echten Write gelten mindestens diese Bausteine:

```text
- klare Route / klarer Scope
- serverseitige Permission
- confirmWrite
- Audit-Log
- Lock / Konfliktschutz
- Backup-/Rollback-Konzept, wenn Daten betroffen sind
- Readback-Pruefung
- Browser-/API-Test
```

Frontend-Buttons alleine gelten nicht als Sicherheit. Das Backend muss jede produktive Aktion begrenzen und pruefen.

## UI-/Design-Zielbild

Das Remote-Modboard soll wie ein modernes CGN-Dashboard wirken:

```text
- dunkler CGN-/Neon-Look
- violett/blau/cyan Glow
- klare Seitenheader
- linke Hauptnavigation
- kompakte Status-Chips
- keine technischen Diagnosebloecke in Normalansichten
- Admin-Seiten mit menschlichen Labels statt technischen IDs
- Diagnose spaeter nur einklappbar oder separat
```

Fuer Admin-Notes gilt aktuell als Zielaufbau:

```text
1. Seitenheader:
   Admin-Notizen
   Rechts: Notizen neu laden | Neue Notiz

2. Zieluser-Auswahl:
   Kompakt, sichtbar, setzt Kontext fuer alles darunter.

3. Notizen-Liste:
   Notizen fuer <DisplayName>
   <n> Notizen geladen
   Menschlich lesbare Notizkarten.

4. Create:
   Nur nach Klick auf Neue Notiz sichtbar.

5. Diagnose/Technik:
   Nicht in Hauptansicht, spaeter hoechstens einklappbar.

6. Router/Header:
   Sichtbares Panel, Haupt-Header und aktive Navigation muessen zusammenpassen.
```

## Aktuelle offene Befunde

```text
1. Admin-Notes Router/Header-State:
   Wenn Admin-Notizen sichtbar sind, kann der Haupt-Header noch User-Detail anzeigen.
   Das muss fachlich ueber Router-/Page-State geloest werden, nicht per CSS-Tarnung.

2. Admin-Notes Zieluser-/Count-Kontext:
   Zieluser-Wechsel muss eindeutig die Notizen fuer genau diesen User laden/anzeigen.
   Count, Titel und Liste duerfen keine alten User-Daten stehen lassen.

3. Doku-Struktur:
   Sehr viele kleine RDAP-/Step-/Handoff-Dateien existieren historisch.
   Diese Datei plus UI-/Roadmap-Datei dienen ab jetzt als aktuelle Orientierung.
```

## Naechste technische Steps

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
- Header, aktive Navigation und sichtbares Admin-Notes-Panel synchronisieren.
- Wenn Admin-Notizen sichtbar sind, darf User-Detail nicht aktiv wirken.
- Frontend-only.

RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
- Zieluser-Wechsel laedt/zeigt eindeutig Notizen fuer diesen User.
- Count/Hinweis bezieht sich eindeutig auf den ausgewaehlten User.
- Keine alten User-Daten in Titel, Count oder Liste stehen lassen.
```

## Doku-Regel ab diesem Stand

Neue Chats sollen nicht mehr blind dutzende historische RDAP-Dateien lesen muessen. Aktuelle Startbasis:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/PROJECT_OVERVIEW_REMOTE_MODBOARD_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
docs/current/REMOTE_MODBOARD_ROADMAP_CURRENT.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_DOCS_CONSOLIDATION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Historische Dateien bleiben als Nachweis erhalten, sind aber nicht automatisch aktueller als diese zentrale Zusammenfassung.
