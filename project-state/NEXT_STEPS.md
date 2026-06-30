# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.105_LOCAL_MEDIA_PICKER_VERIFY_AND_POLISH`

## Ausgangslage

`0.2.104 - Local Media Picker Readonly Alignment` ist ein lokaler Read-only-Runtime-Step.

Bestaetigt/umgesetzt:
- lokale Dashboard-v2 Media-UI wurde an den Online-Media-Picker angeglichen,
- lokaler Adapter liefert `GET /api/remote/media/index/context/list`,
- lokale Route nutzt bestehendes lokales Media-Inventar read-only,
- lokale Route unterstuetzt `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`,
- keine DB-Writes,
- keine Gates,
- keine Agent-Actions,
- keine Upload/Edit/Delete-Aktion,
- keine Online->Agent Dateiaktion.

## Betroffene Dateien aus 0.2.104

```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/RDAP_0.2.104_LOCAL_MEDIA_PICKER_READONLY_ALIGNMENT.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_104.md
```

## Naechstes Ziel

Lokale Verifikation und kleiner Polish nur falls noetig:

```text
- Dashboard lokal oeffnen: http://127.0.0.1:8080/dashboard-v2/
- Media-System pruefen
- Bereich/Ordner/Dateityp/Anzahl testen
- Zurueck/Weiter testen
- pruefen, ob lokale htdocs/assets/media Daten passend erscheinen
```

## Pruefbefehle

```powershell
node --check .\backend\modules\local_remote_modboard_adapter.js
node --check .\htdocs\dashboard-v2\assets\modules\media\library.js

Invoke-RestMethod "http://127.0.0.1:8080/api/remote/media/status?limit=25" | Select-Object ok,status,readOnly

Invoke-RestMethod "http://127.0.0.1:8080/api/remote/media/index/context/list?root_key=media&limit=25&offset=0" | Select-Object ok,status,total,count,readOnly,writeEnabled,databaseWriteExecuted
```

## Harte Regeln fuer 0.2.105

```text
keine Gates aktivieren
keine DB-Zeilen veraendern
keine Migration
kein Tombstone-Execute
kein Hard-Delete
kein physisches Loeschen
kein Online->Agent-Trigger
keine Upload/Edit/Delete-Aktion
keine Dateiaktion vom Webserver zum Stream-PC
keine zweite lokale UI
keine technischen Labels in der Mod-Hauptansicht
keine weissen Browser-Standard-Dropdowns
```

## Erwarteter Ablauf

1. GitHub/dev und relevante Dateien lesen.
2. Lokale Testergebnisse von Forrest auswerten.
3. Wenn noetig: kleinen Fix planen.
4. Auf `go` warten.
5. Erst dann ZIP bauen.
