# Module Versioning Standard

Status: verbindliche Projektregel ab STEP278I

## Grundregel

Alle neuen Module und größeren Modulumbauten müssen eine feste Modulversion besitzen.

`STEP` und `version` haben unterschiedliche Aufgaben:

```text
STEP    = Projekt-/Umbau-Historie
Version = technischer Modulstand zur Identifikation
```

Beides bleibt erhalten.

## Pflicht für neue Module

Jedes neue Modul soll am Anfang eine `MODULE_META`-Konstante besitzen:

```js
const MODULE_META = {
  name: 'modulname',
  version: '0.1.0',
  build: 'STEPxxx',
  description: 'Kurze Modulbeschreibung'
};
```

Wenn ein Modul Teil eines größeren Cores ist, zusätzlich:

```js
coreName: 'communication_core',
coreVersion: '0.3.0'
```

## Pflicht für Status-Ausgaben

Status- und Test-Routen sollen mindestens ausgeben:

```json
{
  "module": "modulname",
  "moduleVersion": "0.1.0",
  "moduleBuild": "STEPxxx"
}
```

Wenn vorhanden zusätzlich:

```json
{
  "coreName": "communication_core",
  "coreVersion": "0.3.0"
}
```


## Startup-Logs

Neue Module sollen beim Start ihren Modulnamen, ihre Version und ihren Build ausgeben.

Standard:

```text
[modulname] v0.1.0 / STEPxxx ready
```

Beispiele:

```text
[communication_bus] v0.3.0 / STEP278H API routes and WS handler registered
[audit_log] v0.2.0 / STEP278E API routes registered
```

## Versionierung

Empfohlene Semantik im Projekt:

```text
0.1.0 = erster vorbereiteter Modulstand / Helper Core
0.2.0 = erste API-/Status-Anbindung
0.3.0 = erste Client-/WS-/Overlay-Anbindung
0.4.0 = weitere größere Erweiterung
1.0.0 = stabiler produktiver Stand
```

Fixes erhöhen die Patch-Version:

```text
0.3.1
0.3.2
```

Neue Features erhöhen die Minor-Version:

```text
0.4.0
0.5.0
```

## Aktueller Kommunikations-/Audit-Stand

```text
Communication Core:          v0.3.0
helper_communication.js:     v0.3.0 / STEP278F
communication_bus.js:        v0.3.0 / STEP278H

Security Context Core:       v0.1.0
helper_security_context.js:  v0.1.0 / STEP278C

Audit Core:                  v0.2.0
helper_audit_log.js:         v0.1.0 / STEP278D
audit_log.js:                v0.2.0 / STEP278E
```

## Wichtig

Diese Regel gilt für alle zukünftigen Module, nicht nur für Communication/Audit.
