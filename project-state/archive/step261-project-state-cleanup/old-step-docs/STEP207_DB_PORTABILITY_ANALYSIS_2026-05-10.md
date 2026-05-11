# STEP207 - DB-Portabilitaetsanalyse und MySQL/MariaDB-Zielarchitektur

Stand: 2026-05-10

## Ziel

Dieser STEP dokumentiert den aktuellen Datenbank-Stand des Projekts und legt die naechste sichere Architektur-Richtung fuer kuenftige MySQL-/MariaDB-Unterstuetzung fest.

Es handelt sich bewusst um einen Analyse- und Architektur-STEP.

## Grundlage

Basis war der lokale Repo-Scan:

```text
db_portability_scan_2026-05-10.txt
```

Der Scan wurde aus `D:\Git\stream-control-center` erzeugt und hat Treffer in `backend`, `config`, `docs` und `project-state` gesammelt.

## Aktueller DB-Stand

Aktiv produktiv bleibt:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Zentrale DB-Schicht ist vorhanden:

```text
backend/core/database.js
```

SQLite-Kern ist weiterhin:

```text
backend/modules/sqlite_core.js
```

`backend/core/database.js` erkennt bereits Adapter-Werte aus ENV:

```text
DB_ADAPTER
DATABASE_ADAPTER
```

Der aktuelle MariaDB-Pfad ist aber bewusst noch nicht implementiert und meldet:

```text
mariadb_adapter_not_implemented_yet
```

## Module mit zentraler DB-Schicht

Diese Module nutzen laut Scan bereits `backend/core/database.js` oder zentrale Helper, die darueber laufen:

```text
backend/modules/clips.js
backend/modules/hug.js
backend/modules/loyalty.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
backend/modules/twitch_presence.js
backend/modules/vip_sound_overlay.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_texts.js
```

Bewertung:

- Diese Richtung ist korrekt.
- Neue Module sollen bevorzugt diesen Weg verwenden.
- Bestehende Helper wie `helper_settings` und `helper_texts` sind wichtige DB-Portabilitaets-Bausteine.

## Module mit direkter sqlite_core-Kopplung

Diese Module nutzen laut Scan noch direkt `backend/modules/sqlite_core.js`:

```text
backend/modules/alert_system.js
backend/modules/challenge.js
backend/modules/dashboard_auth.js
backend/modules/kofi.js
backend/modules/sound_system.js
backend/modules/tagebuch.js
backend/modules/tipeee.js
backend/modules/todo.js
backend/modules/twitch.js
```

Zusatzfund:

```text
backend/check_alert_db.js
```

Das ist ein technisches Pruefscript mit direkter SQLite-/app.sqlite-Kopplung.

Bewertung:

- Diese direkte Kopplung ist aktuell akzeptiert, weil SQLite produktiv aktiv ist.
- Fuer echte MySQL-/MariaDB-Faehigkeit muessen diese Module schrittweise auf `backend/core/database.js` oder passende Helper migriert werden.
- Keine grossen Komplettumbauten. Die Umstellung muss modulweise erfolgen.

## Gefundene SQLite-spezifische Konstrukte

Der Scan zeigt mehrere SQL-/SQLite-Konstrukte, die nicht direkt portabel sind:

```text
INTEGER PRIMARY KEY AUTOINCREMENT
INSERT OR IGNORE
ON CONFLICT(...)
PRAGMA table_info(...)
DatabaseSync
```

Bewertung:

- Diese Konstrukte duerfen nicht unkontrolliert in neue Module wandern.
- Bestehende Stellen duerfen nicht blind geaendert werden.
- Portabilitaet muss ueber zentrale Helper/Dialekt-Funktionen entstehen.

## Ziel: SQLite + MySQL + MariaDB

Das Projekt soll perspektivisch diese Adapterwerte unterstuetzen:

```text
DB_ADAPTER=sqlite
DB_ADAPTER=mysql
DB_ADAPTER=mariadb
```

SQLite bleibt Standard und Fallback.

MySQL und MariaDB sollen nicht als zwei komplett getrennte Codewelten gebaut werden. Stattdessen wird ein gemeinsamer MySQL-Family-Adapter geplant:

```text
backend/core/db_adapters/sqlite_adapter.js
backend/core/db_adapters/mysql_family_adapter.js
```

Interne Zielabbildung:

```text
sqlite  -> SQLite-Adapter
mysql   -> MySQL-Family-Adapter
mariadb -> MySQL-Family-Adapter
```

## Treiber-Entscheidung

Noch nicht installieren in diesem STEP.

Spaetere Kandidaten:

```text
mysql2
mariadb
```

Pragmatische Empfehlung fuer den spaeteren ersten Produktivversuch:

```text
mysql2
```

Grund:

- weit verbreitet im Node.js-Umfeld
- Promise-/Pool-Unterstuetzung
- funktioniert typischerweise mit MySQL und MariaDB
- gute Dokumentations- und Beispiel-Lage

Die finale Treiberwahl wird erst getroffen, wenn die Adapter-Struktur und die ersten Modul-Portierungen vorbereitet sind.

## Geplante zentrale DB-Helper

`backend/core/database.js` sollte schrittweise um Dialekt-/SQL-Helfer erweitert werden, ohne bestehendes SQLite-Verhalten zu brechen.

Sinnvolle Ziel-Helfer:

```text
database.autoincrementPrimaryKey()
database.insertIgnore(...)
database.upsert(...)
database.columnExists(...)
database.ensureSchema(...)
database.transaction(...)
database.getDialect()
database.getAdapter()
```

Ziel:

Module sollen nicht mehr direkt schreiben muessen:

```sql
INTEGER PRIMARY KEY AUTOINCREMENT
INSERT OR IGNORE
ON CONFLICT(...)
PRAGMA table_info(...)
```

sondern zentrale Funktionen nutzen.

## Sichere Reihenfolge fuer weitere STEPs

### Phase 1 - Dokumentation und Architektur

Dieser STEP.

Ergebnis:

- Ist-Stand dokumentiert.
- Direkte SQLite-Kopplungen bekannt.
- Zielarchitektur fuer SQLite/MySQL/MariaDB festgelegt.

### Phase 2 - Kleine Modul-Portierungen

Nicht mit den groessten Modulen anfangen.

Empfohlene Reihenfolge:

```text
1. kofi.js
2. tipeee.js
3. twitch.js
```

Grund:

- kleiner als Alert/Tagebuch/Todo
- gute Testbarkeit
- weniger Risiko fuer zentrale Stream-Funktionen

### Phase 3 - Mittlere Modul-Portierungen

```text
sound_system.js
dashboard_auth.js
```

Diese Module sind wichtiger und duerfen nur mit guter Testabdeckung angepasst werden.

### Phase 4 - Grosse Module

```text
tagebuch.js
todo.js
alert_system.js
challenge.js
```

Diese Module sind produktiv/relevant und sollten nicht als erster Testfall fuer DB-Portabilitaet verwendet werden.

### Phase 5 - Adapter-Struktur und Treiber

Erst wenn genug DB-Zugriffe ueber `backend/core/database.js` laufen:

```text
backend/core/db_adapters/sqlite_adapter.js
backend/core/db_adapters/mysql_family_adapter.js
```

Dann erst:

```text
package.json -> mysql2 oder mariadb
```

## Bewusst nicht gemacht

In diesem STEP wurde nichts am laufenden System geaendert.

Nicht geaendert:

```text
backend/core/database.js
backend/modules/sqlite_core.js
backend/modules/*.js
package.json
package-lock.json
config/*.json
data/sqlite/app.sqlite
.env
```

Keine DB-Migration.

Keine neue Datenbank.

Kein MariaDB-/MySQL-Treiber.

Kein Live-System-Eingriff.

## Neue verbindliche Arbeitsregel

Fuer neue DB-Logik gilt ab diesem STEP:

```text
Neue DB-Zugriffe nicht direkt an backend/modules/sqlite_core.js koppeln, wenn backend/core/database.js oder ein vorhandener Helper genutzt werden kann.
```

Bestehende direkte `sqlite_core`-Nutzung wird nicht blind ersetzt, sondern modulweise und testbar portiert.

## Minimaltests fuer diesen STEP

Da keine Code-Aenderung enthalten ist:

```powershell
cd D:\Git\stream-control-center
git diff --check
```

Nach dem Entpacken und vor Commit kann zusaetzlich geprueft werden:

```powershell
git diff -- project-state docs/current
```

## Naechster sinnvoller STEP

Empfohlen:

```text
STEP208 - database.js Dialekt-/SQL-Helper vorbereiten
```

Alternativ, wenn zuerst ein reales Modul portiert werden soll:

```text
STEP208 - kofi.js von sqlite_core auf backend/core/database.js umstellen
```

Empfehlung:

Zuerst `backend/core/database.js` um kleine, rueckwaertskompatible Dialekt-Helfer erweitern. Danach `kofi.js` oder `tipeee.js` als erste konkrete Modul-Portierung.
