# CURRENT CHAT HANDOFF – EVS50.3 Points-Check Insert-Fix

Stand: 2026-06-18

## Zweck

Fix fuer EVS50.2: Der Dashboard-Test `points-check` konnte das frische kombinierte Testevent nicht anlegen, weil `stream_events_events.scoring_config_json` in der produktiven Tabelle `NOT NULL` ist.

## Geaendert

Datei:

```text
backend/modules/stream_events.js
```

Aenderung:

- `createDashboardEventTestEvent()` schreibt jetzt alle Pflichtfelder der Tabelle `stream_events_events`.
- Ergaenzt wurden:
  - `scoring_config_json`
  - `settings_json`
  - `created_by`
  - `started_at`
  - `finished_at`
  - `cancelled_at`
- Modulversion auf `0.5.64` gesetzt.
- Modulbuild auf `STEP_EVS50_3_POINTS_CHECK_INSERT_FIX` gesetzt.

## Nicht geaendert

- Keine produktiven DB-Daten geaendert.
- Keine Tabellen ersetzt.
- Keine Ranking-/Punktelogik veraendert.
- Keine Dashboard-UI veraendert.
- Keine Sound-/Text-Runtime veraendert.

## Test danach

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "EVS50.3 Points-Check Insert-Fix"

node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/test/run?confirm=1&step=points-check" -Method Post -Body (@{} | ConvertTo-Json) -ContentType "application/json"
$r.userStats.user | Select-Object userLogin,totalPoints,soundPoints,phrasePoints,wordPoints | Format-List
$r.ranking.rows | Select-Object rank,userLogin,points | Format-Table -AutoSize
```

## Erwartung

- Status zeigt `moduleVersion 0.5.64` und `moduleBuild STEP_EVS50_3_POINTS_CHECK_INSERT_FIX`.
- `points-check` laeuft ohne `NOT NULL constraint failed`.
- ForrestCGN bekommt Sound- und Satz-/Text-Punkte.
- Ranking zeigt die addierte Summe.
- Im Dashboard unter `Aktuelles Event` ist ForrestCGN anklickbar und die Punkte-Historie sichtbar.
