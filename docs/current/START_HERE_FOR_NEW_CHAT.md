# Start hier

Aktueller Stand: Version `0.2.4` - `Routes-Status angeglichen`.

Live bestaetigt am 2026-06-27:

```text
/api/remote/status
version: 0.2.4
buildName: Routes-Status angeglichen
moduleBuild: Routes-Status angeglichen
runtimeMode: online
localDashboardProfile.visibleLabel: Onlinemodus
localDashboardProfile.actionsEnabled: false
localDashboardProfile.productiveWritesEnabled: false
localDashboardProfile.agentActionsEnabled: false

/api/remote/routes
routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP
localDashboardProfile.routeStatusAligned: true
localLanMode.routeStatusAligned: true
```

Arbeitsweise:

- Erst Doku/Stand lesen.
- Erst Plan nennen, auf `go` warten.
- WINDOWS / POWERSHELL und WEBSERVER / LINUX strikt trennen.
- Keine `jq`-Befehle fuer Windows.
- ZIP ist nur vorbereitet. Lokal gilt erst nach `installstep.cmd` + Neustart/Test. Webserver gilt erst nach `stepdone.cmd` + Deploy-Wrapper + Test.
- Nutzerkommunikation mit Versionsnummern und sprechenden Namen, keine internen Step-Namen.
- Neue Module/Seiten muessen sich sauber ueber das Modulmanifest registrieren. Sie duerfen nur dort neue Hauptmenuepunkte anlegen, wo ein fachlich eigener Modulbereich begruendet ist.

Sicherheitsstand:

- Online/Lokal-Runtime-Profil ist vorbereitet und sichtbar.
- Modul-Runtime-Scope `online`, `local`, `both` ist vorbereitet.
- Frontend-Metadaten steuern Anzeige und Navigation, nicht Sicherheit.
- Backend bleibt fuer Rechte, Scope, Confirm-Write, Audit, Lock, Backup/Rollback und Readback massgeblich.
- Keine neuen produktiven Writes in RDAP122/RDAP123.
- Keine Agent-Actions.
- Keine OBS-Steuerung, keine Szenen-/Quellen-/Sound-/Overlay-/Command-Aktionen.
- Keine Shell-, Datei- oder Prozessaktionen.
