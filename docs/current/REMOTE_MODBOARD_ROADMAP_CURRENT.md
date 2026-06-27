# Roadmap

Stand: 2026-06-27

## Erledigt

- Version 0.1.0: Streaming-PC Verbindung Heartbeat.
- Version 0.1.1: Komponentenstatus read-only.
- Version 0.1.2: Text-/Anzeige-Cleanup.
- Version 0.1.3: OBS-Status read-only per lokaler Port-Erreichbarkeit.
- Version 0.2.0: Modulare UI/Foundation.
- Version 0.2.1: Modul-Metadaten und Rechte.
- Version 0.2.2: Zentrale Sprachdateien.
- Version 0.2.3: Lokales Dashboard-Profil.
- Version 0.2.4: Routes-Status angeglichen.
- RDAP124: Doku-Handoff und Modulregistrierungsregeln.
- RDAP125: Lokales Stream-PC-/LAN-Env- und Startprofil dokumentiert.

## Naechster sinnvoller Schritt

```text
RDAP126_LOCAL_DASHBOARD_MODULE_SHELL_PLAN
```

Ziel:

- lokalen Dashboard-Hauptbereich sauber planen,
- erste lokale read-only Seiten definieren,
- Modulmanifest-Struktur nutzen,
- Runtime-Scope `local`/`both` sauber anwenden,
- keine Actions aktivieren.

## Weiterhin gesperrt

- OBS steuern.
- Sounds/Overlays ausloesen.
- Commands/Channelpoints steuern.
- Agent-Actions ausfuehren.
- Shell/Dateien/Prozesse ausfuehren.
- DB-Migrationen ohne separaten Plan/Backup/Readback.
- Neue produktive Writes ohne separaten Scope, Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.
