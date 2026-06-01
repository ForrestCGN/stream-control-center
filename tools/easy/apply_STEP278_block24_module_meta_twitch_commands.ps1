# STEP278 Block 24 - MODULE_META fuer Twitch-/Command-Schiene
# Ausfuehren im Repo-Root: D:\Git\stream-control-center
# Aendert nur Loader-Metadaten/Exports. Keine Runtime-Logik.

$ErrorActionPreference = "Stop"

function Assert-RepoRoot {
  if (-not (Test-Path "backend\modules")) {
    throw "Bitte dieses Script im Repo-Root ausfuehren, z.B. D:\Git\stream-control-center"
  }
}

function Update-TextFile {
  param(
    [Parameter(Mandatory=$true)][string]$Path,
    [Parameter(Mandatory=$true)][string]$Old,
    [Parameter(Mandatory=$true)][string]$New,
    [Parameter(Mandatory=$true)][string]$Marker
  )

  if (-not (Test-Path $Path)) {
    throw "Datei nicht gefunden: $Path"
  }

  $text = Get-Content -Raw -Encoding UTF8 $Path

  if ($text.Contains($Marker)) {
    Write-Host "[skip] $Path Marker bereits vorhanden: $Marker"
    return
  }

  if (-not $text.Contains($Old)) {
    throw "Suchblock nicht gefunden in $Path. Abbruch, damit nichts blind kaputt gepatcht wird."
  }

  $updated = $text.Replace($Old, $New)
  Set-Content -Path $Path -Value $updated -Encoding UTF8 -NoNewline
  Write-Host "[ok] $Path aktualisiert"
}

Assert-RepoRoot

# 1) twitch.js
Update-TextFile `
  -Path "backend\modules\twitch.js" `
  -Marker "const MODULE_META = {" `
  -Old @'
const database = require('../core/database');

const sharedApi = {
'@ `
  -New @'
const database = require('../core/database');

const MODULE_NAME = 'twitch';
const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'integration',
  description: 'Twitch OAuth, Helix API und EventSub WebSocket Kernmodul.',
  routesPrefix: ['/api/twitch', '/twitch', '/eventsub'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

const sharedApi = {
'@

# 2) twitch_presence.js
Update-TextFile `
  -Path "backend\modules\twitch_presence.js" `
  -Marker "const MODULE_META = {" `
  -Old @'
const commands = require('./commands');

let twitchPresenceService = null;
'@ `
  -New @'
const commands = require('./commands');

const MODULE_NAME = 'twitch_presence';
const MODULE_VERSION = '0.1.0';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  type: 'runtime',
  category: 'integration',
  description: 'Twitch IRC Presence, Chat-Ausgabe und Chat-Command-Eingang.',
  routesPrefix: ['/api/twitch/presence', '/twitch/presence'],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};

module.exports.MODULE_META = MODULE_META;
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;

let twitchPresenceService = null;
'@

# 3) commands.js
Update-TextFile `
  -Path "backend\modules\commands.js" `
  -Marker "category: 'commands'" `
  -Old @'
module.exports.MODULE_META = { name: MODULE_NAME, version: MODULE_VERSION, build: MODULE_BUILD };
module.exports.handleChatMessage = handleChatMessage;
'@ `
  -New @'
module.exports.MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: MODULE_BUILD,
  type: 'runtime',
  category: 'commands',
  description: 'Zentrales Chat-Command-System mit Registry, Katalog, Test, Execute und Logs.',
  routesPrefix: [API_PREFIX],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};
module.exports.MODULE_VERSION = MODULE_VERSION;
module.exports.version = MODULE_VERSION;
module.exports.handleChatMessage = handleChatMessage;
'@

# 4) commands_media.js
Update-TextFile `
  -Path "backend\modules\commands_media.js" `
  -Marker "const MODULE_META = {" `
  -Old @'
const MODULE_NAME = 'commands_media';
const STEP = 'STEP274J';
const API_PREFIX = '/api/commands';
'@ `
  -New @'
const MODULE_NAME = 'commands_media';
const MODULE_VERSION = '0.1.0';
const STEP = 'STEP274J';
const MODULE_META = {
  name: MODULE_NAME,
  version: MODULE_VERSION,
  build: STEP,
  type: 'runtime',
  category: 'commands',
  description: 'Command-Media-Bruecke fuer Media-Auswahl und Sound-System-Praxischeck.',
  routesPrefix: [API_PREFIX],
  bus: {
    registered: false,
    heartbeat: false,
    emits: [],
    listens: []
  },
  legacy: false
};
const API_PREFIX = '/api/commands';
'@

Update-TextFile `
  -Path "backend\modules\commands_media.js" `
  -Marker "MODULE_META, MODULE_VERSION" `
  -Old @'
module.exports = { init, statusPayload, listMediaOptions, checkStoredMediaCommand };
'@ `
  -New @'
module.exports = { MODULE_META, MODULE_VERSION, version: MODULE_VERSION, init, statusPayload, listMediaOptions, checkStoredMediaCommand };
'@

Write-Host ""
Write-Host "STEP278 Block 24 Patch angewendet."
Write-Host "Bitte danach pruefen:"
Write-Host "  node --check backend\modules\twitch.js"
Write-Host "  node --check backend\modules\twitch_presence.js"
Write-Host "  node --check backend\modules\commands.js"
Write-Host "  node --check backend\modules\commands_media.js"
