# Remote-Modboard Roadmap

Stand: 2026-06-27

## Erledigt

- `0.2.0 - Modulare Oberfläche`: UI-Shell und Modul-Loader vorbereitet.
- `0.2.1 - Modul-Metadaten und Rechte`: Manifest, Permissions und Runtime-Scope vorbereitet.
- `0.2.2 - Zentrale Sprachdateien`: `languages`-Registry mit Deutsch/Englisch vorbereitet.
- `0.2.3 - Lokales Dashboard-Profil`: Online/Lokal-Modus sichtbar gemacht.
- `0.2.4 - Routes-Status angeglichen`: `/status` und `/routes` semantisch angeglichen.
- `0.2.5 - Lokales Dashboard vorbereitet`: Hauptbereich `Lokales Dashboard` plus drei lokale read-only Seiten vorbereitet.

## Naechster sinnvoller Schritt

Lokale Dashboard-Seiten mit echten read-only Daten verfeinern, ohne Actions:

- Stream-PC Status klarer darstellen,
- LAN-/Zugriffsstatus sauber anzeigen,
- Start-/Env-Hinweise ausbauen,
- ggf. lokale Diagnose nur lesend.

## Weiterhin gesperrt

- OBS steuern,
- Sounds/Overlays ausloesen,
- Commands/Channelpoints ausfuehren,
- Shell/Dateien/Prozesse steuern,
- freie URL-Ausfuehrung,
- DB-Migration ohne separaten Scope,
- neue produktive Writes ohne Permission, Confirm-Write, Audit, Lock, Backup/Rollback und Readback.
