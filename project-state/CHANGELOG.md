# CHANGELOG

## CAN-42.12 - Hug Status Diagnostics Standard

Geändert:

```text
backend/modules/hug.js
```

Details:

- `MODULE_VERSION` von `0.1.0` auf `0.1.1` erhöht.
- `MODULE_BUILD` mit `diagnostics-standard` ergänzt.
- `MODULE_META.build` ergänzt.
- `/api/hug/status` liefert zusätzlich `moduleVersion`, `moduleBuild`, `version`, `build` und einen standardisierten `diagnostics`-Block.
- `diagnostics` enthält `ok`, `health`, `module`, `version`, `build`, `schemaVersion`, `expectedSchemaVersion`, `schemaReady`, `configSource`, `textSource`, `database`, `counts`, `warnings`, `errors`, `lastError`.

Nicht geändert:

```text
Keine Hug-/Rehug-Ausführung geändert
Keine Chat-Ausgabe geändert
Keine Texteditor-Routen geändert
Keine Reload-/Admin-Routen entfernt
Keine DB-Migration ergänzt
Keine Funktionalität entfernt
```

Lokaler Syntax-Check im Chat:

```powershell
node --check backend/modules/hug.js
```

## CAN-42.11 - Commands Status Diagnostics Standard

- `backend/modules/commands.js` um standardisierten `diagnostics`-Block erweitert.
- Keine Command-Ausführung, Trigger, Aliase, Permissions, Cooldowns oder DB-Migration geändert.
