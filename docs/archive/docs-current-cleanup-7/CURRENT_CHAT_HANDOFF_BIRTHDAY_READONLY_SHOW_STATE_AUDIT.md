# Current Chat Handoff - Birthday Read-only Show-State Audit

Stand: STEP_BIRTHDAY_READONLY_SHOW_STATE_AUDIT  
Datum: 2026-06-07

## Kontext

Forrest möchte das Birthday-Modul zu einem sauberen Show-System ausbauen:

- Standard-Shows sollen anlegbar, bearbeitbar und abspielbar sein.
- User-Shows sollen pro User anlegbar, bearbeitbar und abspielbar sein.
- In User-Shows soll möglichst viel einstellbar sein: Medien, Texte, Style, Timing, Effekte, Fallbacks.
- Automatische Geburtstagsgrüße bleiben klein und dürfen keine große Show starten.
- Große Birthday-Shows werden nur manuell/gezielt gestartet.

## Bisherige bestätigte Live-Werte

```text
birthday status ok=True
moduleVersion=0.6.1
moduleBuild=diagnostics-standard
schemaOk=True
routeCount=20

diagnostics registry ok=True
registryEntries=15
loadedModules=54
coveredLoadedModules=15
missingLoadedModules=0
registryOnlyEntries=0
```

## Statischer Audit-Fund

Vorhandene Dateien aus Uploads:

```text
backend/modules/birthday.js
dashboard/modules/birthday.js
dashboard/modules/birthday.css
overlays/_overlay-birthday.html
birthday.md
birthday-deep-dive.md
```

Zusätzlich im Dashboard-Upload vorhanden, aber vermutlich Alt-/Zwischenstand:

```text
dashboard/modules/birthday_readonly_diagnostics.js
dashboard/modules/birthday_readonly_diagnostics.css
dashboard/modules/birthday_readonly_safety_ext.js
dashboard/modules/birthday_readonly_safety_ext.css
```

Nicht löschen ohne separaten Cleanup-Step.

## Wichtigster Befund

Backend hat bereits:

```text
birthday_parties
birthday_show_profiles
birthday_show_queue
GET/POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
GET /api/birthday/admin/show/assets
GET /api/birthday/show/state
GET /api/birthday/show/queue
```

Es fehlt aber ein sauberer dedizierter Playback-Endpunkt:

```text
POST /api/birthday/show/start
```

Außerdem ist das User-Show-Profil aktuell noch zu schlank für Forrests Ziel „alles mögliche einstellen“.

## Nächster sinnvoller Schritt

Zuerst Live-Ausgaben einsammeln:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$s.diagnostics.counts | Select-Object users,activeUsers,showProfiles,activeShowProfiles,parties,enabledParties,showQueue,pendingShowQueue,textVariants,routes
$s.diagnostics.state | Select-Object initialized,enabled,registrationEnabled,automaticGreetingEnabled,commandEnabled,showEnabled,showActive,showVisible,showPhase,showQueueLength,lastShowStartedAt,lastShowEndedAt

$a = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/assets"
$a | Select-Object ok,module,step,assetsDir
$a.intro | Select-Object label,kind,relativePath,exists,durationOk,durationMs,durationLabel,error
$a.defaultSong | Select-Object label,kind,relativePath,exists,durationOk,durationMs,durationLabel,error
$a.parties | Select-Object partyKey,title,enabled,isDefault,styleKey,songFile,songDurationMs,songVolume
$a.profiles | Select-Object login,displayNameOverride,active,partyKey,songFile,songDurationMs,songVolume

$p = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
$p.parties | Select-Object partyKey,title,enabled,isDefault,styleKey,songFile,songDurationMs,songVolume
$p.profiles | Select-Object login,displayNameOverride,active,partyKey,songFile,songDurationMs,songVolume

$st = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state"
$st | ConvertTo-Json -Depth 8

$q = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/queue"
$q | ConvertTo-Json -Depth 8
```

Danach planen:

```text
STEP_BIRTHDAY_SHOW_MODEL_SPEC
```

Dabei verbindlich festlegen:

```text
User-Show-Felder
Standard-Show-Felder
Party-Preset-Felder
Fallback-Regeln
DB-Migrationen
API-Routen
Dashboard-Builder
Playback-Rechte/Bestätigung/Audit
```

## Nicht gemacht

```text
kein Backend-Code geändert
kein Dashboard-Code geändert
kein Overlay-Code geändert
keine DB geändert
kein produktiver POST ausgelöst
keine Funktionalität entfernt
```
