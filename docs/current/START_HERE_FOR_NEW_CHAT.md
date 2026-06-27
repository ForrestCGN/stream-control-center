# Start hier

Aktueller vorbereiteter Stand: Version `0.2.10B` - `Dashboard-v2 Modboard-Layout exakt angeglichen`.

Geaendert in 0.2.10B:

```text
Lokales Dashboard-v2:
- Layout/Navigation deutlich naeher an echte Online-Modboard-Struktur angeglichen
- Topbar mit Breadcrumb, deaktivierter Suche, Quick-Chips und lokalem Userbereich
- Sidebar wie Online-Modboard: fixed, gleiche Gruppenlogik, gleiche aktive Link-Markierung, Footer
- Stream-PC Status read-only unter System -> Stream-PC vorbereitet
- nur bestehende lokale GET-Routen: /api/_status, /api/stream-status/current, /api/diag/ws
- keine Refresh-, Test-, Log-, Session- oder Schreibroute
- keine OBS-/Sound-/Overlay-/Command-/Shell-/Datei-/Prozess-Actions
- /dashboard bleibt unveraendert
- kein Webserver-Deploy noetig
```

## Zentrale Startreihenfolge

Vor neuer Arbeit im Projekt zuerst lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
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

## Sicherheitsstand

- Frontend-Metadaten steuern Anzeige und Navigation, nicht Sicherheit.
- Backend bleibt fuer Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
- Keine neuen produktiven Writes in Version 0.2.10B.
- Keine Agent-Actions.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-/Overlay-/Command-Aktionen.
- Keine Shell-, Datei- oder Prozessaktionen.
