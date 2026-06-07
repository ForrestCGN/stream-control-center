# Birthday Read-only Show-State Audit

Stand: STEP_BIRTHDAY_READONLY_SHOW_STATE_AUDIT  
Datum: 2026-06-07  
Quelle: Analyse der Uploads `backend.zip`, `dashboard.zip`, `overlays.zip`, `birthday.md`, `birthday-deep-dive.md`.

## Zweck

Dieser STEP ist ein reiner Read-only-Audit-Step. Es wurden keine Backend-, Dashboard-, Overlay-, Config- oder DB-Dateien geändert.

Ziel ist, den vorhandenen Stand des Birthday-Show-Systems sauber zu erfassen, bevor echte Umsetzungsschritte geplant werden.

## Ergebnis kurz

Das Birthday-Modul ist technisch geladen und diagnosefähig. Die vom Live-System gemeldeten Werte waren:

```text
ok=True
module=birthday
moduleVersion=0.6.1
moduleBuild=diagnostics-standard
version=1
initialized=True
schemaOk=True
routeCount=20
```

Die Diagnose-Registry war sauber:

```text
ok=True
registryEntries=15
loadedModules=54
coveredLoadedModules=15
missingLoadedModules=0
registryOnlyEntries=0
```

## Statisch gefundener Dateistand

Relevante Dateien aus den Uploads:

```text
backend/modules/birthday.js
dashboard/modules/birthday.js
dashboard/modules/birthday.css
dashboard/modules/birthday_readonly_diagnostics.js
dashboard/modules/birthday_readonly_diagnostics.css
dashboard/modules/birthday_readonly_safety_ext.js
dashboard/modules/birthday_readonly_safety_ext.css
overlays/_overlay-birthday.html
birthday.md
birthday-deep-dive.md
```

## Backend-Stand

Datei:

```text
backend/modules/birthday.js
```

Erkannte Kerndaten:

```text
MODULE_NAME=birthday
MODULE_VERSION=0.6.1
MODULE_BUILD=diagnostics-standard
SCHEMA_VERSION=7
API_PREFIX=/api/birthday
```

### Vorhandene Show-/Party-/Profil-Struktur

Die vorhandene Backend-Struktur unterscheidet aktuell grob:

```text
birthday_parties
→ globale Party-/Show-Presets

birthday_show_profiles
→ User-spezifische Show-Zuordnung, aktuell eher schlank

birthday_show_queue
→ Queue-/Runtime-Status für gestartete/queued Shows
```

### Vorhandene Party-Felder

Tabelle / Mapping `birthday_parties` enthält aktuell:

```text
partyKey
title
enabled
isDefault
songFile
songDurationMs
songVolume
styleKey
headlineTemplate
sublineTemplate
effects
scenes
notes
createdAt
updatedAt
```

Das ist eine brauchbare Grundlage für Standard-Shows und Party-Presets.

### Vorhandene User-Show-Profil-Felder

Tabelle / Mapping `birthday_show_profiles` enthält aktuell:

```text
login
displayNameOverride
avatarUrl
lastResolvedAt
songFile
songDurationMs
songVolume
partyKey
active
source
createdAt
updatedAt
```

Das reicht für einfache User-Song-/Party-Zuordnung, aber noch nicht für einen vollwertigen User-Show-Builder mit „alles mögliche einstellen“.

### Fehlende User-Show-Profil-Felder für Zielbild

Für das gewünschte Zielbild fehlen auf User-Show-Profil-Ebene voraussichtlich:

```text
profileTitle / showTitle
notes
introVideoRef / introMediaId
mainVideoRef / animationMediaId
backgroundMediaRef
avatarOverrideRef
headlineTemplateOverride
sublineTemplateOverride
chatTextOverride / textVariantKey
diaryTextOverride / textVariantKey
styleKeyOverride
effectsOverrideJson
scenesOverrideJson
videoDurationMs
introDurationMs
fadeInMs
fadeOutMs
startDelayMs
endDelayMs
queuePolicy
playbackMode
fallbackPartyKey
lastPreviewAt / lastPlayedAt
```

Wichtig: Diese Felder sollten nicht blind sofort per DB-Migration gebaut werden. Zuerst muss festgelegt werden, was wirklich Pflicht ist und was optional bleibt.

## API-Stand

Vorhandene relevante Endpunkte laut Backend-Datei:

```text
GET  /api/birthday/status
POST /api/birthday/command
GET  /api/birthday/today
GET  /api/birthday/show/state
GET  /api/birthday/show/queue
POST /api/birthday/show/queue/clear-stale
POST /api/birthday/show/stop
POST /api/birthday/admin/show/upload
POST /api/birthday/admin/show/import-media
GET  /api/birthday/admin/show/assets
POST /api/birthday/admin/show/recheck
GET  /api/birthday/admin/show/parties
POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
GET  /api/birthday/admin/resolve-user
GET  /api/birthday/admin/users
POST /api/birthday/admin/user
POST /api/birthday/admin/user/delete
GET  /api/birthday/admin/settings
POST /api/birthday/admin/settings
GET  /api/birthday/admin/texts
POST /api/birthday/admin/texts
POST /api/birthday/reload
```

### Auffälligkeit: kein dedizierter Start-Endpunkt

Aktuell wurde kein dedizierter Endpunkt gefunden:

```text
POST /api/birthday/show/start
```

Für Dashboard-Playback, Standard-Shows und User-Shows wäre dieser Endpunkt sinnvoller als ein Umweg über `/api/birthday/command`.

### Auffälligkeit: import-media doppelt registriert

In `backend/modules/birthday.js` ist `/api/birthday/admin/show/import-media` statisch doppelt registriert:

```text
POST /api/birthday/admin/show/import-media → importBirthdayMediaAsset(...)
POST /api/birthday/admin/show/import-media → importBirthdayMediaAssetFromRegistry(...)
```

Das ist kein akuter Modulstart-Fehler, aber ein späterer Cleanup-Kandidat. Nicht im Read-only-Step ändern.

## Start-/Playback-Stand

Backend-Funktion:

```text
startBirthdayShow({ targetUser, targetLogin, targetDisplayName, targetAvatarUrl, startedByUser })
```

Statische Bewertung:

- Die Funktion ist klar auf einen Zieluser/Login ausgerichtet.
- `targetLogin` wird für Duplicate-/Queue-Checks verwendet.
- Standard-Shows ohne Zieluser sind damit noch nicht sauber als eigener Modus abgebildet.
- Eine Standard-Show sollte später einen eigenen Modus bekommen, z. B. `mode=standard`.

Empfohlenes Ziel:

```text
POST /api/birthday/show/start

Body für Standard-Show:
{
  "mode": "standard",
  "partyKey": "default_party",
  "startedBy": "dashboard"
}

Body für User-Show:
{
  "mode": "user",
  "targetLogin": "tadesso",
  "partyKey": "default_party",
  "startedBy": "dashboard"
}
```

## Dashboard-Stand

Datei:

```text
dashboard/modules/birthday.js
```

Statisch erkannt:

- Dashboard kennt `/api/birthday/admin/show/upload`
- Dashboard kennt `/api/birthday/admin/show/parties`
- Dashboard kennt `/api/birthday/admin/show/profile`
- Dashboard kennt `/api/birthday/admin/show/import-media`
- Dashboard rendert Show-/Party-/Profil-Bereiche
- Dashboard erlaubt Party speichern
- Dashboard erlaubt User einer Party zuordnen
- Dashboard zeigt Queue/Show-State an

### Dashboard-Lücke

Aktuell ist das Dashboard eher:

```text
Partys verwalten
User einer Party zuordnen
Medien importieren
Status/Queue anzeigen
```

Gewünscht ist aber:

```text
vollwertiger User-Show-Builder
Standard-Show-Builder
Playback/Preview mit Bestätigung
Medien-Auswahl pro Show/User
Timing-/Effekt-/Text-/Style-Konfiguration
```

## Overlay-Stand

Datei:

```text
overlays/_overlay-birthday.html
```

Das Overlay ist vorhanden und muss in einem späteren Step separat gegen den gewünschten Show-State geprüft werden.

Wichtige Prüffrage:

```text
Kann das Overlay eine Standard-Show ohne echten targetLogin sauber anzeigen?
```

Für User-Shows muss geprüft werden:

```text
Avatar
DisplayName
Headline
Subline
Partyphase
Introphase
Video/Song-Timing
Ende/Reset
```

## Zielbild nach Audit

### Standard-Shows

Standard-Shows sollen anlegbar, bearbeitbar und abspielbar sein:

```text
Key
Titel
Aktiv/Inaktiv
Default-Markierung
Style
Song/Medien
Intro/Video
Headline/Subline
Effekte/Szenen
Timing
Notizen
```

### User-Shows

User-Shows sollen pro Twitch-User anlegbar, bearbeitbar und abspielbar sein:

```text
Login
DisplayName Override
Avatar Override
Aktiv/Inaktiv
zugeordnete Standard-/Party-Show
Eigener Song
Eigenes Intro/Video
Eigene Texte
Eigene Effekte/Szenen
Timing Overrides
Notizen
Fallback-Regeln
```

### Playback

Es braucht einen sauberen Playback-Weg:

```text
Standard-Show starten
User-Show starten
Queue anzeigen
Show stoppen
Preview/Test nur mit Bestätigung/Rechteprüfung/Audit-Konzept
```

## Read-only Live-Testbefehle

Diese Befehle verändern keinen Zustand, außer dass `/show/queue` laut Backend intern stale Queue Cleanup auslösen kann. Für komplett harte Read-only-Prüfung zuerst nur Status/Assets/Parties/Users nutzen.

### Status / Diagnostics

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,initialized,schemaOk,routeCount
$s.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$s.diagnostics.counts | Select-Object users,activeUsers,showProfiles,activeShowProfiles,parties,enabledParties,showQueue,pendingShowQueue,textVariants,routes
$s.diagnostics.state | Select-Object initialized,enabled,registrationEnabled,automaticGreetingEnabled,commandEnabled,showEnabled,showActive,showVisible,showPhase,showQueueLength,lastShowStartedAt,lastShowEndedAt
```

### Show Assets

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets"
$a | Select-Object ok,module,step,assetsDir
$a.intro | Select-Object label,kind,relativePath,exists,durationOk,durationMs,durationLabel,error
$a.defaultSong | Select-Object label,kind,relativePath,exists,durationOk,durationMs,durationLabel,error
$a.timingPreview | ConvertTo-Json -Depth 8
$a.parties | Select-Object partyKey,title,enabled,isDefault,styleKey,songFile,songDurationMs,songVolume
$a.profiles | Select-Object login,displayNameOverride,active,partyKey,songFile,songDurationMs,songVolume
```

### Parties / Profile Overview

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
$p.parties | Select-Object partyKey,title,enabled,isDefault,styleKey,songFile,songDurationMs,songVolume
$p.profiles | Select-Object login,displayNameOverride,active,partyKey,songFile,songDurationMs,songVolume
$p.styles | Select-Object key,label
```

### Users

```powershell
$u = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/users"
$u.users | Select-Object login,displayName,birthdayDate,active,showSongFile,showSongDurationMs,showSongVolume,avatarUrl
```

### State / Queue

```powershell
$st = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state"
$st | ConvertTo-Json -Depth 8

$q = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue"
$q | ConvertTo-Json -Depth 8
```

### Registry

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

## Empfohlene nächste STEPs

### STEP 1: Live-Ausgaben aus Read-only-Audit einsammeln

Forrest führt die oben genannten Befehle aus und liefert die kompakten Ausgaben.

### STEP 2: `STEP_BIRTHDAY_SHOW_MODEL_SPEC`

Doku-/Plan-Step, der verbindlich festlegt:

```text
Welche Felder bekommt eine User-Show?
Welche Felder bekommt eine Standard-Show?
Welche Felder bleiben Party-Preset?
Welche Felder sind Pflicht/optional?
Welche Fallbacks gelten?
Welche Felder brauchen DB-Migration?
Welche Felder bleiben JSON/effects/scenes?
```

### STEP 3: Backend-Minifix

Erst danach sinnvoll:

```text
!birthday show @user Command-Reihenfolge reparieren
MODULE_VERSION 0.6.1 -> 0.6.2
```

### STEP 4: Playback-Endpunkt planen/bauen

```text
POST /api/birthday/show/start
mode=standard
mode=user
```

### STEP 5: User-Show-Builder im Dashboard

Erst wenn Backend-Modell stabil ist.

## Nicht geändert

```text
kein Backend-Code
kein Dashboard-Code
kein Overlay-Code
keine Config
keine DB
keine Migration
keine produktiven Flows
keine Dateien gelöscht
keine Diagnose-Extra-Dateien entfernt
```
