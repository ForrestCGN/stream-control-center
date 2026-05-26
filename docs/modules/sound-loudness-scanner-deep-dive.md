# Sound Loudness Scanner Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/sound_loudness_scanner.js` aus dem aktuellen Backend-Upload.  
Kategorie: `sound-runtime`

## Zweck

Großes Analyse-/Normalisierungsmodul für Sound-Lautheit, Referenzwerte, Promotions und Korrekturvorschläge.

## Datei

```text
backend/modules/sound_loudness_scanner.js
```

## erkannte Version / Runtime-Kennung

- `0.1.12-step272i5-scan-startedat-fix`

## Exporte / Einstieg

- `module.exports = ...`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/sound/loudness/status` |
| `GET` | `/api/sound/loudness/config` |
| `POST` | `/api/sound/loudness/config` |
| `POST` | `/api/sound/loudness/config/adopt-reference-target` |
| `GET` | `/api/sound/loudness/config/apply-defaults/preview` |
| `GET` | `/api/sound/loudness/config/mass-volume-preview` |
| `POST` | `/api/sound/loudness/config/mass-volume-apply/alerts-missing` |
| `GET` | `/api/sound/loudness/boost/preview` |
| `GET` | `/api/sound/loudness/usage/file` |
| `POST` | `/api/sound/loudness/boost/create-one` |
| `GET` | `/api/sound/loudness/promote/history` |
| `POST` | `/api/sound/loudness/promote/one` |
| `POST` | `/api/sound/loudness/promote/rollback-one` |
| `POST` | `/api/sound/loudness/config/apply-defaults` |
| `GET` | `/api/sound/loudness/results` |
| `GET` | `/api/sound/loudness/file` |
| `GET` | `/api/sound/loudness/reference` |
| `GET` | `/api/sound/loudness/reference/test.wav` |
| `GET` | `/api/sound/loudness/correction/settings` |
| `POST` | `/api/sound/loudness/correction/settings` |
| `GET` | `/api/sound/loudness/correction/preview` |
| `POST` | `/api/sound/loudness/scan` |
| `GET` | `/api/sound/loudness/routes` |
| `GET` | `/api/sound/loudness/file?file=relative/path.mp3` |
| `GET` | `/api/sound/loudness/usage/file?file=relative/path.mp3` |
| `GET/POST` | `/api/sound/loudness/reference/test-file` |

## erkannte Hauptfunktionen / interne Bereiche

- `addSoundUsage`
- `analyzeFile`
- `analyzeFileAsync`
- `appendExcludedPathFilter`
- `applyMissingAlertRuleVolumes`
- `applyModuleSetting`
- `buildActivePromotionIndex`
- `buildAudioCodecArgs`
- `buildAutoReference`
- `buildBoostCopyInfo`
- `buildBoostCopyPreview`
- `buildCorrectionPreview`
- `buildDistribution`
- `buildExistingVolumePreview`
- `buildFallbackDefaultsWithDefaultVolume`
- `buildLegacyTargetsWithDefaultVolume`
- `buildLoudnessVolumeNeeds`
- `buildOutputWithDefaultVolume`
- `buildPromotionHistory`
- `buildSoundUsageIndex`
- `buildUploadDefaultApplyResult`
- `calculateBoostGain`
- `calculateMaxSafeBoostGain`
- `clampNumber`
- `cloneJson`
- `clonePlain`
- `createBoostCopyForFile`
- `createReferenceTestWavBuffer`
- `emptyProgress`
- `ensureReferenceTestSoundFile`
- `ensureSchema`
- `ensureSoundSettingsTable`
- `errorMessage`
- `extractLoudnormJson`
- `findCurrentScanIdFallback`
- `findFfmpeg`
- `findSoundFiles`
- `gainToVolume`
- `getActivePromotionForFile`
- `getBoostCopyCandidates`
- `getBoostTargetSettings`
- `getCorrectionSettings`
- `getJsonSetting`
- `getLevelConfig`
- `getNormalizationSettings`
- `getSoundsBaseDir`
- `hasColumn`
- `init`
- `isExcludedTtsPath`
- `makeScanId`
- `median`
- `normalizeAllowedExtensions`
- `normalizeExcludedPathSegments`
- `normalizeOrder`
- `normalizeRelativePath`

## erkannte Datenbanktabellen

- `alert_rules`
- `sound_loudness_files`
- `sound_loudness_promotions`
- `sound_loudness_scans`
- `sound_loudness_settings`
- `sound_settings`

## erkannte Config-/Runtime-Dateien

- `/assets/sounds/generated/reference_test.wav`
- `generated/reference_test.wav`
- `reference_test.wav`

## interne Abhängigkeiten

- `../core/database`
- `../core/paths`
- `./helpers/helper_media`
- `./helpers/helper_settings`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Potentiell datei- und ffmpeg-intensiv; Änderungen immer mit Testdateien und Rollback prüfen.
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
