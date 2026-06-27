# Aktueller Remote-Modboard-Stand

Stand: 2026-06-27  
Version: `0.2.4`  
Sichtbarer Buildname: `Routes-Status angeglichen`

## Live bestaetigt

`/api/remote/status` meldet:

```text
version: 0.2.4
buildName: Routes-Status angeglichen
moduleBuild: Routes-Status angeglichen
runtimeMode: online
localDashboardProfile.visibleLabel: Onlinemodus
localDashboardProfile.actionsEnabled: false
localDashboardProfile.productiveWritesEnabled: false
localDashboardProfile.agentActionsEnabled: false
```

`/api/remote/routes` meldet:

```text
routeStatusBuild: RDAP123_ROUTES_STATUS_AND_HANDOFF_CLEANUP
localDashboardProfile.routeStatusAligned: true
localLanMode.routeStatusAligned: true
```

## Aktuelle technische Basis

- RDAP119: Remote-Modboard-Oberflaeche wurde modularisiert.
- RDAP120: Modul-Metadaten, Permission-Metadaten und Runtime-Scope wurden eingefuehrt.
- RDAP121: Zentrale Frontend-Sprachdateien wurden eingefuehrt.
- RDAP122: Lokales Dashboard-Profil wurde vorbereitet; Online/Lokal-Modus wird in der UI sichtbar.
- RDAP123: `/api/remote/routes` wurde an den RDAP122-Status angeglichen.

## Laufender Onlinebetrieb

- Webserver-Service laeuft intern auf `127.0.0.1:3010`.
- Public UI laeuft ueber `https://mods.forrestcgn.de/`.
- `runtimeMode` ist im Webserverbetrieb `online`.
- `localDashboardProfile.visibleLabel` ist `Onlinemodus`.
- Local/LAN-Betrieb ist vorbereitet, aber auf dem Webserver nicht aktiv.

## Sicherheitsstand

Weiterhin gesperrt:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.

Frontend-Metadaten sind nur Anzeige und Navigation. Backend-Routen bleiben fuer echte Sicherheit und Berechtigungen massgeblich.
