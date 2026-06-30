# CURRENT_STATUS

Aktueller Stand: `0.2.103 - Local Media Picker Alignment Plan`

## Kurzfazit

Der Online-Media-Picker im Remote-Modboard bleibt der bestaetigte mod-taugliche read-only Stand.

Mit 0.2.103 wurde keine Runtime-Funktion geaendert. Der Step ist ein Plan-/Handoff-Step fuer die lokale Angleichung des Media-Pickers.

Bestaetigt vor 0.2.103:
- Media-System-Index ist vollstaendig in `remote_media_index`.
- Context-Read-API ist live.
- Bestehende Media-Seite nutzt die Context-API.
- Pagination funktioniert mit echten API-Seiten ueber `limit` und `offset`.
- UI ist modfreundlicher formuliert und im CGN-Design poliert.
- Keine DB-Writes, keine Gates, keine Upload/Edit/Delete-Aktion, keine Agent-Aktion.

0.2.103 haelt fest:
- Lokale Media-Picker-Angleichung wird als separater Read-only-Block vorbereitet.
- Online-UI bleibt die fachliche Wahrheit fuer Layout, Sprache und Mod-taugliche Begriffe.
- Lokale UI darf keine zweite abweichende Bedienlogik werden.
- Lokale Datenquelle muss read-only bleiben.
- Keine Online->Agent Dateiaktion.
- Keine Upload/Edit/Delete-Aktion.
- Keine DB-Migration.
- Keine Gates.

## Bestaetigter Gesamtindex

```text
remote_media_index aktiv:
images = 46
media  = 412
sounds = 276
videos = 10
gesamt = 744
```

## Basis-API Online

```text
GET /api/remote/media/index/context/list
```

Bestaetigt:
```text
root_key=media:
ok = true
status = media_index_context_list_available_readonly
total = 412
readOnly = true
writeEnabled = false
databaseWriteExecuted = false

root_key=media&module_key=alerts:
total = 132

root_key=media&full_category_key=alerts/follow:
total = 53
```

## Online-Media-Picker 0.2.96 bis 0.2.101

Betroffene Datei:
```text
remote-modboard/backend/public/assets/modules/media/library.js
```

Umsetzung:
```text
0.2.96 - Media Picker readonly UI
0.2.97 - Context UI Polish
0.2.98 - Page Size Dropdown
0.2.99 - Mod-friendly Filters
0.2.100 - CGN Design Polish
0.2.101 - Pagination and Dedup
0.2.102 - Online Media Picker Docs Handoff
0.2.103 - Local Media Picker Alignment Plan
```

Live bestaetigt:
- Bestehende Media-Seite wurde erweitert, kein neues Modul.
- Filter sind fuer Mods formuliert:
  - Bereich
  - Ordner
  - Dateityp
  - Anzahl
  - Anzeigen
- Technische Begriffe wie `Root`, `Kind`, `Full Category`, `Kontext-API`, `DB`, `Writes` sind aus der Hauptansicht weitgehend entfernt.
- Dropdowns sind im CGN-Look.
- Unnoetige Warnboxen/Zaehlungsdopplungen wurden entfernt.
- Pagination unten zeigt nur noch z. B. `1-25 von 412 Dateien`.
- `Zurueck` / `Weiter` laden echte neue Seiten aus der Context-API.

## Lokale Angleichung - Zielbild

Die lokale Media-Ansicht soll dieselbe Mod-Bedienlogik wie online verwenden:

```text
Eine UI, zwei Runtime-Profile:
- online: Remote-Modboard auf Webserver 3010
- local: lokales Dashboard / Stream-PC 8080
```

Fuer die lokale Angleichung gilt:
- bestehende Struktur bevorzugen,
- keine neue zweite UI,
- keine parallele Media-Logik ohne Not,
- lokale API nur read-only,
- gleiche Feldnamen/Filter wie Online-Context-API anstreben,
- keine absoluten Pfade in der Mod-Hauptansicht,
- keine technischen Diagnosefelder in der Mod-Hauptansicht.

## Sicherheit

Weiterhin verboten ohne separaten Plan + Go:

```text
kein Gate aktivieren
keine DB-Zeilen veraendern
keine Migration
kein Tombstone-Execute
kein Hard-Delete
kein physisches Loeschen
kein Online->Agent-Trigger
keine Upload/Edit/Delete-Aktion
keine Dateiaktion vom Webserver zum Stream-PC
```

Gates bleiben geschlossen:
```text
MEDIA_INDEX_WRITE_ENABLED=false
MEDIA_INDEX_DATA_WRITE_ENABLED=false
MEDIA_INDEX_UPSERT_WRITE_ENABLED=false
MEDIA_INDEX_PERSISTENT_TOMBSTONE_WRITE_ENABLED=false
```

Hinweis:
`MEDIA_INDEX_SCHEMA_WRITE_ENABLED` war beim 0.2.93-Check nicht explizit in der Env-Ausgabe vorhanden. Der Code behandelt fehlende Boolean-Env-Werte als `false`. Fuer bessere Diagnose spaeter explizit als `false` setzen, aber nicht nebenbei in einem API-/UI-Step.

## Naechster sinnvoller Block

```text
RDAP_0.2.104_LOCAL_MEDIA_PICKER_READONLY_ALIGNMENT
```

Ziel:
- lokale Dashboard-/Agent-Struktur final gegen Online-Media-Picker abgleichen,
- lokale Read-only-API-Kontraktfelder definieren oder angleichen,
- dann erst minimale Runtime-Angleichung planen/umsetzen,
- keine Online->Agent Dateiaktion,
- keine Writes.
