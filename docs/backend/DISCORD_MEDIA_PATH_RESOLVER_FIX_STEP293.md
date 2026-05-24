# STEP293 – Discord Media Path Resolver Fix

Stand: 2026-05-24T14:20:00Z

## Ziel

STEP293 behebt den in STEP292 dokumentierten Discord-Nebenbefund:

```text
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Der Fix betrifft nur die Dateiauflösung in `backend/modules/discord.js`. Die Sound-System-Queue, Alert-Bundles, `activeBundleLock`, SoundBus und Alert-Output-Modi bleiben unverändert.

## Änderung

`discord.js` kennt jetzt zusätzlich zur bestehenden `MEDIA_DIR`-Welt zwei Resolver-Basen:

```text
WEBROOT_DIR = <PROJECT_ROOT>/htdocs
ASSETS_DIR  = <WEBROOT_DIR>/assets
```

Der Discord-Resolver löst weiterhin klassische Keys unter `MEDIA_DIR` auf, kann aber zusätzlich Media-Registry- und Webpfade auflösen:

```text
media/alerts/bits/100-249.mp3 -> htdocs/assets/media/alerts/bits/100-249.mp3
assets/...                    -> htdocs/assets/...
sounds/...                    -> htdocs/assets/sounds/...
```

Damit funktionieren weiterhin klassische Sounds/TTS/VIP-Dateien, während Media-Registry-Alert-Dateien nicht mehr fälschlich unter `htdocs/assets/sounds/media/...` gesucht werden.

## Sicherheits-/Kompatibilitätsgrenze

- Pfade mit `..` werden verworfen.
- Kandidaten werden nur innerhalb ihrer jeweiligen Basisverzeichnisse akzeptiert.
- Keine absolute freie Dateiauflösung.
- Keine API-Route entfernt.
- Keine DB-Migration.
- Keine Änderung an Queue-/Bundle-/Playback-Reihenfolge.

## Statusdiagnose

`/api/discord/status`, `/api/discord/config` und `/api/discord/settings` zeigen zusätzlich:

```text
webrootDir
assetsDir
```

## Tests

Lokal geprüft:

```cmd
node --check backend/modules/discord.js
```

Ergebnis: Syntax OK.

## Empfohlener Live-Test

Nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/discord/status" |
  Select-Object mediaDir, webrootDir, assetsDir
```

Danach V5-Test erneut ausführen:

```cmd
tools\easy\05_SOUND_QUEUE_FULL_ORDER_TRACE_TEST_V5_REAL_MOD.cmd
```

Erwartung:

```text
discordFailed = 0
soundBus.errors = 0
queuedCount = 0
activeBundleLock = leer
Alert-Bundles bleiben in korrekter Reihenfolge
```
