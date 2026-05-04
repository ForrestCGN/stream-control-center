# STEP042.1 - TTS Generated Webroot Path Fix

Stand: 2026-05-04

## Zweck

Kleiner Fix nach STEP042: Die per `/api/tts/prepare-alert` erzeugte Datei wurde in `D:\Streaming\stramAssets\assets\tts\generated\` abgelegt, waehrend die URL `/assets/tts/generated/...` vom Webserver auf `D:\Streaming\stramAssets\htdocs\assets\tts\generated\` zeigt.

Dadurch konnte die TTS-Datei zwar erzeugt werden, war aber nicht ueber die Overlay-/Browser-URL erreichbar.

## Ursache

In `backend/modules/tts_system.js` wurden die Basisverzeichnisse noch aus einer alten Struktur abgeleitet:

- `MODULE_DIR = backend/modules`
- `SCRIPTS_DIR = backend`
- `HTDOCS_DIR = stramAssets`
- `ROOT_DIR = D:\Streaming`

Korrekt fuer das aktuelle Repo ist:

- `MODULE_DIR = backend/modules`
- `BACKEND_DIR = backend`
- `ROOT_DIR = stramAssets`
- `HTDOCS_DIR = stramAssets/htdocs`

## Geaenderte Datei

- `backend/modules/tts_system.js`

## Aenderung

Der Pfadblock am Anfang von `init(ctx)` wurde korrigiert:

```js
const MODULE_DIR = __dirname;
const BACKEND_DIR = path.resolve(MODULE_DIR, "..");
const ROOT_DIR = path.resolve(BACKEND_DIR, "..");
const HTDOCS_DIR = path.join(ROOT_DIR, "htdocs");
const CONFIG_DIR = path.join(ROOT_DIR, "config");
const GENERATED_DIR = path.join(HTDOCS_DIR, "assets", "tts", "generated");
```

## Erwartung nach Deploy/Backend-Neustart

`/api/tts/prepare-alert` erzeugt neue Dateien unter:

```text
D:\Streaming\stramAssets\htdocs\assets\tts\generated\
```

Die zurueckgegebene URL ist erreichbar unter:

```text
http://127.0.0.1:8080/assets/tts/generated/<datei>.wav
```

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/prepare-alert?text=Hallo%20Forrest%2C%20das%20ist%20ein%20Alert%20TTS%20Test&user=ForrestCGN" | ConvertTo-Json -Depth 10
```

Danach `audioFile` pruefen und die `audioUrl` per `Invoke-WebRequest` abrufen.

## Hinweis

Die versehentlich erzeugten Testdateien unter `D:\Streaming\stramAssets\assets\tts\generated\` koennen spaeter manuell geloescht werden, wenn dort keine anderen produktiven Dateien liegen.
