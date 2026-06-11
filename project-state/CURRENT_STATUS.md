# CURRENT STATUS

Stand: STEP233 / Project Audit nach STEP232
Datum: 2026-06-11

## Zweck dieses Stands

Dieser Stand friert den aktuellen Projektzustand nach den Loyalty-/Gamble-Schritten und der problematischen Dashboard-Shell-Arbeit ein. Er dient als Audit-/Handoff-Punkt, nicht als neue Feature-Freigabe.

## Stabil bestätigt

### Loyalty / Punkte / Commands

- Node-Command-System ist aktiv und verarbeitet die Loyalty-Kommandos.
- `!punkte` / `!points` sind aktiv und liefern Antworten über `twitch_presence`.
- `!givepoints` ist aktiv und auf Mod+ beschränkt.
- `!setpoint` ist aktiv und auf Streamer/Owner beschränkt.
- Rechteprüfungen für Viewer/Mod/Streamer wurden in den STEP216/STEP217-Tests bestätigt.
- Chat-Ausgabe über `twitch_presence.sendChatMessage(...)` wurde bestätigt.

### Gamble Backend

- `!gamble` ist live aktiv.
- Gamble-Engine ist live aktiv.
- Prozent-Einsätze wie `!gamble 10%` sind bestätigt.
- Server-seitige Zufallsquelle `crypto.randomInt` wurde bestätigt.
- Strukturierte Gamble-Ergebnisse wurden bestätigt:
  - `bet`
  - `outcome`
  - `won`
  - `balanceBefore`
  - `balanceAfter`
  - weitere Ergebnisfelder
- `command_execution_log` enthält strukturierte Gamble-Daten.
- Testuser wurden nach den kontrollierten Tests wiederhergestellt.

### Gamble Dashboard APIs

- Readonly API bestätigt:
  - `GET /api/loyalty/games/gamble/dashboard-config`
- Write API bestätigt:
  - `POST /api/loyalty/games/gamble/dashboard-config`
- Audit API bestätigt:
  - `GET /api/loyalty/games/gamble/dashboard-audit`
- Rollen-/Rechteschutz wurde bestätigt:
  - Viewer wird mit HTTP 403 geblockt.
  - Streamer/Owner darf schreiben.
- Dryrun ohne Mutation wurde bestätigt.
- Echter Write + Restore wurde bestätigt.
- Audit-Tabelle bestätigt:
  - `loyalty_games_dashboard_audit`

### Dashboard Detailseite

- Standalone-Detailseite existiert:
  - `/dashboard/loyalty-gamble.html`
- HTTP-Test ergab Status 200.
- Route-Attribut ist vorhanden:
  - `data-dashboard-route="loyalty-gamble"`
- STEP231 Navigation/Routing wurde erfolgreich getestet.

## Versionen aus den bestätigten Tests

- `commands.js`: `0.2.3`, Build `LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP`
- `loyalty_games.js`: `0.2.7`, Build `STEP_LWG_6_9_GAMBLE_DASHBOARD_WRITE_API`

## Kritisch / nicht als stabile fachliche Basis verwenden

### STEP232 Dashboard-Shell-Integration

STEP232 wurde technisch getestet und meldete OK. Trotzdem wird STEP232 nicht als fachlich vertrauenswürdige Grundlage für weitere Dashboard-Arbeiten behandelt, weil der Arbeitsschritt auf ungeprüften Annahmen zur echten Dashboard-Struktur aufgebaut wurde.

Status STEP232:

- technisch: Dateien/Marker/HTTP-Check wurden getestet
- fachlich/prozessual: auditpflichtig
- nicht weiter darauf aufbauen, bevor die echte Dashboard-Struktur geprüft wurde

## Harte Arbeitsregel ab diesem Stand

Keine neuen Dashboard-Integrationen, keine Shell-Karten, keine Hauptdashboard-Änderungen und keine Komfort-Features, bevor folgende Dateien/Strukturen real geprüft wurden:

- `htdocs/dashboard/index.html`
- vorhandene Dashboard-Module unter `htdocs/dashboard/modules/`
- bestehende Navigation/Shell/Registry-Struktur
- `config/dashboard*.json`
- relevante project-state- und docs/current-Dateien

## Nicht geändert durch diesen Doku-Stand

- kein Backend-Code
- keine Dashboard-Code-Dateien
- keine Datenbank
- keine Runtime-Konfiguration
- keine Commands
- keine produktiven Flows
