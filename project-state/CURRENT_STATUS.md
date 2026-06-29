# Current Status

Stand: 2026-06-29

Aktuell: `0.2.26 - Runtime Profile / Module / Permission Standard Docs`.

## Technischer Stand

```text
- 0.2.25 ist getestet und auf GitHub/dev.
- Media-System ist im Remote-Modboard sichtbar.
- Media-Statusroute existiert: GET /api/remote/media/status.
- Lokal liefert Media read-only Inventar aus htdocs/assets/sounds, htdocs/assets/videos und htdocs/assets/images.
- Lokal bestaetigt: 332 Medien, truncated=false, upload/edit/delete=false.
- Online bleibt Inventar pending, bis ein separater Agent-WSS-Slow-Sync gebaut wird.
- OBS-Modul ist bei 0.2.22E geparkt.
```

## Architekturentscheidungen 0.2.26

```text
- Eine UI, zwei Runtime-Profile.
- Remote-Modboard UI ist einzige UI-Wahrheit.
- Lokales dashboard-v2 ist dieselbe UI mit runtimeMode=local.
- Online ist dieselbe UI mit runtimeMode=online.
- Module sind fachlich, nicht technisch.
- Sync, Agent, Cache und Runtime-Profil sind Infrastruktur.
- Gleiche Funktionen bleiben im gleichen fachlichen Modul.
- Jede Funktion wird mit Rechte-/User-/Rollenmodell geplant.
```

## Datenklassen

```text
realtimePush: kleine Live-Zustaende.
pullOnDemand: Details/Listen bei Seitenaufruf oder Reload.
slowSync: Inventare/Statusdaten regelmaessig, aber nicht sekundenaktuell.
```

## Sicherheitsgrenzen

```text
keine Media-Uploads
keine Media-Deletes
keine Media-Edits
keine DB-Migration ohne separaten Step
keine Agent-Actions ohne separaten Step
keine Shell-/Datei-/Prozess-Actions
keine absoluten Pfade in API/UI
keine Secrets in Logs/Status/UI/Docs
```
