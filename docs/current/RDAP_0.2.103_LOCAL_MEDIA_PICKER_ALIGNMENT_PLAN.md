# RDAP 0.2.103 - Local Media Picker Alignment Plan

Stand: 2026-06-30

## Ziel

0.2.103 dokumentiert den naechsten sinnvollen Block fuer die lokale Angleichung des Media-Pickers.

Es wird keine Runtime-Funktion geaendert.

## Ausgangslage

Online ist der Media-Picker seit 0.2.101 live bestaetigt:

```text
GET /api/remote/media/index/context/list
```

Der Picker ist read-only, paginiert ueber `limit` und `offset` und nutzt modfreundliche Begriffe.

## UI-Wahrheit

Die Online-Media-Seite bleibt die fachliche UI-Wahrheit:

```text
remote-modboard/backend/public/assets/modules/media/library.js
```

Fuer Mods sichtbar bleiben alltaegliche Begriffe:

```text
Bereich
Ordner
Dateityp
Anzahl
Anzeigen
Filter zuruecksetzen
```

Nicht in die Mod-Hauptansicht:

```text
Root
Kind
Full Category
Kontext-API
remote_media_index
DB
Writes
Agent-Diagnose
absolute Pfade
```

## Lokales Zielbild

```text
Eine UI, zwei Runtime-Profile:
- online: Remote-Modboard Webserver 3010
- local: Stream-PC / lokales Dashboard 8080
```

Die lokale Ansicht soll nicht als zweite Bedienlogik abdriften. Bestehende Struktur bevorzugen.

## Pruefpunkte fuer den naechsten Runtime-Step

Vor Code muss aus GitHub/dev gelesen werden:

```text
remote-modboard/backend/public/assets/modules/media/library.js
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/modules/module-manifest.js
remote-modboard/backend/src/routes/media-index-diff.routes.js
remote-modboard/backend/src/routes/routes.routes.js
backend/modules/remote_agent.js
backend/modules/local_remote_modboard_adapter.js
server.js
htdocs/dashboard-v2/assets/modules/media/library.js
htdocs/dashboard-v2/assets/remote-modboard.css
htdocs/dashboard-v2/assets/modules/module-manifest.js
```

Dann klaeren:

```text
- nutzt lokal dieselbe Media-Library oder eine Kopie?
- gibt es lokal bereits eine Context-kompatible Media-API?
- kann lokal root/module/category/kind/limit/offset liefern?
- werden absolute Pfade aus der Mod-Hauptansicht rausgehalten?
- kann Pagination lokal echte Seiten laden?
- bleibt alles read-only?
```

## Sicherheitsgrenzen

Verboten ohne separaten Plan + Go:

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
```

## Ergebnis dieses Steps

```text
Runtime-Code: nein
Backend-Code: nein
DB-Migration: nein
Writes: nein
Agent-Aktion: nein
ZIP: Doku-/Projektstatus-Dateien
```

## Naechster Step

```text
RDAP_0.2.104_LOCAL_MEDIA_PICKER_READONLY_ALIGNMENT
```
