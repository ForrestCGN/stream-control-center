# RDAP 0.2.104 - Local Media Picker Readonly Alignment

## Stand

`0.2.104 - Local Media Picker Readonly Alignment`

## Ziel

Lokale Media-Ansicht im Dashboard-v2 an den bestaetigten Online-Media-Picker angleichen, ohne zweite UI-Logik und ohne Writes.

## Geaendert

```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

## Neue lokale Route

```text
GET /api/remote/media/index/context/list
```

Eigenschaften:

```text
readOnly = true
writeEnabled = false
databaseWritesEnabled = false
databaseWriteExecuted = false
agentActionsEnabled = false
fileActionsEnabled = false
```

## UI

Lokale Media-UI nutzt denselben Picker-Stand wie online:

```text
Bereich
Ordner
Dateityp
Anzahl
Anzeigen
Filter zuruecksetzen
Zurueck
Weiter
```

## Test

```powershell
node --check .\backend\modules\local_remote_modboard_adapter.js
node --check .\htdocs\dashboard-v2\assets\modules\media\library.js

Invoke-RestMethod "http://127.0.0.1:8080/api/remote/media/index/context/list?root_key=media&limit=25&offset=0" | Select-Object ok,status,total,count,readOnly,writeEnabled,databaseWriteExecuted
```

## Schutzregeln

```text
keine Gates
keine DB-Writes
keine Migration
keine Agent-Actions
keine Upload/Edit/Delete-Aktion
keine Dateiaktion vom Webserver zum Stream-PC
keine absoluten Pfade in der Mod-Hauptansicht
```

## Naechster Schritt

`RDAP_0.2.105_LOCAL_MEDIA_PICKER_VERIFY_AND_POLISH`
