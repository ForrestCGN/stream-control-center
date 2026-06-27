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

Arbeitsweise:

- Erst Doku/Stand lesen.
- Erst Plan nennen, auf `go` warten.
- WINDOWS / POWERSHELL und WEBSERVER / LINUX strikt trennen.
- Keine `jq`-Befehle fuer Windows.
- ZIP ist nur vorbereitet. Lokal gilt erst nach `installstep.cmd` + Neustart/Test. Webserver gilt erst nach `stepdone.cmd` + Deploy-Wrapper + Test.
- Nutzerkommunikation mit Versionsnummern und sprechenden deutschen Namen, keine internen Step-Namen.
- Neue Module/Seiten muessen sich sauber ueber das zentrale Modulmanifest registrieren. Neue Hauptmenues entstehen nur ueber `manifest.modules`, Seiten ordnen sich per `moduleId` zu.

Aktueller Funktionsstand:

- Remote-Modboard UI ist modularisiert.
- Modul-Metadaten, Sprachdateien und Runtime-Scope sind vorbereitet.
- Version `0.2.5 - Lokales Dashboard vorbereitet` ergaenzt den Hauptbereich `Lokales Dashboard` und drei lokale read-only Seiten:
  - Stream-PC Status,
  - LAN / Zugriff,
  - Start / Env.
- Diese lokalen Seiten haben `runtime: local`; im Onlinebetrieb werden sie nur als nicht passender Runtime-Scope markiert/gesperrt.

Geparkte Idee:

- Lokale Aenderungen spaeter kontrolliert online synchronisieren.
- Nicht sofort bauen.
- Zielbild: lokal speichern -> pruefen -> zum Sync vormerken -> freigeben -> online uebernehmen.
- Kein Blind-Auto-Sync fuer kritische Bereiche.

Sicherheitsstand:

- Online/Lokal-Runtime-Profil ist vorbereitet und sichtbar.
- Frontend-Metadaten steuern Anzeige und Navigation, nicht Sicherheit.
- Backend bleibt fuer Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
- Keine neuen produktiven Writes in Version 0.2.5.
- Keine Agent-Actions.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-/Overlay-/Command-Aktionen.
- Keine Shell-, Datei- oder Prozessaktionen.
