# NEXT STEPS

Stand: RDAP6F_PREP_DOC_STATUS_SYNC  
Datum: 2026-06-23

## Aktueller Stand

Fertig und getestet:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
```

RDAP6E bestaetigt:

```text
Schema erfolgreich: ja
Seeds erfolgreich: ja
Validation Queries erfolgreich: ja
RDAP6D Testdatenbanklauf bestanden: ja
Produktivlauf freigegeben: nein
```

## Sofort naechster Schritt

```text
RDAP6F_AUTH_DB_INTEGRATION_PLAN
```

## Ziel RDAP6F

Planen, wie die getesteten Auth-/Rollen-/Gruppen-/Permission-/Session-/Lock-/Audit-Tabellen in die echte Remote-Dashboard-/Webserver-Struktur eingebunden werden.

RDAP6F darf noch keine Auth aktivieren, solange Login-/Session-Konzept und Ziel-DB nicht final klar sind.

## RDAP6F Scope

```text
- GitHub/dev und vorhandene RDAP6E-Doku pruefen
- aktuelle Webserver-/MariaDB-/Repo-Struktur pruefen
- Ziel-DB festlegen: Test-DB behalten, neue echte Dashboard-DB oder bestehende Remote-DB-Struktur
- minimale Backend-Anbindung planen
- Tabellen-/Helper-Zuständigkeit planen
- Login-/Session-Konzept als eigenen Folgeschritt vorbereiten
- Permission-Checks serverseitig planen
- Lock-/Audit-Grundregeln fuer spaetere Schreibfunktionen planen
```

## RDAP6F Nicht-Aenderungen

```text
keine produktive SQLite
keine Remote-Agent-Schreibaktionen
keine OBS-/Sound-/Overlay-Steuerung
keine Secrets
keine Rollenzusammenführung
keine sound_profi-Rolle
keine Auth-Aktivierung
keine produktiven Sessions
keine produktiven Agent-Actions
keine freie Shell-/Datei-/Prozesssteuerung
```

## Vor RDAP6F beachten

Nur EIN Arbeitsort pro Schritt.

Vor jedem Befehl klar sagen:

```text
Wo ausführen: PowerShell lokal ODER Server-Konsole ODER MariaDB-Konsole.
Was macht der Befehl?
Wann stoppen?
Welche Ausgabe soll Forrest schicken?
```

Maximal ein Befehlsblock pro Antwort. Danach auf Ausgabe warten.

## Erwartetes RDAP6F-Ergebnis

Eine Plan-/Entscheidungsdoku, noch kein Produktivcode:

```text
docs/current/RDAP6F_AUTH_DB_INTEGRATION_PLAN.md
```

Optional danach erst mit separatem Go:

```text
RDAP6G_AUTH_BACKEND_READONLY_DB_BRIDGE_PLAN
```

oder aehnlich, aber erst wenn RDAP6F sauber entschieden ist.
