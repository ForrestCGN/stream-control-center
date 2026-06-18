# Shot-Alarm

Stand: 2026-06-18  
STEP: `SHOT-ALARM-1`  
Backend-Version: `0.1.1`  
Build: `STEP_SHOT_ALARM_1_PAYMENT_50_50`

## Zweck

`shot_alarm` ist ein neues Events-Modul im `stream-control-center`. Es wertet Support-Events aus und löst nach konfigurierbaren Regeln einen Shot-Alarm für Engel & Roxxy aus.

Das Modul fragt Twitch nicht direkt ab. Es konsumiert vorhandene normalisierte Events aus `twitch_events` über den Communication Bus.

## Aktueller Scope STEP 1

Enthalten:

- Backend-Modul `backend/modules/shot_alarm.js`
- Config `config/shot_alarm.json`
- Dashboard-Modul `htdocs/dashboard/modules/shot_alarm.js`
- Dashboard-CSS `htdocs/dashboard/modules/shot_alarm.css`
- Overlay `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`
- Dashboard-Einbindung in `htdocs/dashboard/app.js`
- Dashboard-HTML-Einbindung in `htdocs/dashboard/index.html`

Nicht geändert:

- `twitch_events.js`
- `twitch.js`
- `loyalty.js`
- `alert_system.js`
- `kofi.js`
- `tipeee.js`
- `sound_system.js`
- produktive SQLite-Datenbank

## Event-Quellen

Konsumierte Bus-Events:

- `twitch.sub.received`
- `twitch.resub.received`
- `twitch.subgift.received`
- `twitch.giftbomb.received`
- `twitch.cheer.received`
- vorbereitet: `payment.kofi.received`
- vorbereitet: `payment.tipeee.received`

Ko-fi/Tipeee sind eigene Module. In STEP 1 werden diese Module nicht verändert. Die Payment-Regel ist im Shot-Alarm vorbereitet, greift produktiv aber erst, wenn neutrale Payment-Bus-Events vorhanden sind.

## Fachregeln

### Twitch Subs

- Einzel-Sub / Resub / einzelner GiftSub: normal 20 % auf 1 Shot
- laufender Einzel-Zähler nur für einzelne Sub-/Resub-/GiftSub-Events
- jeder 5. einzelne Sub/Resub/GiftSub: 50 % auf 1 Shot
- jeder 10. einzelne Sub/Resub/GiftSub: 100 % auf 1 Shot
- 5er Sub-Bombe: 50 % auf 1 Shot
- 10er Sub-Bombe: 100 % auf 1 Shot
- größere Bomben: pro voller 10 Subs = 1 sicherer Shot
- 100er Bombe: 10 sichere Shots

Restregel bei Bomben:

- 15er Bombe: 1 sicherer Shot + 50 % auf 1 weiteren Shot
- 25er Bombe: 2 sichere Shots + 50 % auf 1 weiteren Shot
- Rest 1-4 löst keine Bombenwertung aus

### Bits Default

Konfigurierbare Defaults:

- 1000 Bits: 50 % auf 1 Shot
- 10000 Bits: 100 % auf 1 Shot
- unter 1000 Bits: kein Shot

### Ko-fi / Tipeee vorbereitet

- je volle 10 EUR = 50/50 Chance auf 1 Shot
- 9,99 EUR = 0 Shots
- 10 EUR = 50/50 auf 1 Shot
- 25 EUR = zwei 10-EUR-Bloecke, jeweils 50/50
- 100 EUR = zehn 10-EUR-Bloecke, jeweils 50/50

## Resub-Dedupe

Loyalty löst Subscribe/Resub-Kollisionen per nachträglicher Kompensation. Für Shot-Alarm ist das nicht geeignet, weil Shots nicht rückgängig gemacht werden können.

Shot-Alarm nutzt deshalb einen Pending-Puffer:

- `twitch.sub.received` wird standardmäßig 60 Sekunden gepuffert.
- Kommt innerhalb dieser Zeit ein passendes `twitch.resub.received`, wird der Pending-Sub verworfen.
- Der Resub wird verarbeitet.
- Kommt kein Resub, wird der Sub nach Ablauf verarbeitet.

Config:

```json
"dedupe": {
  "subscribeResubBufferEnabled": true,
  "subscribeResubBufferMs": 60000
}
```

## Routes

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/config`
- `GET /api/shot-alarm/history`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/flush-pending`
- `POST /api/shot-alarm/reset-state`

## Overlay

URL:

```text
http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html
```

Debug/Test:

```text
http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?debug=1
```

Das Overlay hört auf WebSocket-Meldungen:

- `type = shot_alarm.show`
- alternativ Bus-Envelope `channel=shot_alarm`, `action=overlay.show`

## Sound

STEP 1 nutzt das vorhandene Sound-System über:

```text
POST /api/sound/play
```

Default-Sound ist ein generierter Beep, damit das Modul ohne neue Audiodateien testbar ist. Später kann ein echter Soundpool in der Config/Dashboard-Verwaltung ergänzt werden.

## Dashboard

Pfad:

```text
Dashboard → Control → Shot-Alarm
```

Funktionen:

- Status/KPIs
- Basis-Config
- Twitch-Regeln
- Ko-fi/Tipeee-Regeln vorbereitet
- Testbuttons für Sub, Resub, GiftSub, 5er/10er/100er Bombe, Bits, Ko-fi, Tipeee
- manueller Shot-Alarm
- Pending-Subs flushen
- Runtime-Verlauf zurücksetzen
- Verlauf anzeigen

## Tests

Nach Einspielen:

```powershell
node -c .\backend\modules\shot_alarm.js
node -c .\htdocs\dashboard\modules\shot_alarm.js
```

Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,enabled,busAvailable,registeredOnBus,routeCount,lastError
```

Overlay öffnen:

```text
http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?debug=1
```

Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/test" -Method POST -ContentType "application/json" -Body '{"type":"gift_bomb","total":100}'
Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/test" -Method POST -ContentType "application/json" -Body '{"type":"kofi","amountEur":25}'
```

## Nächste Schritte

1. Live-/Dashboard-Test mit Overlay und Sound.
2. Entscheiden, ob 100er Bombe als eine Overlay-Karte mit „10 Shots“ reicht oder ob 10 Einzelkarten/Sounds gewünscht sind.
3. Echten Soundpool einrichten.
4. Ko-fi/Tipeee sauber über neutrale Payment-Bus-Events anbinden.
5. Optional: DB-basierte History, wenn Runtime-Verlauf dauerhaft bleiben soll.
