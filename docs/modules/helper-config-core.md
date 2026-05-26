# Helper-Doku: Config / Core / Routes / State / Queue / Cooldown

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quellen: `helper_config.js`, `helper_core.js`, `helper_routes.js`, `helper_state.js`, `helper_queue.js`, `helper_cooldown.js`

## `helper_config.js`

### Zweck

Zentrale Pfad-, Env- und JSON-Config-Schicht. Neue Module sollen Pfade hierüber auflösen, nicht hart codieren.

### Wichtige Exporte

```text
getEnv
requireEnv
resolveFrom
getRootDir
getWebrootDir
getScriptsDir
getModulesDir
getHelpersDir
getDataDir
getConfigDir
getAssetsDir
getSoundsDir
getTokensDir
getOverlaysDir
getLogsDir
getTempDir
getSecretsDir
resolveFromRoot
resolveFromWebroot
resolveFromScripts
resolveFromModules
resolveFromData
resolveFromConfig
resolveFromAssets
resolveFromSounds
resolveFromTokens
resolveFromOverlays
resolveFromLogs
resolveFromTemp
resolveFromSecrets
ensureBaseDirs
getSummary
readJsonFile
writeJsonFile
resolveConfigFile
loadConfig
boolValue
numberValue
```

### Typische Nutzung

```text
config.resolveFromRoot("data", "sqlite")
config.resolveFromConfig("datei.json")
config.loadConfig("modul.json", defaults, options)
```

## `helper_core.js`

### Zweck

Kleine Basisfunktionen für Dateizugriff, JSON, Parameter und API-Antworten.

### Wichtige Exporte

```text
nowIso
normalizePath
ensureDir
ensureParentDir
fileExists
readText
writeText
safeJsonParse
readJson
writeJson
appendJsonLine
pickFirst
getParam
boolParam
intParam
ok
fail
sendOk
sendFail
asyncRoute
```

## `helper_routes.js`

### Zweck

Einheitliche Route-Registrierung und Legacy-Aliase.

### Wichtige Exporte

```text
registerRoute
registerGet
registerPost
registerPut
registerDelete
legacyPair
normalizeRoutes
normalizeMethod
```

### Typische Nutzung

```text
routes.registerGet(app, ["/api/a", "/api/legacy/a"], handler)
```

## `helper_state.js`

### Zweck

JSON-State-Dateien sicher laden/speichern, inklusive atomarem Write und Backup.

### Wichtige Exporte

```text
loadState
saveState
updateState
createStateStore
listFiles
writeJsonAtomic
backupFile
normalizeState
```

## `helper_queue.js`

### Zweck

Generische Queue-Logik für Module mit Priorität/Sortierung.

### Wichtige Exporte

```text
createItem
createQueue
normalizePriority
sortQueue
nowIso
```

## `helper_cooldown.js`

### Zweck

Cooldown-Prüfung, Zeitformatierung und rollenbasierte Cooldown-Auswahl.

### Wichtige Exporte

```text
checkCooldown
roleRank
resolveRoleCooldown
createCooldownStore
checkRule
formatDuration
toMs
normalizeKey
```

## Datenbank

Diese Helper legen im geprüften Stand keine eigenen Tabellen an.

## Regeln

- Pfade nie neu zusammenfrickeln, wenn `helper_config` passt.
- State-Dateien nie direkt unsicher überschreiben, wenn `helper_state` passt.
- Route-Aliase über `helper_routes` statt doppelter manueller Registrierung.
- Cooldowns zentral halten und nicht pro Modul neu erfinden.
