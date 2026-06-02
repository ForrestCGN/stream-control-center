# Tagebuch-Modul

## Zweck

Das Modul `backend/modules/tagebuch.js` stellt das Streamtagebuch bereit.

Es verarbeitet Tagebuch-Einträge, Streamstart-/Streamende-Ereignisse, Discord/Webhook-Posting, Seiten-/State-Verwaltung, Statistiken, Settings und Textvarianten.

## Modul-Metadaten

Aktueller Analyse-Stand CAN-35.1:

```text
MODULE_NAME = tagebuch
MODULE_VERSION = 0.1.0
SCHEMA_VERSION = 5
category = content
routesPrefix = /api/tagebuch, /tagebuch, /discord/tagebuch
```

Das Modul exportiert `MODULE_META` mit:

```text
name: tagebuch
version: 0.1.0
type: runtime
category: content
description: Streamtagebuch API, Discord-Posting und Text-/Settings-Verwaltung.
routesPrefix:
- /api/tagebuch
- /tagebuch
- /discord/tagebuch
legacy: false
```

Der Bus-Block ist aktuell bewusst nicht aktiv registriert:

```text
bus.registered = false
bus.heartbeat = false
bus.emits = []
bus.listens = []
```

## Runtime-Regel

Das Tagebuch-Modul ist produktiv relevant.

```text
Keine Tagebuch-Funktion ändern ohne eigenen Plan.
Keine Tagebuch-Einträge erstellen/löschen/ändern ohne ausdrücklichen Go-Schritt.
Keine Streamstart-/Streamende-Aktion ohne ausdrücklichen Go-Schritt.
Kein Reset ohne ausdrücklichen Go-Schritt.
Keine Settings speichern ohne ausdrücklichen Go-Schritt.
Keine Texte/Varianten speichern/löschen ohne ausdrücklichen Go-Schritt.
Kein Reload ohne ausdrücklichen Go-Schritt.
Keine DB-Migration ohne eigenen Plan.
Keine Funktionalität entfernen.
```

## Datenquellen

```text
config/tagebuch.json
config/messages/tagebuch.json
tagebuch_state
tagebuch_runtime_events
tagebuch_user_stats
tagebuch_daily_user_stats
tagebuch_settings
module_text_variants
module_texts
```

Produktive SQLite-DB:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Status-Endpunkt

Bevorzugte schnelle Diagnose:

```text
GET /api/tagebuch/status
```

Der Status enthält unter anderem:

```text
schemaVersion
databasePath
configPath
messagesPath
config
state
```

## Read-only Routen

Diese Routen dürfen für Diagnose/Dashboard-Prüfungen genutzt werden:

```text
GET /api/tagebuch/status
GET /api/tagebuch/config
GET /api/tagebuch/settings
GET /api/tagebuch/routes
GET /api/tagebuch/integration-check
GET /api/tagebuch/stats
GET /api/tagebuch/stats/top
GET /api/tagebuch/stats/today
GET /api/tagebuch/stats/user
GET /api/tagebuch/admin/settings
GET /api/tagebuch/admin/texts
GET /discord/tagebuch/status
```

Hinweis:

```text
/admin/settings und /admin/texts sind per GET read-only.
POST auf dieselben Routen ist schreibend.
```

## Read-only Integration-Check

Sichere Diagnose-Route:

```text
GET /api/tagebuch/integration-check
```

Diese Route prüft:

```text
Config
Datenbank
Schema-Version
State-Tabelle
Runtime-Events
User-Statistiken
Daily-Statistiken
Settings
Textvarianten
Config-/Messages-Dateien
Webhook-Konfiguration
aktueller Tagebuch-State
```

Wichtige Regel:

```text
Der Integration-Check darf keine DB-, JSON- oder Dateiänderungen vornehmen.
Warnungen zu fehlender Webhook-URL können je nach Setup normal sein, wenn Discord-Posting deaktiviert ist.
```

## Produktive / schreibende / vorsichtige Routen

Diese Routen dürfen nicht automatisch durch Diagnose oder Dashboard-Healthchecks ausgelöst werden:

```text
GET /api/tagebuch/stream/start
POST /api/tagebuch/stream/start
GET /api/tagebuch/stream/end
POST /api/tagebuch/stream/end
GET /api/tagebuch/entry
POST /api/tagebuch/entry
GET /api/tagebuch/reset
POST /api/tagebuch/reset
GET /api/tagebuch/reload
POST /api/tagebuch/reload
GET /discord/stream/start
POST /discord/stream/start
GET /discord/stream/end
POST /discord/stream/end
GET /discord/tagebuch
POST /discord/tagebuch
GET /discord/tagebuch/reset
POST /discord/tagebuch/reset
POST /api/tagebuch/admin/settings
POST /api/tagebuch/admin/texts
```

Besonders wichtig:

```text
stream/start kann eine neue Tagebuchseite anlegen und Discord posten.
stream/end ändert State und kann einen Leer-Hinweis nach Discord posten.
entry postet nach Discord und erhöht Tagebuch-Statistiken.
reset verändert den Tagebuch-State.
reload lädt Runtime-Config und Texte neu.
admin/settings speichert Settings in der DB.
admin/texts speichert/löscht Textvarianten in der DB.
```

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/tagebuch.js
```

Das Dashboard nutzt:

```text
/api/tagebuch/status
/api/tagebuch/admin/settings
/api/tagebuch/admin/texts
/api/tagebuch/stats
/api/tagebuch/stats/today
/api/tagebuch/reload
```

Dashboard-Schreib-/Aktionsfunktionen:

```text
reloadBackend()
saveSetting()
saveVariant()
addVariant()
deleteVariant()
```

Diese Funktionen dürfen nicht durch automatische Diagnosekarten ausgelöst werden.

## Sicherheitsregel für zukünftige Tagebuch-Diagnosekarten

Für spätere Dashboard-Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf /api/tagebuch/status lesen
- darf /api/tagebuch/routes lesen
- darf /api/tagebuch/integration-check lesen
- darf /api/tagebuch/stats und /stats/today lesen
- darf GET /api/tagebuch/admin/settings und GET /api/tagebuch/admin/texts lesen
- darf keine /api/tagebuch/entry Route aufrufen
- darf keine /discord/tagebuch Route aufrufen
- darf keine /api/tagebuch/stream/start Route aufrufen
- darf keine /api/tagebuch/stream/end Route aufrufen
- darf keine /api/tagebuch/reset Route aufrufen
- darf keinen /api/tagebuch/reload auslösen
- darf keine POST /api/tagebuch/admin/settings Route aufrufen
- darf keine POST /api/tagebuch/admin/texts Route aufrufen
- darf keine Discord-Nachricht posten
- darf keine Tagebuch-Seite anlegen
- darf keinen Tagebuch-State verändern
- darf keine Statistik erhöhen
- darf keine Settings/Textvarianten speichern oder löschen
```

## Bekannte Folgeidee

Möglicher späterer kleiner Schritt:

```text
CAN-35.3 - Tagebuch Dashboard Read-only Diagnosekarte planen
```

Möglicher Inhalt:

```text
- Modulversion anzeigen
- Schema OK anzeigen
- Integration-Check OK anzeigen
- aktueller Tagebuch-State anzeigen
- Seiten-/Streamstatus anzeigen
- Statistik-Tabellen-Zähler anzeigen
- Textvarianten-Zähler anzeigen
- Webhook-Konfiguration ohne Secret anzeigen
- Read-only Routen als erlaubt markieren
- Entry/Stream/Reset/Reload/Admin-POST-Routen als gesperrt markieren
```

Wichtig für CAN-35.3:

```text
Direkt als eigener Diagnose-Tab planen.
Keine MutationObserver-Schleife.
Kein Dauer-Rendering.
Nur kontrolliertes Click-/Show-Handling wie CAN-34.3c.
```

## Stand

```text
CAN-35.2: Doku-/Regelstand erstellt.
```
