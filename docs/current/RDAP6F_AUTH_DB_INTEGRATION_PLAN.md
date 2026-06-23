# RDAP6F Auth DB Integration Plan

Stand: 2026-06-23  
Status: Planungsstep, keine Umsetzung

## Zweck

RDAP6F legt fest, wie die in RDAP6C vorbereiteten und in RDAP6D/RDAP6E erfolgreich auf Testdatenbank geprueften Auth-/Rollen-/Gruppen-/Permission-/Session-/Lock-/Audit-Tabellen spaeter sauber in die echte Remote-Modboard-/Webserver-Struktur eingebunden werden.

Dieser Step ist ausdruecklich nur Planung und Dokumentation.

## Grundlage

Belastbare Basis:

```text
GitHub/dev
remote-modboard/backend/*
db/rdap6c/*
db/rdap6d/*
docs/current/RDAP6E_TEST_DB_RESULT_EVALUATION_2026-06-23.md
project-state/*
```

Der RDAP6D-Testlauf wurde erfolgreich auf separater Testdatenbank ausgefuehrt:

```text
Server: web.cgn.community
Testpfad: /root/rdap6-test/stream-control-center
Test-DB: scc_rdap6_test
Ergebnis: bestanden
Produktivlauf freigegeben: nein
```

## Aktueller Remote-Modboard-Stand

Der produktive Remote-Modboard-Basisdienst laeuft read-only:

```text
Service: scc-remote-modboard.service
Public API: https://mods.forrestcgn.de/api/remote/
Intern: 127.0.0.1:3010
Service-User: sccremote
```

Vorhandene Routen:

```text
GET /api/remote/health
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/health?db=1
```

Aktuelle Code-Struktur:

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/health.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/security/safety.js
```

## Ziel-DB-Entscheidung fuer RDAP6F

RDAP6F legt noch keine produktive Migration frei.

Planentscheidung:

```text
scc_rdap6_test bleibt reine Testdatenbank.
Die echte Remote-Modboard-/Auth-DB ist die bestehende Webserver-DB c3stream_control.
DB-User bleibt c1stream_control.
```

Begruendung:

- Der laufende Remote-Modboard-Service ist bereits fuer diese Webserver-DB konfiguriert.
- `health?db=1` bestaetigt den lesenden DB-Zugriff auf die konfigurierte DB.
- Keine zweite produktive Parallel-DB soll entstehen.
- Die lokale SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite` bleibt unangetastet.

Wichtig:

```text
Diese Entscheidung ist nur die Zielplanung.
Sie ist keine Freigabe fuer SQL-Import, Migration oder Auth-Aktivierung.
```

## Gewuenschte Integrationsrichtung

Die bestehende Remote-Modboard-Struktur wird erweitert, nicht ersetzt.

Geplante Erweiterung in spaeterem Step:

```text
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/routes/auth-model.routes.js
```

Alternativ koennen Dateinamen im spaeteren Umsetzungsstep noch angepasst werden, wenn der echte Code-Stand dafuer spricht. Wichtig ist: vorhandene `config.service.js` und `db-health.service.js` bleiben Grundlage.

## DB-Zugriffsschicht

Der spaetere DB-Zugriff soll zentral ueber einen kleinen DB-Service laufen.

Plan:

```text
db.service.js
- nutzt mysql2/promise
- nutzt config.database aus config.service.js
- nutzt process.env.DB_PASSWORD nur serverseitig
- erzeugt kurze Connections oder spaeter Pool
- setzt charset utf8mb4
- exportiert nur sichere Query-/Connection-Helper
```

Nicht erlaubt:

```text
kein DB-Passwort im Repo
kein DB-Passwort im Frontend
keine Secrets in API-Antworten
keine freien SQL-Statements aus Requests
keine produktiven Writes in RDAP6G
```

## Read-only Auth-/Permission-Modell

Der naechste technische Schritt nach RDAP6F sollte read-only bleiben.

Vorgeschlagener Folgeschritt:

```text
RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER
```

Ziel von RDAP6G:

```text
Remote-Modboard kann Auth-/Rollen-/Gruppen-/Permission-Tabellen lesen und Status-/Modellrouten ausgeben.
```

Geplante Read-only-Routen fuer RDAP6G:

```text
GET /api/remote/auth/model
GET /api/remote/auth/roles
GET /api/remote/auth/groups
GET /api/remote/auth/permissions
GET /api/remote/auth/module-permissions
GET /api/remote/auth/db-status
```

Diese Routen duerfen keine User anlegen, keine Sessions erzeugen, keine Locks schreiben und keine Audit-Eintraege schreiben.

## Auth bleibt deaktiviert

RDAP6F und RDAP6G aktivieren kein Login.

Weiterhin aus:

```text
kein Twitch OAuth Login
keine Session-Erstellung
keine Cookies
keine produktive Permission-Entscheidung fuer echte Aktionen
keine Schreibfunktionen
keine Agent-Actions
```

Auth darf erst aktiviert werden, wenn separat geplant und beschlossen ist:

```text
Login-Flow
Callback-/Redirect-URLs
Session-Storage
Cookie-Sicherheit
CSRF-/State-Pruefung
Logout
Session-Rotation
Rechteberechnung
Audit fuer Login-/Security-Ereignisse
```

## Rollen und Gruppen

Fuehrende Regel:

```text
Rollen und Gruppen bleiben getrennt.
sound_profi ist keine Rolle.
sound_profi ist Gruppe/Marker.
sound_profi vergibt selbst keine globalen Rechte.
```

Twitch-Status ist nicht automatisch Dashboard-Rolle:

```text
broadcaster/streamer -> Basiszugang moeglich
mod                  -> Basiszugang moeglich
vip                  -> kein Dashboard-Basiszugang
```

Manuelle Rollen:

```text
owner
admin
lead_mod
mod
```

Gruppen/Marker:

```text
sound_profi
event_helfer spaeter optional
medien_helfer spaeter optional
```

Konkrete Modulrechte kommen aus der Modulmatrix, nicht aus Gruppen allein.

## Permission-Entscheidung spaeter

Die spaetere serverseitige Rechtepruefung soll mindestens diese Quellen beruecksichtigen:

```text
User aktiv?
Twitch-Identitaet bekannt?
Twitch-Status fuer Basiszugang?
Manuelle Rollen?
Gruppen/Marker?
Modulmatrix?
User-Overrides?
```

Reihenfolge als Plan:

```text
1. System-/Owner-Sonderfaelle minimal halten
2. User aktiv/inaktiv pruefen
3. Basiszugang pruefen
4. Rollen-Permissions berechnen
5. Modulmatrix fuer Rollen/Gruppen/User anwenden
6. User-Overrides anwenden
7. final erlauben oder ablehnen
8. Entscheidung auditierbar machen
```

Frontend darf nur anzeigen/verstecken. Sicherheit entscheidet immer Backend.

## Locks und Audit

Locks und Audit bleiben in RDAP6F/RDAP6G read-only bzw. geplant.

Spaetere Schreibfunktionen duerfen erst kommen, wenn gilt:

```text
Speichern nur mit gueltigem Lock
Lock hat Heartbeat und Timeout
Owner/Admin-Uebernahme auditpflichtig
jede kritische Aenderung schreibt Audit
Audit speichert keine Secrets
Audit-Retention ist konfigurierbar
```

## Migration zur echten DB

Eine produktive Migration in `c3stream_control` ist ein eigener spaeterer Step.

Voraussetzungen:

```text
Backup der Ziel-DB
Restore-Weg geprueft
SQL-Dateien final geprueft
Validation Queries final geprueft
separates Go von Forrest
nur ein Arbeitsort pro Schritt
keine lokale SQLite-Aenderung
```

Vorgeschlagener spaeterer Step:

```text
RDAP6H_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
```

Erst danach, mit weiterem separatem Go:

```text
RDAP6I_AUTH_DB_PRODUCTION_MIGRATION_EXECUTION
```

## Nicht-Aenderungen in RDAP6F

```text
keine SQL-Ausfuehrung
keine produktive MariaDB-Migration
keine lokale SQLite-Aenderung
kein Backend-Code
kein npm install
kein Service-Neustart
kein nginx-/ISPConfig-Eingriff
kein Login/Auth-Code
keine Sessions
keine Cookies
keine Remote-Writes
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets im Repo/Frontend/Chat
keine sound_profi-Rolle
keine Rollenzusammenfuehrung
```

## Empfohlene naechste Schritte

### 1. RDAP6G planen und bauen: read-only DB-Layer

Ziel:

```text
Remote-Modboard bekommt eine sichere interne DB-Leseschicht fuer Auth-Modell-Daten.
```

Aenderungen dann voraussichtlich:

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/routes/auth-model.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

Nur wenn Code wirklich geaendert wird, vorher echte Dateien vollstaendig pruefen und Scope nennen.

### 2. Danach Test auf Webserver

Nur read-only:

```text
/api/remote/auth/db-status
/api/remote/auth/model
```

### 3. Danach erst Produktiv-Migration planen

Kein SQL-Produktivlauf ohne Backup-/Restore-Plan und separates Go.

## Entscheidung

RDAP6F ist abgeschlossen, wenn diese Planungsdoku im Repo liegt und die Projektstatus-Dokus auf folgenden naechsten Schritt zeigen:

```text
RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER
```

RDAP6F gibt keine Authentifizierung und keine Migration frei.
