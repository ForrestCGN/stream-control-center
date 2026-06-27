# Start hier

Aktueller Stand: Version `0.2.5` - `Lokales Dashboard vorbereitet`.

Live bestaetigt am 2026-06-27:

```text
/api/remote/status
version: 0.2.5
buildName: Lokales Dashboard vorbereitet
moduleBuild: Lokales Dashboard vorbereitet
runtimeMode: online
localDashboardProfile.visibleLabel: Onlinemodus
localDashboardProfile.localDashboardMenuPrepared: true
localDashboardProfile.localDashboardReadOnlyPagesPrepared: true
localDashboardProfile.localDashboardPages: stream-pc-status, lan-access, start-env
localDashboardProfile.actionsEnabled: false
localDashboardProfile.productiveWritesEnabled: false
localDashboardProfile.agentActionsEnabled: false
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
- Neue Module/Seiten muessen sich sauber ueber das zentrale Modulmanifest registrieren. Neue Hauptmenues entstehen nur ueber `manifest.modules`, Seiten ordnen sich per `moduleId` zu.
- `project-state/TODO.md` bleibt kurz und aktiv.
- `project-state/PARKED_TODOS.md` ist die zentrale Langzeit-Merkstelle fuer geparkte Arbeit.

## Aktueller Funktionsstand

- Remote-Modboard UI ist modularisiert.
- Modul-Metadaten, Sprachdateien und Runtime-Scope sind vorbereitet.
- Version `0.2.5 - Lokales Dashboard vorbereitet` ergaenzt den Hauptbereich `Lokales Dashboard` und drei lokale read-only Seiten:
  - Stream-PC Status,
  - LAN / Zugriff,
  - Start / Env.
- Diese lokalen Seiten haben `runtime: local`; im Onlinebetrieb werden sie nur als nicht passender Runtime-Scope markiert/gesperrt.

## Geparkte Idee

- Lokale Aenderungen spaeter kontrolliert online synchronisieren.
- Nicht sofort bauen.
- Zielbild: lokal speichern -> pruefen -> zum Sync vormerken -> freigeben -> online uebernehmen.
- Kein Blind-Auto-Sync fuer kritische Bereiche.
- Details/Langzeitpunkte stehen in `project-state/PARKED_TODOS.md`.

## Sicherheitsstand

- Online/Lokal-Runtime-Profil ist vorbereitet und sichtbar.
- Frontend-Metadaten steuern Anzeige und Navigation, nicht Sicherheit.
- Backend bleibt fuer Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
- Keine neuen produktiven Writes in Version 0.2.5.
- Keine Agent-Actions.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-/Overlay-/Command-Aktionen.
- Keine Shell-, Datei- oder Prozessaktionen.
