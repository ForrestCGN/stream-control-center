# STEP242 - DeathCounter Dashboard-Basis

Stand: 2026-05-11

## Ziel

DeathCounter V2 bekommt eine erste Dashboard-Basis im Control-Center.

## Geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
```

## Funktionen im Dashboard

```text
- Modulregistrierung unter Community / DeathCounter
- DeathCounter-Overlay-Link
- Übersicht mit Status, aktuellem Spiel, Overlay-Status, @-Pflicht, Chat-Ausgabe
- Spieler-/Count-Tabelle aus bestehender API
- einfache Steuerung: Overlay show/hide/toggle/reset
- sichtbaren Spieler ersetzen
- manuell +1 / -1 für vorhandene Spieler
- DB-Settings aus deathcounter_settings anzeigen und speichern
- Textvarianten aus module_text_variants / module deathcounter anzeigen und speichern
- Varianten hinzufügen
- Integration-Check anzeigen
```

## Bewusst nicht geändert

```text
backend/modules/deathcounter_v2.js
app.sqlite als Datei
DeathCounter-Counts / JSON-State
DeathCounter-Overlay-Design
Streamer.bot-Actions
```

## Technische Hinweise

- Das Modul nutzt nur Backend-APIs.
- Es greift nicht direkt auf SQLite oder Dateien zu.
- `htdocs/dashboard/app.js` wurde bewusst nicht geändert. Das Dashboard-Modul registriert sich selbst nach dem Laden und aktiviert den vorhandenen DeathCounter-Katalogeintrag.
- Chat-Ausgabe wird bei Dashboard-Steueraktionen über `sendChat=0` unterdrückt.

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/admin/settings" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/admin/texts" | ConvertTo-Json -Depth 40
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 40
```

Dashboard prüfen:

```text
http://127.0.0.1:8080/dashboard/
Community -> DeathCounter
```

## Ergebnis

DeathCounter ist dashboardseitig vorbereitet. Die nächsten Schritte sind größere Statistikansichten, dann später vorsichtige Count-/Event-DB-Migration und danach Overlay-Design-Refresh.
