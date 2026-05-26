# STEP483_SHOUTOUT_DASHBOARD_TABS

Datum: 2026-05-26

## Ziel

Das Shoutout-Dashboard im Control-Center wird in Tabs/Unterbereiche aufgeteilt, damit die Seite nicht mehr alle Bereiche gleichzeitig untereinander anzeigt.

## Betroffene Dateien

```text
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
docs/modules/clip-shoutout-vso-deep-dive.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/STEP483_SHOUTOUT_DASHBOARD_TABS.md
```

## Geändert

- Shoutout-Dashboard um Tab-State `activeTab` erweitert.
- Tabs ergänzt:
  - Übersicht
  - Queues
  - Statistik
  - Timeline
  - Settings/Test
- Bestehende Bereiche in Tab-Renderer aufgeteilt.
- Übersicht zeigt kompakten Kurzstatus, Statistik-Kurzwerte und letzte Timeline-Einträge.
- Queues-Tab enthält Display-Queue und Official-Queue inklusive bestehender Retry-/Remove-Aktionen.
- Statistik-Tab behält die bestehenden Filter und Tabellen.
- Timeline-Tab enthält die vollständige Timeline-Tabelle.
- Settings/Test-Tab enthält Testauslösung, Live-Gate und kompakte Settings-Anzeige.
- CSS für Tabs, Tab-Panel, kompakte Timeline und Settings-Facts ergänzt.
- Modul-Doku und Projektstatus aktualisiert.

## Bewusst nicht geändert

- Keine Backend-Logik geändert.
- Keine API-Routen geändert.
- Keine Datenbanktabellen geändert.
- Keine Config-Dateien geändert.
- Keine produktive Umstellung von `!vso` auf `!so`.
- Keine EventBus-Umstellung.
- Keine echte Settings-Speichern-UI ergänzt; Settings werden nur kompakt angezeigt.

## Tests

```bat
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\shoutout.js
```

Danach im laufenden System:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/timeline"
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/stats"
```

Dashboard prüfen:

```text
/dashboard/ öffnen -> Shoutout-System -> alle Tabs anklicken.
```

## Nächster sinnvoller Schritt

`STEP484_SHOUTOUT_INBOUND_EVENTSUB_LOGGING`

Ziel: Eingehende Twitch-Shoutouts separat loggen und später im Dashboard/statistisch anzeigen.
