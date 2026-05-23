# Alert-System Umbauplan: Media-Registry statt Doppelkopien

## Ziel

Neue Alert-Medien sollen nicht mehr mehrfach unter unterschiedlichen Ordnern liegen.

Aktuelles Zielbild:

```text
assets/media/alerts/<category>/
```

statt zusätzlicher Kopien unter:

```text
assets/sounds/alerts/
assets/images/alerts/
```

## Vorgehen

### 1. Ist-Analyse

Zu prüfen:

```text
backend/modules/alert_system.js
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
config/alert_system.json
```

Fragestellungen:

```text
- Wo werden Alert-Assets gespeichert?
- Welche DB-Tabellen/Felder enthalten Dateipfade?
- Wo werden Uploads verarbeitet?
- Wo werden Sound-System-Requests gebaut?
- Welche Medienarten gibt es pro Alert: Sound, TTS, Bild, Video, Animation?
```

### 2. MediaId-Modell

Mögliche Varianten:

```text
Variante A:
soundMediaId, imageMediaId, videoMediaId + Legacy-Felder bleiben

Variante B:
bestehende Felder speichern mediaid:<ID>
```

Entscheidung erst nach echter Codeprüfung.

### 3. Playback

Sound-System bevorzugt:

```json
{
  "mediaId": 123,
  "source": "alert_system",
  "category": "alert"
}
```

Fallback:

```json
{
  "file": "alerts/follow.mp3"
}
```

### 4. Dashboard

Alert-Regeln sollen MediaPicker/MediaField nutzen:

```text
moduleKey=alerts
categoryKey=follow/sub/bits/raid/general
```

### 5. Migration

Zunächst nur Diagnose, keine automatische Löschung.

```text
- Doppelte Dateien erkennen
- Legacy-Regeln auflisten
- mögliche mediaId-Zuordnung vorschlagen
```
