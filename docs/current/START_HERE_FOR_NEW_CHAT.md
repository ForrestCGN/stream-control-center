# Start hier

Aktueller Stand: Version `0.2.7` - `Lokaler Dashboard-Ersatz geplant`.

Geaendert in 0.2.7:

```text
Doku-/Plan-Step fuer den lokalen Ersatz des alten Dashboards:
- lokaler Server auf Port 8080 ist Wahrheit fuer die lokale Oberflaeche
- neue lokale Oberflaeche soll unter /dashboard-v2 entstehen
- /dashboard bleibt zuerst stabil/alt und kann spaeter auf /dashboard-v2 zeigen oder ersetzt werden
- alte Dashboard-Funktionen werden nach und nach uebernommen
- kritische lokale Module werden einzeln geprueft
- Start je Modul zuerst read-only, bis Rechte/Sicherheit bewusst freigegeben sind
- keine Codeaenderung, kein Webserver-Deploy noetig
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
- Neue Module/Seiten muessen sich sauber ueber das zentrale Modulmanifest registrieren.
- `project-state/TODO.md` bleibt kurz und aktiv.
- `project-state/PARKED_TODOS.md` ist die zentrale Langzeit-Merkstelle fuer geparkte Arbeit.

## Aktueller Funktionsstand

- Remote-Modboard UI ist modularisiert.
- Modul-Metadaten, Sprachdateien und Runtime-Scope sind vorbereitet.
- Online-Modoberflaeche ist bereinigt:
  - System zeigt `Uebersicht` und `Diagnose`.
  - Module zeigt `Moduluebersicht`.
  - Admin zeigt `Benutzerverwaltung`, `Admin-Notizen`, `Verbindungen`, `Doku / Details` sowie bestehende Admin-Unterseiten.
  - Konto-/Rechtefunktionen bleiben im User-Panel oben rechts.
- Lokale Oberflaeche ist als Ersatz fuer das alte lokale Dashboard geplant:
  - lokaler Server: `backend/server.js`, Port `8080`,
  - neue lokale Zieloberflaeche: `/dashboard-v2`,
  - `/dashboard` bleibt zuerst stabil/alt.

## Geparkte Idee

- Lokale Aenderungen spaeter kontrolliert online synchronisieren.
- Nicht sofort bauen.
- Zielbild: lokal speichern -> pruefen -> zum Sync vormerken -> freigeben -> online uebernehmen.
- Kein Blind-Auto-Sync fuer kritische Bereiche.
- Details/Langzeitpunkte stehen in `project-state/PARKED_TODOS.md`.

## Sicherheitsstand

- Frontend-Metadaten steuern Anzeige und Navigation, nicht Sicherheit.
- Backend bleibt fuer Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
- Keine neuen produktiven Writes in Version 0.2.7.
- Keine Agent-Actions.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-/Overlay-/Command-Aktionen.
- Keine Shell-, Datei- oder Prozessaktionen.
