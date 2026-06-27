# Start hier

Aktueller vorbereiteter Stand: Version `0.2.10C` - `Dashboard-v2 V13/Modboard-Design wirklich uebernommen`.

WICHTIGER Sichttest-Stand vom 2026-06-27:

```text
0.2.10C ist funktional/read-only vorbereitet, aber optisch noch NICHT final sauber.
Forrest hat bestaetigt: Die obere feste Leiste/Topbar sieht lokal weiterhin nicht gut aus.
Vor fachlicher Weiterarbeit zuerst Topbar/Layout-Fix machen.
```

Geaendert in 0.2.10C:

```text
Lokales Dashboard-v2:
- Design-Wahrheiten angewendet:
  - docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
  - docs/reference/dashboard-v2-design-test-v13/
  - remote-modboard/backend/public/index.html
  - remote-modboard/backend/public/assets/remote-modboard.css
  - remote-modboard/backend/public/assets/remote-modboard.js
- Topbar an V13/Remote-Modboard angenaehert.
- `body.is-scrolled .cgn-topbar` fuer hellen Rand/Glow/Shadow beim Scrollen vorbereitet.
- Sidebar fixed wie Remote-Modboard/V13.
- Navigation auf System / Module / Admin reduziert.
- Uebersicht mit Header, Metric-Karten, Aktivitaeten und Schnellzugriff.
- Stream-PC Status read-only unter System -> Stream-PC vorbereitet.
- nur bestehende lokale GET-Routen: /api/_status, /api/stream-status/current, /api/diag/ws
- keine Refresh-, Test-, Log-, Session- oder Schreibroute
- keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions
- /dashboard bleibt unveraendert
- kein Webserver-Deploy noetig
```

Offener Pflicht-Fix vor 0.2.11:

```text
0.2.10D - Dashboard-v2 Topbar V13 exakt nachziehen
```

## Zentrale Startreihenfolge

Vor neuer Arbeit im Projekt zuerst lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/LOCAL_DASHBOARD_REPLACEMENT_PLAN_CURRENT.md
docs/current/REMOTE_MODBOARD_UI_DESIGN_AND_STRUCTURE.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/PARKED_TODOS.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md
```

Danach nur die thematisch benoetigten Modul-/Current-Dokus lesen.
Nicht alte `NEXT_CHAT_PROMPT_*` Dateien als Wahrheit verwenden, wenn eine neuere passende Current-/Handoff-Datei existiert.

## Arbeitsweise

- Erst Doku/Stand lesen.
- Erst Plan nennen, auf `go` warten.
- WINDOWS / POWERSHELL und WEBSERVER / LINUX strikt trennen.
- Keine `jq`-Befehle fuer Windows.
- ZIP ist nur vorbereitet. Lokal gilt erst nach `installstep.cmd` + Neustart/Test. Webserver gilt erst nach `stepdone.cmd` + Deploy-Wrapper + Test.
- Nutzerkommunikation mit Versionsnummern und sprechenden deutschen Namen, keine internen Step-Namen.
- Neue Module/Seiten muessen sich sauber ueber die bestehende lokale Dashboard-v2 Struktur registrieren.
- `project-state/TODO.md` bleibt kurz und aktiv.
- `project-state/PARKED_TODOS.md` ist die zentrale Langzeit-Merkstelle fuer geparkte Arbeit.

## Aktueller Funktionsstand

- Remote-Modboard UI ist modularisiert.
- Online-Modoberflaeche ist bereinigt.
- Lokale Oberflaeche ist als Ersatz fuer das alte lokale Dashboard geplant:
  - lokaler Server: `backend/server.js`, Port `8080`,
  - neue lokale Zieloberflaeche: `/dashboard-v2`,
  - erste lokale Read-only-Startseite und Navigation sind vorbereitet,
  - Stream-PC Status ist read-only vorbereitet,
  - `/dashboard` bleibt stabil/alt.
- Lokale Topbar ist noch nicht final im Netz-Modboard-Look und muss als naechstes korrigiert werden.

## Sicherheitsstand

- Frontend-Metadaten steuern Anzeige und Navigation, nicht Sicherheit.
- Backend bleibt fuer Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
- Keine neuen produktiven Writes in Version 0.2.10C.
- Keine Agent-Actions.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-/Overlay-/Command-Aktionen.
- Keine Shell-, Datei- oder Prozessaktionen.
