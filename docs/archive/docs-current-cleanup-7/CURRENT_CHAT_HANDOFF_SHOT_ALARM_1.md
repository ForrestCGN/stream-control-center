# Current Chat Handoff – Shot-Alarm STEP 1

Stand: 2026-06-18

## Neuer Stand

Neues Modul: `Shot-Alarm` / technisch `shot_alarm`.

STEP: `SHOT-ALARM-1`

Backend-Version: `0.1.1`  
Build: `STEP_SHOT_ALARM_1_BITS_BLOCKS`

Ziel: Support-Events aus dem vorhandenen Twitch-Events/Communication-Bus auswerten und nach Regeln Shot-Alarme für Engel & Roxxy auslösen.

## Gebaute Dateien

- `backend/modules/shot_alarm.js`
- `config/shot_alarm.json`
- `htdocs/dashboard/modules/shot_alarm.js`
- `htdocs/dashboard/modules/shot_alarm.css`
- `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/index.html`
- `docs/modules/shot_alarm.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SHOT_ALARM_1.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Wichtig

Nicht geändert wurden:

- Twitch-Events
- Loyalty
- Alerts
- Ko-fi
- Tipeee
- Sound-System
- produktive DB

Shot-Alarm hängt sich als Consumer an vorhandene Bus-Events.

## Finale Regeln

### Einzelne Sub-Events

Einzelne Events sind:

- Einzel-Sub
- Resub
- einzelner GiftSub

Nur diese einzelnen Events erhöhen den laufenden Einzel-Zähler.

Regel:

- normaler einzelner Sub/Resub/GiftSub: 20 % auf 1 Shot
- jeder 5. einzelne Sub/Resub/GiftSub: 50 % auf 1 Shot
- jeder 10. einzelne Sub/Resub/GiftSub: 100 % auf 1 Shot

### Sub-Bomben

Sub-Bomben werden separat bewertet und erhöhen den Einzel-Zähler nicht.

- 5er Sub-Bombe: 50 % auf 1 Shot
- 10er Sub-Bombe: 100 % auf 1 Shot
- größere Bomben: pro voller 10 Subs = 1 sicherer Shot
- 100er Bombe: 10 sichere Shots
- 5er-Rest bei größeren Bomben: 50 % auf 1 weiteren Shot

### Bits

- 1000 Bits: 50 % auf 1 Shot
- 10000 Bits: 100 % auf 1 Shot
- unter 1000 Bits: kein Shot

### Ko-fi / Tipeee

Vorbereitet, produktiv erst nach sauberer Payment-Bus-Anbindung:

- je volle 10 EUR = 50/50 Chance auf 1 Shot

## Resub-Schutz

Subscribe wird standardmäßig 60 Sekunden gepuffert. Kommt ein Resub für denselben User/Tier, gewinnt der Resub und der Pending-Sub wird verworfen.

## Tests nach Deploy

```powershell
node -c .\backend\modules\shot_alarm.js
node -c .\htdocs\dashboard\modules\shot_alarm.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/shot-alarm/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,enabled,busAvailable,registeredOnBus,routeCount,lastError
```

Overlay:

```text
http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?debug=1
```

Dashboard:

```text
http://127.0.0.1:8080/dashboard → Control → Shot-Alarm
```
