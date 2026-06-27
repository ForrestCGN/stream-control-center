# Roadmap

Stand: 2026-06-27

## Erledigt

- Version `0.1.0`: Streaming-PC Verbindung Heartbeat.
- Version `0.1.1`: Komponentenstatus read-only.
- Version `0.1.2`: Text-/Anzeige-Cleanup.
- Version `0.1.3`: OBS-Status read-only per lokaler Port-Erreichbarkeit.
- Version `0.2.0`: Modulare UI/Foundation.
- Version `0.2.1`: Modul-Metadaten und Rechte.
- Version `0.2.2`: Zentrale Sprachdateien.
- Version `0.2.3`: Lokales Dashboard-Profil.
- Version `0.2.4`: Routes-Status angeglichen.
- RDAP124: Doku-Handoff und Modulregistrierungsregeln.
- RDAP125: Lokales Stream-PC-/LAN-Env- und Startprofil.
- RDAP126: Lokales Dashboard Modul-Shell-Plan.

## Naechster sinnvoller Schritt

```text
RDAP127_LOCAL_DASHBOARD_MODULE_SHELL_IMPLEMENTATION_READONLY
```

Ziel:

- `local-dashboard` im Modulmanifest technisch anlegen,
- drei lokale read-only Seiten vorbereiten:
  - Stream-PC Status,
  - LAN-Verbindungen,
  - Lokalbetrieb,
- Sprachkeys in `languages/de.js` und `languages/en.js` ergaenzen,
- minimale Page-Scripte unter `assets/modules/local-dashboard/` erstellen,
- Runtime-Scope `local` verwenden,
- keine Actions aktivieren.

## Weiterhin gesperrt

- OBS steuern.
- Sounds/Overlays ausloesen.
- Commands/Channelpoints ausfuehren.
- Shell/Dateien/Prozesse steuern.
- DB-Migrationen ohne separaten Scope.
- Produktive Writes ohne Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.
