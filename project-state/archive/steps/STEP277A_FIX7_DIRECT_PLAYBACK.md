# STEP277A_FIX7 – Clip-Shoutout Direct Playback ohne MP4-Cache

## Ziel
Clip-Shoutouts sollen weiterhin zufällig einen passenden Twitch-Clip wählen, aber die Clip-MP4 nicht mehr dauerhaft unter `htdocs/assets/sounds/clip_shoutout` speichern. Stattdessen wird die Twitch-Playback-URL direkt an das Sound-System und das vorhandene OBS-Overlay übergeben.

## Geänderte Dateien
- `backend/modules/clip_shoutout.js`
- `backend/modules/sound_system.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Technische Änderungen
- `clip_shoutout.js` nutzt standardmäßig `clipPlaybackMode: "direct"`.
- `cacheDownloadedClips` ist im Modul-Default deaktiviert.
- Die bisherige Download-Funktion bleibt als Fallback erhalten, wenn später explizit `clipPlaybackMode: "download"` gesetzt wird.
- Das Clip-Bundle setzt bei Direct Playback `mediaUrl` und `videoUrl` direkt auf die Twitch-Playback-URL.
- `sound_system.js` akzeptiert nun direkte `http/https`-URLs über `mediaUrl`, `videoUrl`, `audioUrl` oder `file`, ohne eine lokale Datei unter `htdocs/assets/sounds` zu verlangen.
- Direkte Video-Items werden weiterhin über das Overlay ausgegeben und nutzen den bestehenden Video-Retry des Overlays.

## Bewusst nicht geändert
- Kein Umbau des Sound-System-Overlays.
- Kein Entfernen von Queue, Bundle-Lock, Prioritäten oder TTS-Funktion.
- Kein Löschen vorhandener alter Cache-Dateien.
- Keine Änderung an Twitch Presence oder Command-System.
- Keine Änderung an Dashboard- oder Datenbankstruktur.

## Tests
- `node --check backend/modules/clip_shoutout.js`
- `node --check backend/modules/sound_system.js`

## Erwartete Statuswerte
`/api/clip-shoutout/status`:

```json
{
  "version": 6,
  "step": "STEP277A_FIX7",
  "config": {
    "clipPlaybackMode": "direct",
    "cacheDownloadedClips": false
  }
}
```

Beim Testlauf sollte im Sound-System-Status das aktuelle Item eine externe `mediaUrl`/`videoUrl` besitzen und `file` leer sein.

## Test-URL
```text
http://127.0.0.1:8080/api/clip-shoutout/run?target=bynexl&userLogin=forrestcgn&displayName=ForrestCGN
```
