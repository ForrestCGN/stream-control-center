# Remote-Modboard Roadmap

Stand: 2026-06-27  
Aktueller Live-Stand: `0.2.4 - Routes-Status angeglichen`

## Erledigt

- Version `0.1.0`: Streaming-PC Verbindung Heartbeat.
- Version `0.1.1`: Komponentenstatus read-only.
- Version `0.1.2`: Text-/Anzeige-Cleanup.
- Version `0.1.3`: OBS-Status read-only per lokaler Port-Erreichbarkeit.
- Version `0.2.0`: Modulare UI/Foundation; `index.html` zur Shell reduziert, Seiten werden als Module nachgeladen.
- Version `0.2.1`: Modul-Metadaten und Rechte; Modulmanifest mit Labels, Beschreibung, Permission und Runtime-Scope.
- Version `0.2.2`: Zentrale Sprachdateien; `RemoteModboardLanguages`, Deutsch Standard, Englisch vorbereitet.
- Version `0.2.3`: Lokales Dashboard-Profil; Online/Lokal-Modus sichtbar, Runtime-Scope in UI vorbereitet.
- Version `0.2.4`: Routes-Status angeglichen; `/status` und `/routes` melden konsistente Local-Dashboard-/Runtime-Daten.

## Naechster sinnvoller Schritt

`RDAP124_LOCAL_STREAM_PC_LAN_START_DOCS_AND_MODULE_REGISTRATION_RULES`

Ziel:

- lokale Start-/Env-Doku fuer Stream-PC/LAN konkretisieren,
- Modulregistrierungsregeln festhalten,
- klare Regel, wie Module Hauptmenues/Seiten anlegen,
- weiterhin keine Agent-Actions und keine produktiven Writes aktivieren.

## Weiterhin gesperrt

- OBS steuern.
- Sounds/Overlays ausloesen.
- Commands/Channelpoints ausloesen oder veraendern.
- Shell-/Datei-/Prozessaktionen.
- DB-Migrationen ohne separaten Plan, Backup und Readback.
- Neue produktive Writes ohne separaten Scope, Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.
