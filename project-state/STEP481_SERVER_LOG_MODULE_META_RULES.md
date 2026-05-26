# STEP481 - Server-Log / Modul-Meta / EventBus-Monitoring-Regeln

Datum: 2026-05-26

## Ziel

Doku-/Regelwerks-Erweiterung für aussagekräftigere Node-Server-Logs und spätere EventBus-Überwachung.

## Geändert

- `project-state/GENERAL_PROJECT_PROMPT.md` erweitert.
- `docs/current/PROJECT_WORKING_RULES.md` erweitert.
- `docs/current/SERVER_LOG_MODULE_LOADING_RULES_2026-05-26.md` neu erstellt.
- `docs/modules/README.md` um Meta-/Server-Log-/EventBus-Hinweise ergänzt.
- `docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md` ergänzt.
- Projektstatus/Changelog/Files/NEXT_STEPS/TODO aktualisiert.

## Bewusst nicht geändert

- Kein `backend/server.js` geändert.
- Keine Module geändert.
- Keine EventBus-Codeänderung.
- Keine Dashboardänderung.
- Keine Datenbankänderung.

## Technischer Wunsch für später

Der Node-Server soll beim Start pro Modul kompakt loggen:

```text
[module] loading: <file>
[module] loaded: <name> v<version> routePrefix=<prefix> status=ok
[module] skipped: <file> reason=<reason>
[module] failed: <file> error=<message>
[server] modules loaded: <ok> ok, <skipped> skipped, <failed> failed
```

## Nächster möglicher Code-STEP

`STEP482_SERVER_MODULE_LOGGING_AND_META`

Vor Umsetzung zuerst prüfen:

- `backend/server.js`
- `backend/modules/communication_bus.js`
- vorhandene Modul-Exports und Versionsmuster
