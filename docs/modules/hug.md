# Hug-System

## Zweck

Das Modul `backend/modules/hug.js` stellt das Hug-/Rehug-System bereit.

Es verarbeitet Hug-, Rehug-, HugAll-, Stats-, Top-, on/off- und Reload-Commands, verwaltet Hug-User, User-Stats, Pair-Stats, Pending-Rehugs, gekoppelte Hug/Rehug-Textpaare, Systemantworten, Toplisten-Texte und Output-Konfiguration.

Das Modul ist produktiv relevant, weil es DB-Statistiken verändern und je nach Output-Modus echte Chat-Ausgaben erzeugen kann.

## Modul-Dateien

```text
backend/modules/hug.js
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
```

## Modul-Metadaten

Aktueller Analyse-Stand CAN-37.1:

```text
MODULE_NAME = hug
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 3
category = community
routesPrefix = /api/hug, /hug, /api/dashboard/community/hug
```

Das Modul exportiert `MODULE_META` mit:

```text
name: hug
version: 0.1.0
type: runtime
category: community
legacy: false
routesPrefix:
- /api/hug
- /hug
- /api/dashboard/community/hug
description: Hug/Rehug runtime, dashboard endpoints and chat command handling
```

Der Bus-Block ist aktuell anders aufgebaut als bei einigen anderen Modulen:

```text
bus.publishes = hug.status, hug.command
bus.consumes = twitch.chat.command
```

Aktuell sind in `MODULE_META` keine Felder `registered` oder `heartbeat` dokumentiert.

## Besondere Risiko-Einstufung

Das Hug-System ist produktiv besonders sensibel.

Es kann:

```text
- echte Hug/Rehug-Aktionen ausführen
- User-Stats verändern
- Pair-Stats verändern
- Pending-Rehugs erzeugen oder löschen
- User-Hug-Status on/off ändern
- Chat-Ausgaben erzeugen
- Textpaare speichern/löschen
- HugAll-Texte speichern/löschen
- Response-Texte speichern/löschen
- TopTitle-Texte speichern/löschen
- Output-Modus ändern
- JSON-Seed-Import/Reload anstoßen
```

Deshalb gilt:

```text
Keine automatische Diagnose darf Command-/Action-/Reload-/Admin-POST-Routen auslösen.
```

## Runtime-Regel

```text
Keinen Hug auslösen ohne ausdrücklichen Go-Schritt.
Keinen Rehug auslösen ohne ausdrücklichen Go-Schritt.
Kein HugAll auslösen ohne ausdrücklichen Go-Schritt.
Kein on/off auslösen ohne ausdrücklichen Go-Schritt.
Keine Stats-/Top-Chat-Ausgabe auslösen ohne ausdrücklichen Go-Schritt.
Kein Reload ohne ausdrücklichen Go-Schritt.
Kein Text-Store-Reload ohne ausdrücklichen Go-Schritt.
Keine Output-Mode-Änderung ohne ausdrücklichen Go-Schritt.
Keine Textpaare speichern/löschen ohne ausdrücklichen Go-Schritt.
Keine Hug-All-Texte speichern/löschen ohne ausdrücklichen Go-Schritt.
Keine Response-Texte speichern/löschen ohne ausdrücklichen Go-Schritt.
Keine TopTitle-Texte speichern/löschen ohne ausdrücklichen Go-Schritt.
Keine DB-Migration ohne eigenen Plan.
Keine Funktionalität entfernen.
```

## Datenquellen und Tabellen

Das Modul nutzt unter anderem:

```text
config/hug_system.json
config/messages/hug.json
hug_users
hug_pair_stats
hug_pending_rehugs
hug_settings
hug_types
hug_texts
hug_text_pairs
```

Produktive SQLite-DB:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Schema

Schema-Version:

```text
SCHEMA_VERSION = 3
```

Wichtige Tabellen:

```text
hug_users
- user_id
- login
- display_name
- enabled
- given_total
- received_total
- rehug_given_total
- rehug_received_total

hug_pair_stats
- from_user_id
- to_user_id
- given_count
- rehug_count
- last_hug_at
- last_rehug_at

hug_pending_rehugs
- target_user_id
- from_user_id
- type_id
- pair_id
- created_at
- expires_at

hug_settings
- key
- value_json

hug_types
- id
- name
- weight
- enabled
- sort_order

hug_texts
- text_key
- type_id
- kind
- text
- enabled
- weight
- sort_order

hug_text_pairs
- type_id
- category
- name
- hug_text
- rehug_text
- enabled
- weight
- sort_order
```

## Produktive Kernlogik

Ein Hug schreibt unter anderem:

```text
hug_users.given_total
hug_users.received_total
hug_pair_stats.given_count
hug_pair_stats.last_hug_at
hug_pending_rehugs
```

Ein Rehug schreibt unter anderem:

```text
hug_users.given_total
hug_users.received_total
hug_users.rehug_given_total
hug_users.rehug_received_total
hug_pair_stats.given_count
hug_pair_stats.rehug_count
hug_pair_stats.last_hug_at
hug_pair_stats.last_rehug_at
DELETE FROM hug_pending_rehugs
```

on/off schreibt:

```text
hug_users.enabled
```

## Chat-Ausgabe

Je nach Output-Config:

```text
output.mode = central
```

kann das Modul über den zentralen Chat-Output echte Chat-Nachrichten erzeugen.

Bei anderem Modus kann es Streamer.bot-kompatible Antwortfelder zurückgeben.

Für Planung und Diagnose gilt:

```text
Stats/Top/Reload/Command-Routen können Chat-Ausgabe erzeugen und sind deshalb nicht read-only.
```

## Status-Endpunkt

Bevorzugte schnelle Diagnose:

```text
GET /api/hug/status
```

Status enthält unter anderem:

```text
schemaVersion
database
configPath
messagesPath
enabled
output
topLimit
rehugWindowSeconds
counts
textKinds
top
recentPairs
lastImport
lastError
```

Wichtige Counts:

```text
users
enabledUsers
disabledUsers
pairStats
pendingRehugs
hugTypes
hugTextPairs
activeHugTextPairs
hugAllTexts
dbTexts
totalHugsGiven
totalHugsReceived
totalRehugsGiven
totalRehugsReceived
```

## Read-only Routen

Diese Routen dürfen für Diagnose/Dashboard-Prüfungen genutzt werden:

```text
GET /api/hug/status
GET /api/hug/db/status
GET /api/dashboard/community/hug/status
GET /api/hug/config
GET /api/hug/settings
GET /api/hug/routes
GET /api/hug/integration-check
GET /api/hug/db/output-mode
GET /api/hug/types
GET /api/hug/texts
GET /api/hug/admin/text-pairs
GET /api/dashboard/community/hug/text-pairs
GET /api/hug/admin/hug-all-texts
GET /api/dashboard/community/hug/hug-all-texts
GET /api/hug/admin/response-texts
GET /api/dashboard/community/hug/response-texts
GET /api/hug/admin/top-title-texts
GET /api/dashboard/community/hug/top-title-texts
```

Hinweis:

```text
Admin-Editor-Routen sind per GET read-only.
POST auf dieselben Routen ist schreibend.
```

## Read-only Integration-Check

Sichere Diagnose-Route:

```text
GET /api/hug/integration-check
```

Der Integration-Check prüft:

```text
Config-Datei
Messages-Datei
hug_users
hug_pair_stats
hug_pending_rehugs
hug_settings
hug_types
hug_texts
hug_text_pairs
runtime_cache
active_text_pairs
routes
```

Die Route ist als non-destructive beschrieben.

## Produktive / schreibende / vorsichtige Routen

Diese Routen dürfen nicht automatisch durch Diagnose oder Dashboard-Healthchecks ausgelöst werden:

```text
POST /api/hug/action
POST /hug/action
POST /api/hug/stats
POST /hug/stats
GET /api/hug/cmd
GET /hug/cmd
GET /api/hug/statscmd
GET /hug/statscmd
GET /api/hug/top
GET /hug/top
GET /api/hug/command
POST /api/hug/command
GET /api/hug/reload
GET /hug/reload
POST /api/hug/reload
POST /api/hug/text-store/reload
POST /api/hug/db/output-mode
POST /api/hug/admin/text-pairs
POST /api/dashboard/community/hug/text-pairs
POST /api/hug/admin/hug-all-texts
POST /api/dashboard/community/hug/hug-all-texts
POST /api/hug/admin/response-texts
POST /api/dashboard/community/hug/response-texts
POST /api/hug/admin/top-title-texts
POST /api/dashboard/community/hug/top-title-texts
```

Besonders wichtig:

```text
cmd/command/action können Hug/Rehug/HugAll/on/off/stats/top/reload auslösen.
hug und rehug verändern DB-Stats.
on/off verändert User-Enabled-State.
stats/top können Chat-Ausgaben erzeugen.
reload kann Chat-Ausgabe erzeugen oder Cache neu laden.
text-store/reload kann JSON-Seed-Import/Reload auslösen.
admin/text-pairs speichert/löscht gekoppelte Hug/Rehug-Paare.
admin/hug-all-texts speichert/löscht chatweite Hug-Texte.
admin/response-texts speichert/löscht Systemantworten.
admin/top-title-texts speichert/löscht Toplisten-Titel.
db/output-mode schreibt Output-Settings.
```

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/hug.js
```

Dashboard-Tabs:

```text
Übersicht
Texte
Config
Statistiken
Diagnose
```

Produktiv relevante Dashboard-Elemente:

```text
Neu laden
Hug-Reload testen
Textpaar speichern
Textpaar löschen
Neues Hug/Rehug-Paar anlegen
HugAll-Texte speichern/löschen
Response-Texte speichern/löschen
TopTitle-Texte speichern/löschen
```

Produktiv relevante Dashboard-Funktionen:

```text
loadAll(true)
savePair()
deletePair()
loadTextPairs()
saveHugAllText()
deleteHugAllText()
saveResponseText()
deleteResponseText()
saveTopTitleText()
deleteTopTitleText()
```

Wichtiger Hinweis:

```text
Schon der sichtbare Button "Hug-Reload testen" ist kein neutraler Read-only-Test.
Er darf nur nach ausdrücklichem Go genutzt werden.
```

## Sicherheitsregel für zukünftige Hug-Diagnosekarten

Für spätere Dashboard-Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf /api/hug/status lesen
- darf /api/hug/config lesen
- darf /api/hug/settings lesen
- darf /api/hug/routes lesen
- darf /api/hug/integration-check lesen
- darf GET /api/hug/admin/text-pairs lesen
- darf GET /api/hug/admin/hug-all-texts lesen
- darf GET /api/hug/admin/response-texts lesen
- darf GET /api/hug/admin/top-title-texts lesen
- darf keine /api/hug/action Route aufrufen
- darf keine /api/hug/cmd Route aufrufen
- darf keine /api/hug/command Route aufrufen
- darf keine /api/hug/statscmd Route aufrufen
- darf keine /api/hug/top Route aufrufen
- darf keinen Reload auslösen
- darf keinen Text-Store-Reload auslösen
- darf keine POST /api/hug/db/output-mode Route aufrufen
- darf keine POST /api/hug/admin/* Route aufrufen
- darf keinen Hug/Rehug/HugAll/on/off auslösen
- darf keine Chat-Ausgabe erzeugen
- darf keine User-/Pair-/Pending-Stats verändern
- darf keine Settings/Textvarianten speichern oder löschen
- darf keine DB-Migration auslösen
```

## Bekannte Folgeidee

Möglicher späterer kleiner Schritt:

```text
CAN-37.3 - Hug Dashboard Diagnose-Tab prüfen/erweitern
```

Möglicher Inhalt:

```text
- bestehende Diagnose auf Read-only-Sicherheit prüfen
- "Hug-Reload testen" klarer als produktive Aktion markieren oder in sicheren Bereich verschieben
- Status-/Schema-/DB-/Textpaar-Zähler anzeigen
- Integration-Check anzeigen
- Read-only Routen als erlaubt markieren
- produktive Command-/Reload-/Admin-POST-Routen als gesperrt markieren
```

Wichtig für CAN-37.3:

```text
Keine Hug/Rehug/Stats/Top/Reload/Admin-POST-Tests.
Kein MutationObserver.
Kein Dauer-Rendering.
Wenn erweitert wird, vorhandenen Diagnose-Tab nutzen, keinen Extra-Tab.
```

## Stand

```text
CAN-37.2: Doku-/Regelstand erstellt.
```
