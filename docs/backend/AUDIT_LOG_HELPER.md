# Audit Log Helper

## Version

```text
Audit Core:          v0.2.0
helper_audit_log.js: v0.1.0 / STEP278D
audit_log.js:        v0.2.0 / STEP278E
```

## Status

Audit Log besitzt aktuell:

- Helper Core
- Memory Buffer
- Recent Filter
- Status/Test/Clear-Memory API
- Security Context Snapshots
- sensible Maskierung
- optionale File-Sink-Vorbereitung

## Modul-Metadaten

`audit_log.js` gibt in Status-Ausgaben aus:

```json
{
  "module": "audit_log",
  "moduleVersion": "0.2.0",
  "moduleBuild": "STEP278E",
  "coreName": "audit_core",
  "coreVersion": "0.2.0"
}
```

`helper_audit_log.js` exportiert `MODULE_META`.

## Bewusst nicht umgesetzt

- keine produktive Pflichtintegration
- keine Dashboard-Seite
- keine SQLite-/MariaDB-Migration
- File-Logging bleibt standardmäßig deaktiviert
