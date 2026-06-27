# Current Status

Stand: 2026-06-27

Aktueller bestaetigter Stand:

```text
v0.2.5 - Lokales Dashboard vorbereitet
```

Live bestaetigt:

```text
/api/remote/status -> version 0.2.5, buildName Lokales Dashboard vorbereitet, runtimeMode online
localDashboardProfile.localDashboardMenuPrepared -> true
localDashboardProfile.localDashboardReadOnlyPagesPrepared -> true
localDashboardProfile.localDashboardPages -> stream-pc-status, lan-access, start-env
localDashboardProfile.actionsEnabled -> false
localDashboardProfile.productiveWritesEnabled -> false
localDashboardProfile.agentActionsEnabled -> false
```

Abgeschlossen:

- RDAP119: Remote-Modboard-Oberflaeche modularisiert.
- RDAP120: Modul-Metadaten, Permission-Metadaten und Runtime-Scope eingefuehrt.
- RDAP121: zentrale Frontend-Sprachdateien eingefuehrt.
- RDAP122: lokales Dashboard-Profil vorbereitet und Runtime-Modus in UI sichtbar gemacht.
- RDAP123: Routenuebersicht an RDAP122-Status angeglichen.
- RDAP124: Doku-Handoff und Modulregistrierungsregeln ergaenzt.
- RDAP125: lokales Stream-PC-/LAN-Env- und Startprofil dokumentiert.
- RDAP126: lokales Dashboard als Modulbereich geplant.
- RDAP127 / Version 0.2.5: Lokales Dashboard vorbereitet; Hauptbereich und drei lokale read-only Seiten live bestaetigt.
- RDAP128: Handoff fuer neuen Chat, Live-Bestaetigung und Sync-Idee dokumentiert.

Geparkte Idee:

- lokale Aenderungen spaeter kontrolliert online synchronisieren,
- nicht sofort bauen,
- kein Blind-Auto-Sync fuer kritische Bereiche.

Nicht geaendert:

- keine DB-Migration,
- keine neuen produktiven Writes,
- keine Agent-Actions,
- keine OBS-/Sound-/Overlay-/Command-Steuerung,
- keine Shell-/Datei-/Prozess-Actions.
