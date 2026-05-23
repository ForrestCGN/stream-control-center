# NEXT_CHAT_START_STEP275_ALERT_SYSTEM_MEDIAID.md

## Ziel des neuen Chats

Wir bauen als Nächstes das **Alert-System** so um, dass es wie Birthday/Sound-System die zentrale **Media-Registry** nutzt und keine doppelten Sound-/Medienkopien mehr erzeugt.

## Aktueller Projektstand

Projekt: `stream-control-center`

Repo / Branch:

```text
https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Webroot: D:\Streaming\stramAssets\htdocs
SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Wichtige Arbeitsregel:

```text
Keine Funktionalität entfernen.
Bestehende Pfade/Legacy-Kompatibilität erhalten.
SQLite niemals ersetzen oder überschreiben.
Schemaänderungen nur sanft per CREATE TABLE IF NOT EXISTS / ALTER TABLE wenn Spalte fehlt.
Neue Uploads/Medien sollen über assets/media/<module>/<category>/ laufen.
```

## Aktueller abgeschlossener Stand: MediaRegistry + SoundSystem + Birthday

### STEP274Z

MediaPicker-Filter wurde so angepasst, dass die sichtbare Zusatzkategorie beim Öffnen auf:

```text
Alle Zusatzkategorien
```

steht.

Wichtig:

```text
Der sichtbare Filter ist NICHT das Upload-Ziel.
Das Upload-Ziel bleibt intern über config.categoryKey gesetzt.
```

### STEP274Z_FIX1

Der Hinweistext im MediaPicker wurde entfernt:

```text
Filter, nicht Upload-Ziel
```

### STEP275A

Sound-System kann jetzt Media-Registry-Assets direkt per `mediaId` abspielen.

Beispiel-Test war erfolgreich:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/sound/play" -Method POST -ContentType "application/json" -Body '{"mediaId":1313,"label":"MediaId Test","category":"test","outputTarget":"overlay","target":"stream","volume":85}'
```

Erwartetes Ergebnis:

```text
file     = media/...
audioUrl = /assets/media/...
```

Das bedeutet:

```text
Keine Kopie nach assets/sounds nötig, wenn ein Modul mediaId an das Sound-System übergibt.
```

### STEP275B

Birthday wurde auf Media-Registry-Referenzen umgestellt.

Neues Verhalten bei MediaPicker-Import:

```text
Birthday speichert:
mediaid:<ID>
```

Beispiel:

```text
mediaid:1313
```

Beim Abspielen erzeugt Birthday daraus ein Sound-System-Payload mit:

```json
{
  "mediaId": 1313
}
```

und das Sound-System spielt direkt aus:

```text
D:\Streaming\stramAssets\htdocs\assets\media\...
```

Nicht mehr neu erzeugt wird:

```text
D:\Streaming\stramAssets\htdocs\assets\sounds\birthday\birthday_song_...
```

Legacy bleibt kompatibel:

```text
birthday/birthday_song_user.mp3
```

wird weiterhin unterstützt.

### STEP275B_FIX1

MediaPicker-Upload-Feldreihenfolge wurde angepasst, damit `moduleKey` und `categoryKey` vor `file` in `FormData` gesetzt werden.

Grund:

```text
Multer kann den Zielordner bereits bestimmen, sobald der Datei-Stream verarbeitet wird.
```

### STEP275B_FIX2

Backend-Sicherheitsnetz für Media-Upload wurde ergänzt.

Problem war:

```text
DB:
moduleKey=birthday
categoryKey=user-songs

Datei lag aber physisch:
assets/media/general/general/...
```

Fix:

```text
Nach dem Upload prüft das Backend den echten Zielordner:
assets/media/<moduleKey>/<categoryKey>/

Wenn die Datei falsch liegt, wird sie vor der Registry-Erfassung verschoben.
```

Erwartetes Ziel für neue Birthday-User-Songs:

```text
D:\Streaming\stramAssets\htdocs\assets\media\birthday\user-songs\
```

## Aktuelles gewünschtes Architektur-Prinzip

Neue Module sollen Medien nicht mehr in eigene Legacy-Ordner kopieren, sondern:

```text
1. MediaPicker / Medienverwaltung lädt nach assets/media/<module>/<category>/
2. Modul speichert mediaId oder mediaid:<ID>
3. Sound-System spielt per mediaId direkt aus assets/media/...
4. Legacy-Dateipfade bleiben lesbar und kompatibel
5. Alte doppelte Dateien werden nicht automatisch gelöscht
```

## Nächster Umbau: Alert-System

Ziel:

```text
Alert-System soll keine neuen doppelten Dateien unter assets/sounds/alerts o.ä. erzeugen müssen.
Alert-Sounds, Alert-Videos, Alert-Bilder sollen bevorzugt per Media-Registry/mediaId verwaltet werden.
```

## Geplante Alert-System-Schritte

### STEP276A - Alert-System Ist-Analyse

Zuerst echte Dateien prüfen:

```text
backend/modules/alert_system.js
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
config/alert_system.json
config/messages/alerts.json oder relevante Alert-Textdateien
```

Wichtig: Nur echten GitHub/dev-Stand als Single Source of Truth verwenden.

Zu prüfen:

```text
- Welche Alert-Regeln speichern Sound-/Video-/Bildpfade?
- Welche DB-Tabellen werden verwendet?
- Welche Felder enthalten soundFile, imageFile, videoFile, audioPath, mediaPath usw.?
- Wo werden Uploads verarbeitet?
- Wo wird Sound-System /api/sound/play oder /api/sound/bundle aufgerufen?
- Wo kopiert Alert-System Dateien in assets/sounds/alerts oder assets/images/alerts?
```

### STEP276B - Alert-System Media-Referenzmodell

Zielmodell:

```text
Legacy:
soundFile: "alerts/follow.mp3"

Neu:
soundMediaId: 123
soundFile: "alerts/follow.mp3"  // optionaler Fallback
```

Oder falls bestehende Felder nicht erweitert werden sollen:

```text
soundFile: "mediaid:123"
```

Entscheidung erst nach echter Codeprüfung treffen.

### STEP276C - Alert-Playback per mediaId

Beim Auslösen eines Alerts soll Sound-System bevorzugt bekommen:

```json
{
  "mediaId": 123,
  "category": "alert",
  "source": "alert_system",
  "target": "both",
  "outputTarget": "overlay",
  "volume": 85
}
```

Fallback bleibt:

```json
{
  "file": "alerts/follow.mp3"
}
```

### STEP276D - Dashboard-MediaPicker für Alert-Regeln

Dashboard soll für Alert-Sounds/Bilder/Videos den bestehenden MediaPicker/MediaField nutzen:

```text
moduleKey = alerts
categoryKey = je nach Alert-Typ:
- follow
- sub
- bits
- raid
- general
```

Upload-Ziel:

```text
assets/media/alerts/<category>/
```

Nicht mehr:

```text
assets/sounds/alerts/
assets/images/alerts/
```

für neue Uploads.

### STEP276E - Migration/Diagnose

Keine automatische Löschung.

Zuerst nur Diagnose:

```text
- Welche Alert-Regeln nutzen Legacy-Pfade?
- Welche Dateien sind doppelt vorhanden?
- Welche MediaRegistry-Assets entsprechen diesen Dateien?
- Welche Regeln könnten auf mediaId umgestellt werden?
```

Danach optionaler Migrationsplan als JSON, ähnlich Media-Registry-Migration.

## Tests für neuen Chat

Nach Umbau pro Step testen:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/alerts/status"
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/media/list?moduleKey=alerts&status=active&limit=50"
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/sound/status"
```

Media-ID-Test für Sound-System bleibt:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/sound/play" -Method POST -ContentType "application/json" -Body '{"mediaId":DEINE_ID,"label":"Alert MediaId Test","category":"alert","outputTarget":"overlay","target":"stream","volume":85}'
```

## Wichtig für den Assistant im neuen Chat

Bitte im neuen Chat zuerst:

```text
1. GitHub/dev-Dateien des Alert-Systems prüfen.
2. Keine Annahmen über Feldnamen oder Tabellen treffen.
3. Bestehende Funktionalität nicht entfernen.
4. Media-Registry/mediaId als bevorzugten neuen Weg einbauen.
5. Legacy-Pfade als Fallback erhalten.
6. ZIPs immer mit echten Zielpfaden relativ zu D:\Git\stream-control-center liefern.
7. Nach jedem Step Doku aktualisieren.
```

Startbefehl für neuen Chat:

```text
Wir machen mit STEP276A weiter: Alert-System auf Media-Registry/mediaId umbauen, damit neue Alert-Medien nicht mehr doppelt unter assets/sounds oder assets/images liegen. Bitte zuerst den echten GitHub/dev-Stand von alert_system.js und dem Alert-Dashboard prüfen und dann eine saubere Ist-Analyse + ersten Patchplan liefern. Aktueller Stand steht in NEXT_CHAT_START_STEP275_ALERT_SYSTEM_MEDIAID.md.
```
