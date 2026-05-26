# Media-System Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/media.js` aus dem aktuellen Backend-Upload.  
Kategorie: `assets-media`

## Zweck

Zentrale Asset-/Media-Verwaltung mit Kategorien, Scan, Upload, Update, Delete und Picker-Optionen.

## Datei

```text
backend/modules/media.js
```

## erkannte Version / Runtime-Kennung

- Keine feste Versionskennung eindeutig erkannt.

## Exporte / Einstieg

- `ensureCategory`
- `getAsset`
- `init`
- `listAssets`
- `listCategories`
- `mediaOptionFromAsset`
- `resolveAssetForUse`
- `resolveUploadContextFromValues`
- `scanAssets`
- `soundSystemFileFor`
- `statusPayload`
- `upsertAsset`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/media/status` |
| `GET` | `/api/media/list` |
| `GET` | `/api/media/categories` |
| `POST` | `/api/media/category/upsert` |
| `GET` | `/api/media/picker-options` |
| `GET` | `/api/media/resolve` |
| `POST` | `/api/media/scan` |
| `GET` | `/api/media/scan` |
| `POST` | `/api/media/upload` |
| `POST` | `/api/media/update` |
| `POST` | `/api/media/delete` |
| `GET/POST` | `/api/media/scan` |

## erkannte Hauptfunktionen / interne Bereiche

- `assetById`
- `assetByRelativePath`
- `categoryRelativeDir`
- `clean`
- `columnExists`
- `deleteAsset`
- `ensureCategory`
- `ensureColumn`
- `ensureDir`
- `ensureMediaDirs`
- `ensureSchema`
- `extensionAllowedForMeta`
- `extensionAllowedForType`
- `getAsset`
- `getAssetsDir`
- `getUploadDir`
- `inferContextFromRelativePath`
- `inferMimeType`
- `init`
- `isKnownMediaType`
- `isPathInside`
- `listAssets`
- `listCategories`
- `makeUniqueTarget`
- `mediaInfoForFile`
- `mediaOptionFromAsset`
- `normalizeCategoryKey`
- `normalizeModuleKey`
- `normalizeSlashes`
- `nowIso`
- `param`
- `readBody`
- `relativePathFromWebPath`
- `resolveAssetForUse`
- `resolveUploadContext`
- `resolveUploadContextFromValues`
- `resolveUploadType`
- `rowToAsset`
- `rowToCategory`
- `safeJsonDecode`
- `safeJsonEncode`
- `sanitizeFileName`
- `scanAssets`
- `scanFile`
- `seedMediaCategories`
- `slugKey`
- `soundSystemFileFor`
- `statusPayload`
- `typeForExt`
- `typeForFile`
- `typeMeta`
- `updateAsset`
- `uploadDirRel`
- `uploadDirRelForContext`
- `uploadOne`

## erkannte Datenbanktabellen

- `media_assets`
- `media_categories`

## erkannte Config-/Runtime-Dateien

- Keine konkreten Config-/Runtime-Dateien eindeutig erkannt.

## interne Abhängigkeiten

- `../core/database`
- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_media`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Keine direkten Asset-Sonderordner erfinden, wenn media_assets/media_categories genutzt werden können.
- Keine Funktionalität entfernen.
- Keine Secrets, Tokens, `.env`, Datenbanken oder Backups committen.
- Dashboard-Zugriff immer über Backend-APIs, nicht direkt auf SQLite oder Dateien.
- Bei unklarer Live-Abweichung zuerst echte Datei aus `D:\Git\stream-control-center` oder `D:\Streaming\stramAssets` prüfen.

## Sinnvolle Tests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,ok,enabled,moduleVersion,lastError
```

Zusätzlich je nach Modul die oben gelisteten Status-/Routes-/Integration-Check-Routen im Browser oder per `Invoke-RestMethod` prüfen.

## Offene Punkte

- Modul bei nächster Facharbeit gegen Live-Repo prüfen, nicht nur gegen ZIP-Stand.
- Fehlende Versionskennung nach Möglichkeit später ergänzen, ohne Runtime-Verhalten zu ändern.
- Wenn Dashboard-Anbindung existiert: Dashboard-Dateien separat dokumentieren und mit API-Routen abgleichen.
