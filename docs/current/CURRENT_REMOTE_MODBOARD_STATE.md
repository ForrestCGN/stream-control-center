# Aktueller Remote-Modboard-Stand

Stand: 2026-06-27

Aktueller sichtbarer Stand:

```text
Version 0.2.4 - Routes-Status angeglichen
```

Live bestaetigt:

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

Aktueller Funktionsstand:

- Remote-Modboard-Webseite laeuft ueber `mods.forrestcgn.de`.
- Backend-Service laeuft intern auf Port `3010`.
- Twitch-/Session-/Auth-Basis ist vorhanden.
- Admin-User-/Admin-Notes-/Status-/Routes-/Agent-Status-Basis ist vorhanden.
- Admin-Notes Create/Update sind kontrollierte Backend-Writes mit Permission, Confirm-Write, Audit, Lock und Readback.
- Admin-Notes Deactivate/Delete bleiben deaktiviert.
- Online/Lokal-Runtime-Profil ist vorbereitet.
- UI zeigt `Onlinemodus` bzw. spaeter `Lokalmodus`.
- Modul-Runtime-Scope `online`, `local`, `both` ist vorbereitet.
- Modulregistrierungsregeln sind dokumentiert.
- Stream-PC-/LAN-Env- und Startprofil ist dokumentiert.

Weiterhin gesperrt:

- keine DB-Migration ohne separaten Plan,
- keine neuen produktiven Writes ohne separaten Sicherheits-Scope,
- keine Agent-Actions,
- keine OBS-Steuerung,
- keine Sound-Steuerung,
- keine Overlay-Steuerung,
- keine Command-/Channelpoints-Steuerung,
- keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
