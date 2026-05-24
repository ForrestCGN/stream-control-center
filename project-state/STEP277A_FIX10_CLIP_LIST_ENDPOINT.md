# STEP277A_FIX10 - Clip-Shoutout Clip List Endpoint

## Ziel

Für Debugging und Kontrolle wurde eine reine Clip-Listen-Route ergänzt, damit die gefundenen passenden Twitch-Clips eines Zielkanals angezeigt werden können, ohne einen Video-Shoutout zu starten.

## Neue Route

```text
GET /api/clip-shoutout/clips?target=<login>
```

Beispiel:

```text
http://127.0.0.1:8080/api/clip-shoutout/clips?target=urlug
```

## Geänderte Dateien

- `backend/modules/clip_shoutout.js`

## Verhalten

- Listet passende Clips aus der bestehenden Suchlogik.
- Gibt Titel, URL, Dauer, Views, Erstellzeit, Thumbnail und weitere Basisdaten zurück.
- Gibt `clipSearch` und `clipSelectionPreview` zur Kontrolle aus.
- Startet keinen Shoutout.
- Queued keinen Sound.
- Lädt keine MP4 herunter.
- Verändert die Recent-Clip-Memory nicht.

## Bewusst nicht geändert

- Direct Playback aus FIX7/FIX8 bleibt unverändert.
- Repeat Guard aus FIX9 bleibt unverändert.
- Sound-System bleibt unverändert.
- Overlay bleibt unverändert.
- TTS bleibt unverändert deaktiviert.
- Keine Funktionalität entfernt.

## Test

```cmd
node --check backend\modules\clip_shoutout.js
```

Danach Backend neu starten und prüfen:

```text
http://127.0.0.1:8080/api/clip-shoutout/status
http://127.0.0.1:8080/api/clip-shoutout/clips?target=urlug
```
