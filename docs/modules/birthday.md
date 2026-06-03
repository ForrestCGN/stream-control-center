# Birthday

## Stand

```text
CAN-41.2 / 2026-06-03
```

Diese Datei ersetzt den alten Erst-Doku-Stand aus STEP475 für das Birthday-Modul. Sie basiert auf der Analyse von `backend/modules/birthday.js` und `htdocs/dashboard/modules/birthday.js` aus GitHub/dev.

## Zweck

Das Birthday-Modul ist ein Community-/Runtime-Modul für:

```text
Geburtstagsregistrierung
automatische kleine Chat-Gratulation
optionalen Tagebuch-Eintrag
manuelle Birthday-Show
Birthday-Overlay-State
Birthday-Show-Queue
Birthday-Show-Medien / Intro / Song / Party-Presets
Dashboard-Administration
Textvarianten / Settings
```

Wichtig:

```text
Das Modul ist nicht nur eine Geburtstagsliste.
Es kann Chat senden, Tagebuch schreiben, Sound-/Video-/Song-Bundles starten, Queue-Zustände ändern und Admin-Daten speichern.
```

## Dateien

Backend:

```text
backend/modules/birthday.js
```

Dashboard:

```text
htdocs/dashboard/modules/birthday.js
htdocs/dashboard/modules/birthday.css
```

Overlay:

```text
htdocs/overlays/_overlay-birthday.html
```

Konfiguration / Daten:

```text
config/birthday.json
data/sqlite/app.sqlite
```

Medien:

```text
assets/sounds/birthday/
```

## Modul-Metadaten

Aktueller Analyse-Stand CAN-41.1:

```text
MODULE_NAME = birthday
MODULE_VERSION = 0.6.0
SCHEMA_VERSION = 7
SETTINGS_TABLE = birthday_settings
TEXTS_MODULE = birthday
API_PREFIX = /api/birthday
```

`MODULE_META`:

```text
name = birthday
version = 0.6.0
type = runtime
category = community
legacy = false
routesPrefix = /api/birthday
publishes = birthday.status, birthday.show
consumes = twitch.chat.activity, sound.status
description = Birthday registration, greetings, dashboard administration and manual show runtime
```

## Standard-Konfiguration

Wichtige Bereiche:

```text
enabled
timezone
command
registration
automaticGreeting
diary
chat
show
```

Auffällige Defaults:

```text
timezone = Europe/Berlin
command.trigger = birthday
command.aliases = bday
registration.enabled = true
registration.allowYear = true
registration.storeYear = true
automaticGreeting.enabled = true
automaticGreeting.skipCommandMessages = true
automaticGreeting.oncePerLocalDate = true
automaticGreeting.onlyWhenLive = true
automaticGreeting.writeDiaryEntry = true
diary.systemUsername = Geburtstags-System
chat.directSendEnabled = true
chat.fallbackToStreamerbot = true
show.enabled = true
show.allowedLogins = forrestcgn
show.defaultVideoFile = birthday/birthday_intro_video.webm
show.defaultSongFile = birthday/birthday_default_song.mp3
show.queueBirthdayShows = true
```

## DB / Schema

Schema-Version:

```text
SCHEMA_VERSION = 7
```

Wichtige Tabellen / Datenbereiche:

```text
birthday_users
birthday_show_profiles
birthday_parties
birthday_show_queue
birthday_settings
module_text_variants / helper_texts
```

Schema-Version 7 ergänzt unter anderem:

```text
birthday_show_profiles.avatar_url
birthday_show_profiles.last_resolved_at
birthday_users.avatar_url
birthday_show_queue.target_avatar_url
```

## Textsystem

Das Modul nutzt `helper_texts` mit Varianten.

Textmodul:

```text
TEXTS_MODULE = birthday
```

Textkategorien:

```text
chat
diary
errors
system
```

Wichtige Textkeys:

```text
usage
register_success
register_success_with_year
register_updated
register_updated_with_year
show_own_birthday
show_own_birthday_with_year
show_missing
delete_success
delete_missing
invalid_date
registration_disabled
birthday_greeting_chat
birthday_greeting_chat_with_age
birthday_diary_entry
birthday_diary_entry_with_age
today_none
today_list
already_greeted
command_disabled
party_usage
party_denied
party_started
party_queued
party_duplicate
party_missing_target
party_user_not_found
party_user_not_present
party_disabled
```

## Automatische Gratulation

Die passive Chat-Aktivitätsprüfung kann bei einem registrierten Geburtstag automatisch produktiv werden.

Ablauf in Kurzform:

```text
Chat-Aktivität erkannt
Geburtstag für User geprüft
Streamstatus über Tagebuch geprüft
einmalige Gratulation pro lokalem Datum geprüft
Chattext gerendert
Chatnachricht gesendet
Tagebuch-Eintrag geschrieben
Greeting-Log geschrieben
```

Produktive Ziele:

```text
Chat-Ausgabe via helper_chat_output
POST /api/tagebuch/entry
Greeting-Log / DB
```

Regel:

```text
Automatische Gratulation nicht testweise auslösen.
Keine Chat- oder Tagebuch-Aktion ohne eigenen Go-Schritt.
```

## Manuelle Geburtstagsshow

Die Show-Funktion ist produktiv.

Sie kann:

```text
Birthday-Intro vorbereiten
Birthday-Song vorbereiten
Sound-Bundle bauen
Sound-Bundle an das Sound-System senden
Show-State setzen
Show-Queue schreiben
Timer setzen
Overlay-State liefern
Sound-System überwachen
Show beenden / stoppen
```

Produktive Sound-Ziele:

```text
POST /api/sound/play
POST /api/sound/bundle
POST /api/sound/stop
```

Regel:

```text
Keine Birthday-Show testweise auslösen.
Kein Intro/Video/Song starten.
Keine Sound-Bundle-Aktion ohne eigenen Go-Schritt.
```

## Medien / Upload / Import

Das Modul kann Birthday-Medien übernehmen:

```text
Intro-Video
Default-Song
User-Song
Party-Song
```

Mögliche produktive Operationen:

```text
Datei-Upload
Datei-Kopie aus Media-Registry
Settings aktualisieren
User-Show-Profil aktualisieren
Media-Info auslesen
Runtime neu laden
```

Regel:

```text
Keinen Upload/Import/Recheck ohne eigenen Go-Schritt auslösen.
```

## Backend-Routen

### Eher read-only / Anzeige

```text
GET /api/birthday/status
GET /api/birthday/today
GET /api/birthday/show/state
GET /api/birthday/admin/show/assets
GET /api/birthday/admin/show/parties
GET /api/birthday/admin/resolve-user
GET /api/birthday/admin/users
GET /api/birthday/admin/settings
GET /api/birthday/admin/texts
```

Achtung:

```text
GET /api/birthday/show/queue
```

ist nicht streng read-only, weil die Route intern `cleanupStaleBirthdayShowQueue(...)` ausführt und dadurch stale Queue-Einträge aktualisieren kann.

### Produktiv / schreibend / nicht automatisch auslösen

```text
POST /api/birthday/command
POST /api/birthday/show/queue/clear-stale
POST /api/birthday/show/stop
POST /api/birthday/admin/show/upload
POST /api/birthday/admin/show/import-media
POST /api/birthday/admin/show/recheck
POST /api/birthday/admin/show/parties
POST /api/birthday/admin/show/profile
POST /api/birthday/admin/user
POST /api/birthday/admin/user/delete
POST /api/birthday/admin/settings
POST /api/birthday/admin/texts
POST /api/birthday/reload
```

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/birthday.js
```

Dashboard lädt bei `loadAll()`:

```text
GET /api/birthday/status
GET /api/birthday/admin/users?includeInactive=true
GET /api/birthday/admin/settings
GET /api/birthday/admin/texts
GET /api/birthday/show/state
GET /api/birthday/admin/show/assets
```

Dashboard-API-Konstanten enthalten auch schreibende Routen:

```text
/api/birthday/admin/user
/api/birthday/admin/user/delete
/api/birthday/admin/settings
/api/birthday/admin/texts
/api/birthday/reload
/api/birthday/show/stop
/api/birthday/admin/show/upload
/api/birthday/admin/show/recheck
/api/birthday/admin/show/parties
/api/birthday/admin/show/profile
/api/birthday/admin/show/import-media
```

Produktive Dashboard-Funktionen:

```text
reloadBackend
saveSetting
saveVariant
addVariant
deleteVariant
saveUserFromForm
deleteUser
importBirthdayShowMedia
savePartyFromForm
assignPartyFromForm
Show stoppen
Upload/Import/Recheck
```

Regel:

```text
Dashboard-Buttons für produktive Aktionen nicht automatisch testen.
```

## Read-only geeignete Diagnose für spätere Dashboard-Erweiterungen

Geeignet:

```text
GET /api/birthday/status
GET /api/birthday/today
GET /api/birthday/show/state
GET /api/birthday/admin/users?includeInactive=true
GET /api/birthday/admin/settings
GET /api/birthday/admin/texts
GET /api/birthday/admin/show/assets
GET /api/birthday/admin/show/parties
```

Vorsicht:

```text
GET /api/birthday/show/queue
```

weil intern stale Queue-Cleanup passieren kann.

Nicht nutzen ohne eigenen Go-Schritt:

```text
POST /api/birthday/*
```

## Sicherheitsregeln für zukünftige Arbeiten

Für Birthday gilt:

```text
Keine Geburtstags-Show auslösen.
Kein Intro/Video/Song starten.
Keine Sound-Bundle-Aktion.
Keine Chat-/Discord-Nachricht senden.
Keinen Tagebuch-Eintrag schreiben.
Keine User speichern/löschen.
Keine Settings/Textvarianten speichern.
Keinen Media-Import/Upload/Recheck auslösen.
Kein Reload.
Keine DB-Migration.
Keine Admin-POSTs.
Keine Dashboard-Testbuttons auslösen.
Keine Funktionalität entfernen.
```

## Möglicher Folge-Step

```text
CAN-41.3 - Birthday Dashboard Read-only Diagnose/Sicherheits-Hinweis ergänzen
```

Möglicher Inhalt:

```text
- keine Backend-Änderung
- kein Extra-Tab oder eigener kleiner Diagnosebereich
- produktive Birthday-Show-/Sound-/Upload-/Admin-Aktionen klarer markieren
- GET-only Statusübersicht anzeigen
- GET /show/queue vermeiden oder klar als nicht streng read-only markieren
- keine POSTs
- keine Show
- kein Sound
- kein Chat
- kein Tagebuch
```

## Stand

```text
CAN-41.2: Doku-/Regelstand erstellt.
```
