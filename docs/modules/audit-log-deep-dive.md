# Audit Log Deep Dive

Stand: 2026-05-26  
Quelle: `backend/modules/audit_log.js` aus dem aktuellen Backend-Upload.  
Kategorie: `core-status`

## Zweck

Audit-Log-Status- und Recent/Test-Routen.

## Datei

```text
backend/modules/audit_log.js
```

## erkannte Version / Runtime-Kennung

- `0.2.0`

## Exporte / Einstieg

- `MODULE_META`
- `init`

## API-Routen

| Methode | Route |
|---|---|
| `GET` | `/api/audit/status` |
| `GET` | `/api/audit/recent` |
| `GET` | `/api/audit/test` |
| `POST` | `/api/audit/clear-memory` |
| `GET` | `/api/audit/clear-memory` |

## erkannte Hauptfunktionen / interne Bereiche

- `asInt`
- `boolParam`
- `buildFilters`
- `cleanString`
- `contextFromReq`
- `getLogger`
- `init`
- `loadAuditConfig`
- `publicQueryDetails`

## erkannte Datenbanktabellen

- Keine Datenbanktabellen per SQL-/Konstanten-Analyse erkannt.

## erkannte Config-/Runtime-Dateien

- `audit_log.json`

## interne Abhängigkeiten

- `./helpers/helper_audit_log`
- `./helpers/helper_config`
- `./helpers/helper_core`
- `./helpers/helper_security_context`

## Status-/State-Themen

- Runtime-State wurde nur aus der Datei abgeleitet; Live-Werte müssen über die jeweiligen Statusrouten geprüft werden.
- Bei Modulen mit Queue, Timer, WebSocket, Scheduler oder Provider-Webhooks müssen Start/Stop/Reload-Flows separat getestet werden.
- Bei Modulen mit Datenbanktabellen gelten weiterhin nur additive Migrationen und niemals Austausch der produktiven SQLite.

## Risiken / Regeln

- Zentrale Nachvollziehbarkeit für Dashboard-/Admin-Aktionen; Retention/Filter prüfen.
- Keine Funktionalität entfernen.
- Keine Secrets, Tokens, `.env`, Datenbanken oder Backups committen.
- Dashboard-Zugriff immer über Backend-APIs, nicht direkt auf SQLite oder Dateien.
- Bei unklarer Live-Abweichung zuerst echte Datei aus `D:\Git\stream-control-center` oder `D:\Streaming\stramAssets` prüfen.

## Sinnvolle Tests

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,ok,enabled,moduleVersion,lastError
```

Zusätzlich je nach Modul die oben gelisteten Status-/Routes-/Integration-Check-Routen im Browser oder per `Invoke-RestMethod` prüfen.

## Offene Punkte

- Modul bei nächster Facharbeit gegen Live-Repo prüfen, nicht nur gegen ZIP-Stand.
- Fehlende Versionskennung nach Möglichkeit später ergänzen, ohne Runtime-Verhalten zu ändern.
- Wenn Dashboard-Anbindung existiert: Dashboard-Dateien separat dokumentieren und mit API-Routen abgleichen.
