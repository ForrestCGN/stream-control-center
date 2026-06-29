# Current Status

Stand: 2026-06-29

Aktuell: `0.2.27B - Media Sync Compact Frame Fix`.

## Technischer Stand

```text
- 0.2.27 ist lokal getestet und auf GitHub/dev gewesen.
- Webserver-Deploy zeigte: Agent verbindet, aber nach Media-Sync fiel WSS wieder offline.
- Ursache im Deploy-Test: `agent_payload_too_large_64bit_frame` nach Media-Sync.
- 0.2.27B reduziert den Media-WSS-Transport auf kompakte Payloads.
- Media-Sync bleibt eigenes Protokoll: rdap-agent-media-inventory.v1.
- Media-System bleibt fachliches Modul.
- Online liest Media aus Webserver-Memory-Cache, sobald Agent-Media-Sync angenommen wurde.
- Lokal liefert Media read-only Inventar aus htdocs/assets/sounds, htdocs/assets/videos und htdocs/assets/images.
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

Server-/API-Checks:
- Standardmaessig kurze `jq '{...}'` Ausgaben verwenden.
- Volles JSON nur bei Fehlerdiagnose oder ausdruecklicher Anforderung.
- Lokal unter Windows PowerShell `Invoke-RestMethod` statt jq verwenden.
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
