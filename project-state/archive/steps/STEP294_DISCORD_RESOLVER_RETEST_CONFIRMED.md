# STEP294 – Discord Resolver Retest bestätigt

Datum: 2026-05-24T14:30:00Z
Status: bestätigt
Typ: Test-/Dokumentationsstand, keine Codeänderung

## Ausgangslage

STEP291 hatte die SoundBus V5 Regression grundsätzlich bestanden, aber einen Nebenbefund gezeigt:

```text
discordFailed = 3
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

STEP292 hat diesen Befund als Discord-Pfadresolver-Problem eingegrenzt. STEP293 hat den Resolver in `backend/modules/discord.js` erweitert, damit Media-Registry-Dateien wie `media/alerts/...` korrekt unter `htdocs/assets/media/...` gefunden werden.

## Retest nach STEP293

Nach Deploy/Backend-Restart wurde `/api/discord/status` geprüft. Die neuen Pfadbasen waren sichtbar:

```text
mediaDir   = D:\Streaming\stramAssets\htdocs\assets\sounds
webrootDir = D:\Streaming\stramAssets\htdocs
assetsDir  = D:\Streaming\stramAssets\htdocs\assets
```

Danach wurde der V5 Real Queue/Bundle Regression Test erneut ausgeführt. Wegen sehr großer Trace-Dateien wurde kein vollständiges Trace-Archiv erneut hochgeladen; stattdessen wurde der relevante kompakte `/api/sound/status`-Auszug geprüft.

## Bestätigter Status nach Retest

```text
queuedCount       = 0
currentBundle     = leer
activeBundleLock  = leer
started           = 12
queued            = 10
stopped           = 1
cleared           = 1
failed            = 0
deviceStarted     = 12
deviceFailed      = 0
discordStarted    = 10
discordFailed     = 0
bundlesQueued     = 3
bundleItemsQueued = 6
levelCorrected    = 2
levelCorrectionSkipped = 10
levelCorrectionFailed  = 0
soundBus.enabled  = true
communicationBusAvailable = true
```

## Bewertung

STEP293 ist damit bestätigt.

- Discord findet `media/alerts/...` jetzt korrekt.
- `discordFailed` ist im Retest auf `0`.
- SoundBus bleibt aktiv.
- SoundBus/Queue/Bundle-Verhalten bleibt stabil.
- `queuedCount` ist am Ende `0`.
- `currentBundle` und `activeBundleLock` sind am Ende leer.
- `failed = 0`, `deviceFailed = 0`, `levelCorrectionFailed = 0`.
- Drei Alert-Bundles wurden erneut verarbeitet (`bundlesQueued = 3`, `bundleItemsQueued = 6`).

## Nicht geändert

- Keine Codeänderung in STEP294.
- Keine Sound-Queue-Logik geändert.
- Keine Bundle-/`activeBundleLock`-Logik geändert.
- Keine SoundBus-Logik geändert.
- Keine Alert-Output-Modi geändert.
- Keine Caller-Module geändert.
- Keine DB-Migration.
- Keine Funktionalität entfernt.

## Konsequenz

Der Discord Media Path Resolver Fix aus STEP293 kann als bestätigt gelten. Der nächste sinnvolle Block ist die kontrollierte Entscheidung, ob `soundBus.enabled = true` als stabiler Stand aktiv bleiben soll und welche Module als nächstes busfähig gemacht bzw. beobachtbar gemacht werden.
