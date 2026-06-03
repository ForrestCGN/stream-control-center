# CHANGELOG

## CAN-42.12b - Dashboard Hug Diagnostics Display Fix

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
```

Details:

- Neues read-only Dashboard-Ergänzungsscript `diagnostics_hug_display_fix.js` eingebunden.
- Das Script korrigiert ausschließlich die sichtbare Hug-Karte in `Admin > Diagnose`.
- Version wird aus `/api/hug/status` explizit als String aus `diagnostics.version`, `moduleVersion` oder `version` übernommen.
- `Routen` zeigt mindestens `1`, wenn keine Routenliste geliefert wird, aber die Statusroute `/api/hug/status` erreichbar ist.
- Keine produktive Hug-Funktion und kein Backend geändert.

Nicht geändert:

```text
Keine Hug-/Rehug-Ausführung geändert
Keine Chat-Ausgabe geändert
Keine Statusroute geändert
Keine DB-Migration ergänzt
Keine Funktionalität entfernt
```

Lokaler Syntax-Check im Chat:

```powershell
node --check htdocs/dashboard/modules/diagnostics_hug_display_fix.js
```

## CAN-42.12 - Hug Status Diagnostics Standard

- `backend/modules/hug.js` um standardisierten `diagnostics`-Block erweitert.
- Keine Hug-/Rehug-Ausführung, Chat-Ausgabe, Texteditor-Routen oder DB-Migration geändert.

## CAN-42.11 - Commands Status Diagnostics Standard

- `backend/modules/commands.js` um standardisierten `diagnostics`-Block erweitert.
- Keine Command-Ausführung, Trigger, Aliase, Permissions, Cooldowns oder DB-Migration geändert.
