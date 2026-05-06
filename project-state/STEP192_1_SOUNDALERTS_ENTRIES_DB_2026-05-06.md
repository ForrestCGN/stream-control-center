# STEP192.1 - SoundAlerts Entries DB

Stand: 2026-05-06

## Ziel

SoundAlert-Eintraege/Mappings werden DB-faehig gemacht, ohne bestehende Funktionalitaet zu brechen.

Bisher lagen die SoundAlert-Eintraege unter:

```text
config/soundalerts_bridge.json -> rules
```

Ab diesem STEP wird eine neue SQLite-Tabelle genutzt:

```text
soundalerts_bridge_entries
```

Die bestehende JSON bleibt als Seed/Fallback erhalten.

## Geaendert

Betroffene Datei:

```text
backend/modules/soundalerts_bridge.js
```

Version:

```text
0.1.1 -> 0.1.2
```

Schema:

```text
1 -> 2
```

## Neue Tabellen

```text
soundalerts_bridge_entries
soundalerts_bridge_meta
```

### soundalerts_bridge_entries

Speichert SoundAlert-Eintraege:

```text
entry_key
enabled
status
soundalert_name
label
file
media_type
category
priority
volume
output_target
created_from
created_at
updated_at
meta_json
```

### soundalerts_bridge_meta

Speichert interne Marker, aktuell:

```text
entries_seeded_from_json = 1
```

Damit werden JSON-Regeln nicht immer wieder neu importiert, wenn DB-Eintraege bewusst geloescht wurden.

## Kompatibilitaet

Wichtig:

```text
Bestehende JSON rules werden nicht geloescht.
Bestehender Fahrstuhl Sound bleibt als Fallback erhalten.
/api/soundalerts/config gibt weiterhin config.rules aus.
Dashboard muss erstmal nicht neu gebaut werden.
```

Wenn DB verfuegbar ist:

```text
rules kommen aus soundalerts_bridge_entries
```

Wenn DB nicht verfuegbar ist oder ein Fehler auftritt:

```text
Fallback auf config.rules aus JSON
```

## Speichern aus dem Dashboard

`POST /api/soundalerts/config` bleibt kompatibel.

Wenn der Request `config.rules` enthaelt:

```text
rules werden in soundalerts_bridge_entries gespeichert
JSON rules bleiben als Seed/Fallback erhalten
technische Config wird weiterhin in JSON gespeichert
```

Damit bleibt das Dashboard erstmal stabil, waehrend intern DB als Hauptspeicher fuer Eintraege eingefuehrt wird.

## Neue Route

```text
GET /api/soundalerts/entries
```

Gibt die effektiven Eintraege zurueck und meldet Quelle:

```text
db
json_fallback
```

## Status-Erweiterung

`/api/soundalerts/status` zeigt jetzt zusaetzlich:

```text
database.entriesTable
database.entriesStats.total
database.entriesStats.active
database.entriesStats.inactive
database.entriesStats.missingFile
database.entriesStats.seededFromJson
```

## Nicht geaendert

- Keine Dashboard-Dateien geaendert.
- Kein Upload-Endpoint entfernt.
- Keine Event-Tabelle geloescht/geaendert.
- Keine JSON-Datei geloescht.
- Keine bestehende SoundAlerts-Funktion entfernt.

## Tests

Syntax:

```text
node -c backend/modules/soundalerts_bridge.js
```

Erwartung:

```text
OK
```

Live nach Deploy:

```powershell
cd D:\Streaming\stramAssets

Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/reload" -Method POST | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/config" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Erwartung:

```text
version = 0.1.2
database.entriesTable = soundalerts_bridge_entries
database.entriesStats.total >= 1
Fahrstuhl Sound weiterhin vorhanden
```

Danach Dashboard:

```text
SoundAlerts -> Eintraege
Fahrstuhl Sound sichtbar
Eintrag speichern
Reload
Eintrag bleibt erhalten
```

Danach Live-Funktionstest:

```text
Fahrstuhl Sound ausloesen
Video muss weiter ueber Overlay laufen
```

## Naechster Schritt

Wenn STEP192.1 stabil ist:

```text
STEP192.2 - SoundAlerts Admin Settings DB
```

Darin werden technische/adminfaehige Einstellungen aus JSON bevorzugt DB-basiert gemacht. JSON bleibt Seed/Fallback.
