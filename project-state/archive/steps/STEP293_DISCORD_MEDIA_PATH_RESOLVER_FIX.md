# STEP293 – Discord Media Path Resolver Fix

Stand: 2026-05-24T14:20:00Z

## Ergebnis

Discord kann jetzt neben klassischen `htdocs/assets/sounds/...`-Dateien auch Media-Registry-Alert-Dateien unter `htdocs/assets/media/...` auflösen.

## Betroffene Datei

- `backend/modules/discord.js`

## Geändert

- Neue Resolver-Basen `WEBROOT_DIR` und `ASSETS_DIR`.
- `resolveMediaFile()` erkennt:
  - klassische Keys relativ zu `MEDIA_DIR`,
  - `media/...` relativ zu `ASSETS_DIR`,
  - `assets/...` relativ zu `WEBROOT_DIR`,
  - `sounds/...` relativ zu `ASSETS_DIR`.
- Status-/Config-Ausgaben zeigen zusätzlich `webrootDir` und `assetsDir`.

## Nicht geändert

- keine Sound-Queue-Logik
- keine Bundle-/`activeBundleLock`-Logik
- keine SoundBus-Logik
- keine Alert-Output-Modi
- keine Caller-Module
- keine DB-Migration

## Prüfung

```cmd
node --check backend/modules/discord.js
```

Ergebnis: OK.

## Nächster Test

V5 Real Queue/Bundle Regression erneut ausführen und prüfen, ob `discordFailed` jetzt 0 bleibt.
