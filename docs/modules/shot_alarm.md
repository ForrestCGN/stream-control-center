# Shot-Alarm

Stand: SHOT-ALARM-2A_AGGREGATED_DRAW_OVERLAY_COUNTER  
Backend: `backend/modules/shot_alarm.js`  
Dashboard: `htdocs/dashboard/modules/shot_alarm.js`  
Overlay: `htdocs/overlays/shot_alarm/shot_alarm_overlay.html`

## Zweck

Shot-Alarm verarbeitet Support-Events und lost daraus Shots für Engel & Roxxy aus. Die Auslosung läuft im Backend im Hintergrund. Pro Support-Event wird das Ergebnis gebündelt: keine Einzel-Overlay-/Sound-Flut pro internem Würfelblock.

Stil: Altersheim / Heimleitung / Rentner / CGN.

## Quellen

Aktiv über Communication Bus:

- `twitch.sub.received`
- `twitch.resub.received`
- `twitch.subgift.received`
- `twitch.giftbomb.received`
- `twitch.cheer.received`

Vorbereitet für später:

- `payment.kofi.received`
- `payment.tipeee.received`

Ko-fi/Tipeee-Module werden in STEP 2A noch nicht verändert.

## Regeln

### Einzelne Subs / Resubs / GiftSubs

Nur einzelne Support-Events erhöhen den Einzelzähler.

- 1 Sub / Resub / GiftSub: 20 % auf 1 Shot
- jeder 5. einzelne Sub / Resub / GiftSub: 50/50 auf 1 Shot
- jeder 10. einzelne Sub / Resub / GiftSub: 100 % auf 1 Shot

Sub-Bomben zählen nicht in diesen Einzelzähler.

### Sub-Bomben

- 5er Bombe: 50/50 auf 1 Shot
- je 10er Block: 100 % auf 1 Shot
- 100er Bombe: 10 sichere Shots

### Bits

- unter 1.000 Bits: kein Shot
- je volle 1.000 Bits im Restbereich: 50/50 auf 1 Shot
- je volle 10.000 Bits: 100 % auf 1 Shot

Beispiele:

- 9.000 Bits: 9x 50/50
- 10.000 Bits: 1 sicherer Shot
- 11.000 Bits: 1 sicherer Shot + 1x 50/50
- 25.000 Bits: 2 sichere Shots + 5x 50/50

### Ko-fi / Tipeee vorbereitet

- je volle 10 EUR: 50/50 auf 1 Shot

Produktive Anbindung erfolgt später über Payment-Bus-Events aus `kofi.js` und `tipeee.js`.

## Ablauf STEP 2A

1. Support-Event kommt rein.
2. Backend berechnet intern alle Würfe.
3. Overlay zeigt `Auslosung läuft`.
4. Optionaler Chattext im Heimleitungsstil wird gesendet.
5. Nach `display.drawDelayMs` (Default 10 Sekunden) wird das Ergebnis aufgelöst.
6. Offene Shots werden erst beim Ergebnis erhöht.
7. Ergebnis wird als eine gebündelte Chatnachricht ausgegeben.
8. Ergebnis-Overlay wird einmal angezeigt.
9. Ein zufälliger Sound aus dem Shot-Alarm-Pool wird nur bei Treffer angefordert.
10. Verlauf speichert Zusammenfassung inklusive Roll-Details.

## Overlay

Overlay-Datei:

`/overlays/shot_alarm/shot_alarm_overlay.html`

Layout:

- kleine Ergebnis-/Auslosungskarte in der oberen Bildschirmhälfte
- dauerhaft dezente Statusleiste unten am Rand
- Statusleiste zeigt: offene Shots, getrunkene Shots, Gesamt-Shots

OBS-Link:

`http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html`

Debug-Link:

`http://127.0.0.1:8080/overlays/shot_alarm/shot_alarm_overlay.html?debug=1`

## Routen

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/config`
- `GET /api/shot-alarm/history`
- `GET /api/shot-alarm/status-bar`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/flush-pending`
- `POST /api/shot-alarm/reset-state`

## Counter

Runtime-State:

- `shotsOpen`
- `shotsDrunk`
- `shotsAddedTotal`

`POST /api/shot-alarm/shot-done` reduziert offene Shots und erhöht getrunkene Shots. Der Chatbefehl dafür ist in STEP 2A noch nicht produktiv an `commands.js` angebunden.

## Textsystem

STEP 2A nutzt Config-Textpools als Fallback:

- `texts.drawStart`
- `texts.resultHit`
- `texts.resultMiss`
- Overlay-Textpools

Ziel für Folge-Step: Texte in vorhandene DB-/Textvarianten-Helper überführen und dashboardfähig machen.

## Nicht geändert in STEP 2A

- `twitch_events.js`
- `twitch.js`
- `loyalty.js`
- `alert_system.js`
- `kofi.js`
- `tipeee.js`
- `sound_system.js`
- `commands.js`
- produktive SQLite-DB

## Offene Folgepunkte

- Chatbefehl für Engel/Roxxy: z. B. `!shotdone`
- Rechteprüfung für Engel/Roxxy/Broadcaster/Mods
- DB-basierte Textvarianten im bestehenden Textsystem
- Dashboard-Editor für Texte/Sounds/Statistik
- Ko-fi/Tipeee Payment-Bus-Anbindung
- persistente Statistik in DB statt nur Runtime-History
