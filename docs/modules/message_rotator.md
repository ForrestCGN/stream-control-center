# Message-Rotator-Modul

## Zweck

Das Modul `backend/modules/message_rotator.js` stellt den Message-Rotator für automatische und manuelle Chat-Hinweise bereit.

Es verwaltet Rotator-Items, Textvarianten, Cooldowns, Live-Status-Prüfung, Runtime-State, manuelle Commands und Ausgabe in den Twitch-Chat oder als Twitch-Ankündigung.

## Modul-Metadaten

Aktueller Analyse-Stand CAN-36.1:

```text
MODULE_NAME = message_rotator
MODULE_VERSION = 0.1.0
category = messages
routesPrefix = /api/message-rotator, /message-rotator
```

Das Modul exportiert `MODULE_META` mit:

```text
name: message_rotator
version: 0.1.0
type: runtime
category: messages
description: Message-Rotator API fuer automatische und manuelle Chat-Hinweise.
routesPrefix:
- /api/message-rotator
- /message-rotator
legacy: false
```

Der Bus-Block ist aktuell bewusst nicht aktiv registriert:

```text
bus.registered = false
bus.heartbeat = false
bus.emits = []
bus.listens = []
```

## Besondere Risiko-Einstufung

Der Message-Rotator ist produktiv besonders sensibel.

Er kann je nach Konfiguration direkt über das Backend Twitch-Chatnachrichten oder Twitch-Ankündigungen senden:

```text
sendTwitchChatMessageDirect()
sendTwitchAnnouncementDirect()
deliverRotatorMessage()
```

Darum gilt:

```text
Keine automatische Diagnose darf next/manual/start/stop/tick/reload/live-status/admin-POST auslösen.
```

## Runtime-Regel

```text
Keine Message senden ohne ausdrücklichen Go-Schritt.
Keinen Rotator starten/stoppen ohne ausdrücklichen Go-Schritt.
Keinen Tick auslösen ohne ausdrücklichen Go-Schritt.
Kein Next/Manual auslösen ohne ausdrücklichen Go-Schritt.
Keine Settings speichern ohne ausdrücklichen Go-Schritt.
Keine Texte/Varianten speichern/löschen ohne ausdrücklichen Go-Schritt.
Kein Reload ohne ausdrücklichen Go-Schritt.
Keine Live-Status-Abfrage erzwingen ohne ausdrücklichen Go-Schritt.
Keine DB-Migration ohne eigenen Plan.
Keine Funktionalität entfernen.
```

## Datenquellen

Das Modul nutzt unter anderem:

```text
config/message_rotator.json
config/messages/*
message_rotator_settings
module_text_variants
module_texts
Runtime-State im Arbeitsspeicher
```

Produktive SQLite-DB:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Status-Endpunkt

Bevorzugte schnelle Diagnose:

```text
GET /api/message-rotator/status
```

Der Status enthält unter anderem:

```text
active
startedAt
stoppedAt
chatMessagesSinceLastSend
totalTicks
ignoredTicks
lastTickAt
lastTickUser
lastSentAt
lastSentAgeSeconds
lastItemId
lastMessageKey
lastMessage
sendCount
itemState
manualState
config
configInfo
liveStatus
```

## Read-only Routen

Diese Routen dürfen für Diagnose/Dashboard-Prüfungen genutzt werden:

```text
GET /api/message-rotator/status
GET /api/message-rotator/config
GET /api/message-rotator/settings
GET /api/message-rotator/routes
GET /api/message-rotator/integration-check
GET /api/message-rotator/admin/settings
GET /api/message-rotator/admin/texts

GET /message-rotator/status
GET /message-rotator/config
GET /message-rotator/settings
GET /message-rotator/routes
GET /message-rotator/integration-check
GET /message-rotator/admin/settings
GET /message-rotator/admin/texts
```

Hinweis:

```text
/admin/settings und /admin/texts sind per GET read-only.
POST auf dieselben Routen ist schreibend.
```

## Read-only Integration-Check

Sichere Diagnose-Route:

```text
GET /api/message-rotator/integration-check
```

Diese Route prüft unter anderem:

```text
Config
Config-Datei
Messages-Ordner
Message-Files
Text-Helper-Status
Sample-Renderings
Runtime-State
Live-Status-Konfiguration
Routen/Security-Zusammenfassung
```

Wichtige Regel:

```text
Der Integration-Check darf keine DB-, JSON- oder Dateiänderungen vornehmen.
Sample-Warnungen bedeuten nur, dass einzelne Message-Keys fehlen oder nicht rendern.
```

## Produktive / schreibende / vorsichtige Routen

Diese Routen dürfen nicht automatisch durch Diagnose oder Dashboard-Healthchecks ausgelöst werden:

```text
GET /api/message-rotator/reload
POST /api/message-rotator/reload
GET /api/message-rotator/start
POST /api/message-rotator/start
GET /api/message-rotator/stop
POST /api/message-rotator/stop
GET /api/message-rotator/tick
POST /api/message-rotator/tick
GET /api/message-rotator/next
POST /api/message-rotator/next
GET /api/message-rotator/manual
POST /api/message-rotator/manual
GET /api/message-rotator/live-status
POST /api/message-rotator/live-status
POST /api/message-rotator/admin/settings
POST /api/message-rotator/admin/texts

GET /message-rotator/reload
POST /message-rotator/reload
GET /message-rotator/start
POST /message-rotator/start
GET /message-rotator/stop
POST /message-rotator/stop
GET /message-rotator/tick
POST /message-rotator/tick
GET /message-rotator/next
POST /message-rotator/next
GET /message-rotator/manual
POST /message-rotator/manual
GET /message-rotator/live-status
POST /message-rotator/live-status
POST /message-rotator/admin/settings
POST /message-rotator/admin/texts
```

Besonders wichtig:

```text
start verändert Runtime-State.
stop verändert Runtime-State.
tick erhöht Chat-Zähler und kann Timing-/Cooldown-Entscheidungen beeinflussen.
next kann bei commit=1 eine Chatnachricht oder Announcement senden.
manual kann bei commit=1 eine Chatnachricht oder Announcement senden.
reload lädt Config/Texte neu.
live-status kann externe Abfragen auslösen und Cache/Runtime-State verändern.
admin/settings speichert Settings in der DB.
admin/texts speichert/löscht Textvarianten in der DB.
```

## Vorschau-Routen

`next` und `manual` unterstützen zwar `commit=0` für Vorschau ohne Senden.

Trotzdem gilt:

```text
Keine automatische Diagnose soll /next oder /manual aufrufen.
```

Grund:

```text
Diese Routen enthalten produktive Message-Auswahl-/Delivery-Logik.
Ein späterer Fehler, falscher Parameter oder eine Konfigurationsänderung könnte aus Vorschau echte Ausgabe machen.
Diagnosekarten sollen deshalb nur /status, /routes und /integration-check verwenden.
```

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/message_rotator.js
```

Das Dashboard nutzt unter anderem:

```text
/api/message-rotator/status
/api/message-rotator/admin/settings
/api/message-rotator/admin/texts
/api/message-rotator/integration-check
/api/message-rotator/reload
/api/message-rotator/start
/api/message-rotator/stop
/api/message-rotator/next
/api/message-rotator/manual
```

Dashboard-Schreib-/Aktionsfunktionen:

```text
callControl()
previewNext()
previewManual()
saveSetting()
saveItems()
addItem()
deleteItem()
saveVariant()
addVariant()
deleteVariant()
```

Diese Funktionen dürfen nicht durch automatische Diagnosekarten ausgelöst werden.

## Sicherheitsregel für zukünftige Message-Rotator-Diagnosekarten

Für spätere Dashboard-Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf /api/message-rotator/status lesen
- darf /api/message-rotator/routes lesen
- darf /api/message-rotator/integration-check lesen
- darf GET /api/message-rotator/admin/settings lesen
- darf GET /api/message-rotator/admin/texts lesen
- darf keine /api/message-rotator/start Route aufrufen
- darf keine /api/message-rotator/stop Route aufrufen
- darf keine /api/message-rotator/tick Route aufrufen
- darf keine /api/message-rotator/next Route aufrufen
- darf keine /api/message-rotator/manual Route aufrufen
- darf keine /api/message-rotator/reload Route aufrufen
- darf keine /api/message-rotator/live-status Route aufrufen
- darf keine POST /api/message-rotator/admin/settings Route aufrufen
- darf keine POST /api/message-rotator/admin/texts Route aufrufen
- darf keine Chatnachricht senden
- darf keine Twitch-Ankündigung senden
- darf keinen Runtime-State verändern
- darf keine Chat-Zähler erhöhen
- darf keine Settings/Textvarianten speichern oder löschen
- darf keine externe Live-Status-Abfrage erzwingen
```

## Bekannte Folgeidee

Möglicher späterer kleiner Schritt:

```text
CAN-36.3 - Message-Rotator Dashboard Read-only Diagnosekarte planen
```

Möglicher Inhalt:

```text
- Modulversion anzeigen
- Runtime-State anzeigen
- active / startedAt / stoppedAt anzeigen
- Chat-Zähler anzeigen
- SendCount anzeigen
- letzte Ausgabe anzeigen
- Config-Quelle anzeigen
- Item-Zähler anzeigen
- Textvarianten-/Texthelper-Status anzeigen
- Integration-Check anzeigen
- Live-Status-Config anzeigen, ohne Force-Abfrage
- Read-only Routen als erlaubt markieren
- Start/Stop/Tick/Next/Manual/Reload/Admin-POST-Routen als gesperrt markieren
```

Wichtig für CAN-36.3:

```text
Direkt als eigener Diagnose-Tab planen.
Keine MutationObserver-Schleife.
Kein Dauer-Rendering.
Nur kontrolliertes Click-/Show-Handling wie CAN-34.3c.
Keine /next oder /manual Vorschau in der Diagnosekarte.
```

## Stand

```text
CAN-36.2: Doku-/Regelstand erstellt.
```
