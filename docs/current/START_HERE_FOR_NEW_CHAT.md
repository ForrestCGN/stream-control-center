# START HERE FOR NEW CHAT

Stand: 2026-06-23
Projekt: ForrestCGN / stream-control-center

Diese Datei ist der Einstiegspunkt für neue Chats im Projekt.

## Master-Prompt

Pflichtdatei im Repo:
`docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt`

GitHub/dev Direktlink:
https://raw.githubusercontent.com/ForrestCGN/stream-control-center/dev/docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt

## Pflicht-Reihenfolge im neuen Chat

1. `docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt` lesen.
2. `project-state/CURRENT_STATUS.md` lesen.
3. `project-state/NEXT_STEPS.md` lesen.
4. `project-state/TODO.md` lesen.
5. `project-state/FILES.md` prüfen, wenn Dateien/Pfade unklar sind.
6. Relevante Datei aus `docs/current/*.md` lesen.
7. Relevante Modul-Doku aus `docs/modules/*.md` lesen.
8. Betroffene echte Projektdateien aus `D:\Git\stream-control-center` anfordern, wenn sie nicht vorliegen.

## Harte Arbeitsregeln für diesen Projektchat

- Nicht aus Erinnerung arbeiten.
- Nicht alte Chatstände mit aktuellen Dateien mischen.
- Fehlende Dateien exakt anfordern.
- Keine Patch-/Apply-/Regex-/Append-Scripte.
- Änderungen als vollständige Dateien mit echten Zielpfaden ab Repo-Root liefern.
- Keine Funktionalität entfernen.
- Offene oder aufgeschobene Punkte müssen in `project-state/TODO.md`.
- Bei Security, DB, Dashboard-Struktur und großen Refactors zuerst planen und auf `go` warten.
- Tests/Diagnose gehören getrennt in Tests-/Diagnose-Bereiche, nicht dauerhaft in normale Config-/Modulbereiche.
- Keine Dry-Run-/Debug-/Test-Buttons dauerhaft in normale Bedienoberflächen einbauen.
- Keine DB löschen, ersetzen, überschreiben oder droppen. Produktive DB niemals überschreiben.
- Wenn Backend-Dateien geändert werden: Node-Neustart klar nennen.
- Wenn nur Dashboard/Overlay/Doku ohne Backend geändert wird: keinen Node-Neustart verlangen.
- Ausgaben kurz halten: gezielte Felder, keine großen Dumps, keine endlosen Listen.

## Wichtig: Bedeutung von `go`, `ok`, `ja`, `passt`

Wenn Forrest nach einem Plan `go` schreibt:
- genau den freigegebenen Schritt ausführen
- ZIP bauen, wenn ein ZIP-Step geplant war
- keine Zusatzideen einbauen

Wenn Forrest nach bereits gegebenen Testbefehlen `go`, `ok`, `ja` oder `passt` schreibt:
- dieselben Befehle NICHT wiederholen
- Ergebnis abwarten oder vorhandenes Ergebnis auswerten
- keine Befehls-Dauerschleife starten

Wenn Forrest bestätigt, dass ein Test sichtbar/ok war:
- Ergebnis als bestätigt behandeln
- nicht erneut dieselben Tests verlangen
- nächsten sinnvollen Schritt planen oder Doku/TODO aktualisieren

## ZIP-/Step-Workflow

ZIPs müssen direkt nach folgendem Pfad entpackbar sein:
`D:\Git\stream-control-center`

Pflicht bei ZIP-Lieferung:
1. `installstep.cmd`-Befehl mit exaktem ZIP-Dateinamen und deutscher Beschreibung.
2. Hinweis, ob Node/Backend-Neustart nötig ist.
3. konkrete, kurze Testbefehle oder klare Sichtprüfung.
4. erwartete Status-/Versionswerte, falls relevant.
5. `stepdone.cmd`-Befehl mit konkreter deutscher Beschreibung.
6. `stepundo.cmd`-Hinweis für den Fehlerfall.

Ablauf:
1. ZIP installieren/testdeploy.
2. Node nur neu starten, wenn Backend geändert wurde.
3. Live testen.
4. Erst bei Erfolg `stepdone.cmd`.
5. Bei Fehler `stepundo.cmd`.

Nicht mehr:
ZIP entpacken -> `stepdone.cmd` -> danach testen.

## Primäre Projekt-Truth

- Code-Basis: GitHub/dev + `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- Produktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- Server: `http://127.0.0.1:8080`
- Dashboard: `http://127.0.0.1:8080/dashboard`
- Remote-Modboard geplant: `https://mods.forrestcgn.de`
- Live-State: `twitch_events` / `GET /api/twitch/events/stream-state`
- Modul-Kommunikation: `communication_bus`
- Playback/Queue/Finish: `sound_system`

## RDAP2.WEB1 / aktueller Remote-Webserver-Stand

Aktueller dokumentierter Webserver-Basisstand:

- `docs/current/REMOTE_DASHBOARD_WEB_SERVER_STATUS_2026-06-23.md`

Bestätigt:

- Remote-Modboard-Subdomain ist `mods.forrestcgn.de`.
- Alte Planungs-Subdomain `modboard.forrestcgn.de` ist nicht mehr führend.
- `https://mods.forrestcgn.de` ist per HTTPS erreichbar.
- IPv4 und IPv6 liefern `HTTP/2 200`.
- Let's Encrypt-Zertifikat enthält `mods.forrestcgn.de`.
- nginx-Konfiguration ist gültig.
- `apt update` läuft wieder sauber.
- Node.js/npm/npx sind auf dem Webserver vorhanden:
  - `node v20.19.2`
  - `npm 9.2.0`
  - `npx 9.2.0`

Nicht umgesetzt:

- kein Backend-Code
- kein Dashboard-Code
- kein Frontend-Code
- kein Agent-Code
- keine produktive DB-Änderung
- kein Reverse Proxy auf `127.0.0.1:3000`
- kein systemd-Service für Remote-Node-App
- kein lokaler `stream-control-center`-Node-Neustart nötig

## Nächster sinnvoller Schritt

`RDAP3 / Minimal-Agent-Konzept planen`

RDAP3 soll zunächst nur planen:

- separater Node-Agent-Prozess
- Agent-Config
- WSS-Verbindung
- Auth mit `agentId` + Secret
- Heartbeat
- Basisstatus
- `agent.ping`
- `agent.status.request`
- Request/Result/Audit-Struktur
- Reconnect-/Offline-Verhalten
- keine produktiven Aktionen

Nicht in RDAP3:

- keine Sound-Steuerung
- keine OBS-Steuerung
- keine Overlay-Steuerung
- keine Media-Schreiboperation
- keine Text-/Config-Änderung
- keine Commands/Kanalpunkte
- keine DB-Aktionen
- keine Datei-/Shell-/Prozessaktionen

## Owner-Regeln

- `communication_bus` ist die zentrale Modul-/Overlay-Kommunikation. Keine parallelen Bus-Systeme bauen.
- `twitch_events` ist der zentrale Twitch-Event-Provider und die effektive Live-State-Wahrheit.
- Fachmodule abonnieren Twitch-Events über den Bus, nicht direkt bei Twitch.
- `sound_system` ist Owner für Sound-/Video-Playback, Queue und echte Finish-Events.
- Medienauswahl/Upload immer über vorhandenes Media-System/MediaPicker/MediaField, keine eigene Upload-Insel.

## Aktueller HypeTrain-/Central-Overlay-Stand

Letzter bestätigter Code-Stand:
- HT4.3 Central Event Overlay CGN Base Style ist getestet.
- `htdocs/overlays/central_event_overlay.html`
- Overlay ist technisch verbunden.
- HypeTrain-Channels wurden sichtbar getestet:
  - `hypetrain.overlay.start`
  - `hypetrain.overlay.level_up`
  - `hypetrain.overlay.end`
  - `hypetrain.overlay.record`
- Kein Backend, keine DB, keine OBS-Quelle geändert.
- Overlay bleibt vorerst nicht produktiv/aus.
- Start- und Rekord-Sound laufen über `sound_system`.
- Level-Up- und Ende-Sound bleiben offen, bis passende Medien vorhanden sind.

Doku/TODO:
- Aufgeschobener Punkt: echte HypeTrain-Live-Payloads später bei echtem HypeTrain prüfen und danach finale Template-/Mode-Struktur planen.

## Wenn ein Chat zu lang wird

Wenn der Browser träge wird, Projektstände vermischt werden oder der Assistant anfängt zu raten:

- keinen neuen großen Step mehr anfangen
- aktuellen Stand zusammenfassen
- offene Punkte/TODOs nennen
- benötigte Dateien für den neuen Chat auflisten
- neuen Chat-Prompt/Handoff erstellen
