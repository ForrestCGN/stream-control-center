# Current Status

Stand: 2026-06-29

Aktuell: `0.2.27 - Media Agent Slow Sync Readonly`.

## Technischer Stand

```text
- 0.2.27 ist vorbereitet als read-only Code-Step.
- Media-System bleibt fachliches Modul.
- Media-Statusroute existiert weiterhin: GET /api/remote/media/status.
- Lokal liefert Media read-only Inventar aus htdocs/assets/sounds, htdocs/assets/videos und htdocs/assets/images.
- Online liest Media jetzt aus Webserver-Memory-Cache, sobald der Agent `media_inventory_sync` gesendet hat.
- Agent-WSS bekommt ein eigenes Media-Protokoll: rdap-agent-media-inventory.v1.
- OBS-Inventar-Protokoll bleibt getrennt und wird nicht fuer Media missbraucht.
- Upload/Edit/Delete bleiben false.
- Keine Datei-Inhalte, keine absoluten Pfade, keine DB-Migration, keine Shell-/Prozess-Actions.
- OBS-Modul bleibt bei 0.2.22E geparkt.
```

## Architekturentscheidungen

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

## Standard-Arbeitsweise Zusatz

```text
Wenn GitHub/dev ueber Connector nur unvollstaendig oder abgeschnitten verfuegbar ist:
1. Assistant liefert zuerst ein Sammel-Script fuer die benoetigten Quell-Dateien.
2. Forrest fuehrt es lokal im Repo aus und laedt die Source-ZIP hoch.
3. Assistant baut daraus erst danach den echten Install-Step-ZIP mit echten Repo-Zielpfaden.
4. Source-ZIP ist niemals Install-ZIP.
```

## Sicherheitsgrenzen

```text
keine Media-Uploads
keine Media-Deletes
keine Media-Edits
keine DB-Migration ohne separaten Step
keine Shell-/Datei-/Prozess-Actions
keine absoluten Pfade in API/UI
keine Secrets in Logs/Status/UI/Docs
```
