# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.26 - Runtime Profile / Module / Permission Standard Docs`.

## Verbindlich

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI.
Keine Online-Sonder-UI.
```

## Harte Architekturregeln

```text
1. Eine UI, zwei Runtime-Profile.
2. Module sind fachlich, nicht technisch.
3. Sync ist Infrastruktur, kein eigenes Navigationsmodul.
4. Agent ist Infrastruktur, kein Fachmodul.
5. Gleiche Funktionen bleiben im gleichen fachlichen Modul.
6. Jede Funktion wird von Anfang an mit User-/Rollen-/Permission-Modell gedacht.
7. Keine Write-Funktion ohne serverseitige Permission-Pruefung, Confirm, Audit und Readback.
```

## Single UI / Dual Runtime Profile

```text
Remote-Modboard UI
├─ runtimeMode: local
│  ├─ gleiche UI
│  ├─ Daten direkt vom lokalen SCC/Agent
│  ├─ echte lokale Dateien/OBS/Sounds verfuegbar
│  └─ Cloud nicht erforderlich
│
└─ runtimeMode: online
   ├─ gleiche UI
   ├─ Daten vom Webserver
   ├─ Stream-PC-Daten nur ueber Agent-Sync/Memory-Cache
   └─ zentrale Auth/Rechte/Audit-Schicht
```

## Datenklassen

```text
A = realtimePush
    Kleine Live-Zustaende, sofort sichtbar, memory-only.

B = pullOnDemand
    Details/Listen nur bei Seitenaufruf, Filter, Reload oder Detailansicht.

C = slowSync
    Regelmaessig uebertragene Inventare/Statusdaten, nicht sekundengenau.
```

## Bestaetigter aktueller Fokus

```text
OBS ist bei 0.2.22E geparkt.
0.2.24: Media-Foundation read-only.
0.2.25: lokales Media-Inventar read-only aktiv.
0.2.26: Architekturstandard fuer Runtime-Profile, fachliche Module, Sync-Klassen und Rechte dokumentiert.
```

## Lokal/Online

```text
Lokal: echte Media-Dateien liegen auf dem Stream-PC unter htdocs/assets/*.
Online: Webserver hat keinen direkten Zugriff auf lokale Stream-PC-Dateien.
Online-Media-Inventar braucht spaeter Agent-WSS-Slow-Sync, memory-only.
```

## Sicherheitsgrenzen

```text
Keine Media-Uploads.
Keine Media-Deletes.
Keine Media-Edits.
Keine DB-Migration ohne separaten Step.
Keine Agent-Actions ohne separaten Step.
Keine Shell-/Datei-/Prozess-Actions.
Keine absoluten Pfade in API/UI.
Keine Secrets in Logs/Status/UI/Docs.
```

## Wichtigste Doku

```text
docs/current/RDAP_RUNTIME_PROFILE_MODULE_PERMISSION_STANDARD.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY
```

Nur bauen, nachdem GitHub/dev gelesen wurde und ein Plan bestaetigt ist.
