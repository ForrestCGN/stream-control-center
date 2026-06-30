# NEXT_STEPS

## Naechster RDAP-Block

`RDAP_0.2.106_MEDIA_PICKER_NEXT_SCOPE_DECISION`

## Ausgangslage

`0.2.105 - Local Media Picker Verify and Polish Docs` ist ein Doku-only Abschluss.

Bestaetigt:
- 0.2.104 hat lokale Dashboard-v2 Media-UI an den Online-Media-Picker angeglichen.
- Lokaler Adapter liefert `GET /api/remote/media/index/context/list`.
- Lokale Route nutzt bestehendes lokales Media-Inventar read-only.
- Lokale Route unterstuetzt `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`.
- Lokale Syntaxchecks waren sauber.
- Lokale Context-Route liefert `total=412`, `count=25`, `readOnly=True`, `writeEnabled=False`, `databaseWriteExecuted=False`.
- Lokale Browserpruefung: Media-System funktioniert wie im ModBoard.
- Keine DB-Writes.
- Keine Gates.
- Keine Agent-Actions.
- Keine Upload/Edit/Delete-Aktion.
- Keine Online->Agent Dateiaktion.
- Kein Webserver-Deploy noetig.

## Bestaetigte Runtime-Dateien aus 0.2.104

```text
backend/modules/local_remote_modboard_adapter.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

## 0.2.105 Dateien

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/RDAP_0.2.105_LOCAL_MEDIA_PICKER_VERIFY_AND_POLISH_DOCS.md
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_AFTER_MEDIA_0_2_105.md
```

## Naechstes Ziel fuer 0.2.106

Naechsten Scope bewusst entscheiden, statt nebenbei neue Funktionen einzubauen.

Moegliche Richtungen:

```text
1. Media-Picker Bestand abschliessen und in Modul-Doku ueberfuehren.
2. Kleinen UI-Polish planen, falls Forrest im Alltag etwas auffaellt.
3. Online/lokal Feld- und Filterkontrakt weiter vereinheitlichen.
4. Separaten Sync-/Agent-/Permission-Scope vorbereiten.
5. Geparkte Env-Diagnose `MEDIA_INDEX_SCHEMA_WRITE_ENABLED=false` separat planen.
```

## Harte Regeln fuer den naechsten Block

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
2. Ziel fuer 0.2.106 festlegen.
3. Kurzplan nennen.
4. Auf `go` warten.
5. Erst dann ZIP bauen.
