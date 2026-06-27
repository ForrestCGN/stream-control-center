# Roadmap - Remote-Modboard

Stand: 2026-06-27  
Aktueller sichtbarer Stand: `0.2.5 - Lokales Dashboard vorbereitet`

## Erledigt

- `0.1.0`: Streaming-PC Verbindung Heartbeat.
- `0.1.1`: Komponentenstatus read-only.
- `0.1.2`: Text-/Anzeige-Cleanup.
- `0.1.3`: OBS-Status read-only per lokaler Port-Erreichbarkeit.
- `0.2.0`: Remote-Modboard-Oberflaeche modularisiert.
- `0.2.1`: Modul-Metadaten, Permission-Metadaten und Runtime-Scope eingefuehrt.
- `0.2.2`: Zentrale Sprachdateien eingefuehrt.
- `0.2.3`: Lokales Dashboard-Profil vorbereitet.
- `0.2.4`: Routes-Status angeglichen.
- `0.2.5`: Lokales Dashboard vorbereitet.

## Aktueller Stand

`0.2.5 - Lokales Dashboard vorbereitet` hat den Hauptbereich `Lokales Dashboard` und drei lokale read-only Seiten vorbereitet:

- Stream-PC Status,
- LAN / Zugriff,
- Start / Env.

Im Webserver-Onlinebetrieb ist `runtimeMode: online`. Die lokalen Seiten sind mit `runtime: local` registriert und werden im Onlinebetrieb als nicht passender Runtime-Scope markiert/gesperrt.

## Naechster sinnvoller technischer Fokus

Lokale read-only Seiten mit echten, sicheren Daten verbessern, ohne Actions zu aktivieren.

Moegliche Teilbereiche:

- sichere Anzeige aus `/api/remote/status`,
- sichere Anzeige aus `/api/remote/agent/status`,
- lokale Start-/Env-Hinweise im Dashboard lesbarer machen,
- LAN-/Zugriffsstatus besser erklaeren,
- keine Schreibfunktionen.

## Geparkte Idee: Kontrollierter Online-Sync

Idee von Forrest am 2026-06-27:

```text
Wenn lokal im Dashboard etwas geaendert wird, koennte es spaeter kontrolliert auf die Internetseite uebertragen werden.
```

Diese Idee ist sinnvoll, wird aber nicht sofort gebaut.

Zielbild fuer spaeter:

```text
lokal aendern -> lokal speichern -> pruefen -> zum Sync vormerken -> Forrest/Admin gibt frei -> Webserver uebernimmt kontrolliert
```

Wichtige Regel:

```text
Lokal aendern ist nicht automatisch oeffentlich live.
```

Fuer einen spaeteren Sync braucht es immer:

- eigenen Sync-Scope,
- Permission,
- Confirm-Write,
- Audit,
- Lock,
- Backup/Rollback,
- Readback,
- Konfliktanzeige,
- klare Trennung nach Aenderungstyp.

Kein Blind-Auto-Sync fuer kritische Bereiche wie Benutzerrechte, Commands, Channelpoints, OBS, Sounds, Dateien, Prozesse oder Shell.

## Weiterhin gesperrt

- OBS steuern.
- Sounds/Overlays ausloesen.
- Commands/Channelpoints ausfuehren.
- Shell/Dateien/Prozesse.
- freie URL-Ausfuehrung.
- DB-Migration ohne separaten Plan.
- produktive Writes ohne Scope/Permission/Confirm/Audit/Lock/Backup/Readback.
