# STEP365_ALERT_RECONNECT_REMAINING_DURATION

## Anlass
STEP360 hat den laufenden Alert bei Overlay-Reconnect korrekt erneut gesendet, ohne Sound/TTS/Queue zu verändern.
Im Praxistest zeigte sich aber: Wird die OBS-Browserquelle ein- oder zweimal per Cache/Refresh neu geladen, läuft die visuelle Anzeige länger als der Sound.

## Ursache
Der Reconnect-Resend hat bisher den kompletten Alert erneut gesendet. Das Overlay behandelt `event: play` als neue Anzeige und startet den visuellen Timer wieder mit der vollen `durationMs`, während Sound/TTS nicht neu gestartet werden. Dadurch kann die Anzeige den Sound deutlich überholen.

## Änderung
`backend/modules/alert_system.js`

- `MODULE_STEP` von `360` auf `365` erhöht.
- Neue Funktion `buildReconnectOverlayAlert(event)` ergänzt.
- Reconnect-Replay berechnet jetzt die Restlaufzeit aus:
  - `event.started_at`
  - `event.effectiveDurationMs` / Overlay-Dauer
  - aktueller Backend-Zeit
- Beim Overlay-Reconnect wird nicht mehr die volle Alert-Dauer gesendet, sondern:
  - `alert.durationMs = remainingMs`
  - zusätzlich: `originalDurationMs`, `elapsedMs`, `remainingMs`, `startedAt`, `expectedEndsAt`, `reconnectReplay`, `replayTimingSource`
- Wenn die Alert-Dauer bereits abgelaufen ist, wird kein neuer Replay mehr gesendet.
- Recovery-Status speichert nun `remainingMs`, `elapsedMs`, `totalDurationMs`.

## Nicht geändert
- Kein Sound-System-Umbau.
- Kein Sound/TTS-Neustart.
- Keine Queue-Änderung.
- Keine Dashboard-Änderung.
- Keine DB-Migration.
- Kein Wechsel von `legacy` auf Bus-Modus.

## Erwartetes Verhalten
Wenn das Alert-Overlay während eines laufenden Alerts neu lädt:

- Anzeige kommt zurück.
- Sound/TTS startet nicht doppelt.
- Anzeige läuft nur noch für die verbleibende Restzeit.
- Mehrfaches Reloaden verlängert den Alert nicht mehr künstlich.

## Test
```powershell
cd D:\Git\stream-control-center
node --check backend\modules\alert_system.js
```

Danach Backend neu starten und den OBS-Test wiederholen:

1. Längeren Alert starten.
2. Während der Alert läuft OBS-Alert-Browserquelle 1-2x aktualisieren.
3. Erwartung: Anzeige endet ungefähr mit dem ursprünglichen Alert-Ende, nicht mit voller Dauer ab letztem Reload.
4. Status prüfen: `alertStep = 365`.
