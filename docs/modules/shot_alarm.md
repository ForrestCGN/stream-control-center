# Modul: Shot-Alarm

## Zweck

Der Shot-Alarm ist ein Community-/Event-Modul für ForrestCGN. Twitch-Support-Events lösen nach konfigurierbaren Regeln eine Shot-Auslosung für Engel & Roxxy aus.

Stil: CGN / Altersheim / Heimleitung / Rentner.

## Aktueller Stand

- Modul: `shot_alarm`
- Version: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`
- Dashboard: `Community / Community / Event-System / Shot-Alarm`
- Overlay: `/overlays/shot_alarm/shot_alarm_overlay.html`

## Regeln

### Einzelne Subs

- 1 Sub / Resub / GiftSub: 20 %
- jeder 5. einzelne Sub/Resub/GiftSub: 50/50
- jeder 10. einzelne Sub/Resub/GiftSub: 100 %

### Sub-Bomben

- 5er Bombe: 50/50
- je 10 Subs in einer Bombe: 1 sicherer Shot
- 100er Bombe: 10 sichere Shots

### Bits

- je 1.000 Bits: 50/50
- je 10.000 Bits: 100 %

Beispiel: 25.000 Bits = 2 sichere Shots + 5x 50/50.

### Ko-fi/Tipeee

Vorbereitet, aber noch nicht produktiv angebunden:

- je 10 € Ko-fi: 50/50
- je 10 € Tipeee: 50/50

## Ablauf

1. Support-Event kommt über Twitch-Events/Communication-Bus.
2. Backend berechnet alle Würfe im Hintergrund.
3. Overlay/Chat meldet: Auslosung läuft.
4. Nach Standard 10 Sekunden wird das Ergebnis angezeigt.
5. Nur das Gesamtergebnis wird als Chat/Overlay/Sound ausgegeben.
6. Offene Shots werden erst beim Ergebnis erhöht.

## Counter

- `shotsOpen`
- `shotsDrunk`
- `shotsAddedTotal`

`POST /api/shot-alarm/shot-done` zieht offene Shots ab und erhöht den Getrunken-Counter.

## DB / Config / Texte

### Config

Config wird über `helper_settings` in `module_settings` gespeichert:

- Key: `shot_alarm.config`
- Type: JSON

`config/shot_alarm.json` bleibt Mirror/Fallback.

### Textvarianten

Texte laufen über `helper_texts` und `module_text_variants`.

Kategorien:

- `chat` = Chat-Texte
- `overlay` = Overlay-Texte

Keys:

- `drawStart`
- `resultHit`
- `resultMiss`
- `shotDone`
- `shotDoneEmpty`
- `overlayDrawTitle`
- `overlayDrawText`
- `overlayResultHitTitle`
- `overlayResultMissTitle`
- `overlayResultHitText`
- `overlayResultMissText`

### History

Zusätzliche Tabelle:

- `shot_alarm_history`

Speichert Zeitpunkt, Phase, Eventtyp, User, Menge, Regel, Shots und Payload JSON.

## Wichtige Routen

- `GET /api/shot-alarm/status`
- `GET /api/shot-alarm/config`
- `POST /api/shot-alarm/config`
- `GET /api/shot-alarm/texts`
- `POST /api/shot-alarm/texts`
- `GET /api/shot-alarm/stats`
- `GET /api/shot-alarm/history`
- `POST /api/shot-alarm/test`
- `POST /api/shot-alarm/manual-trigger`
- `POST /api/shot-alarm/shot-done`
- `POST /api/shot-alarm/resolve-pending`
- `POST /api/shot-alarm/reset-state`

## Nicht geändert

- `twitch_events.js`
- `loyalty.js`
- `alert_system.js`
- `kofi.js`
- `tipeee.js`
- `sound_system.js`

## Nächste Schritte

1. Chatbefehl `!shotdone` über bestehendes Commands-/Chat-System anbinden.
2. Ko-fi/Tipeee Payment-Bus ergänzen.
3. Soundpool dashboardfähig mit Sound-/Media-System verbinden.
4. Rechte/Audit für produktive Dashboard-Aktionen ergänzen.
5. Counter nach Neustart ggf. persistent wiederherstellen.


## Dashboard-Einordnung
Shot-Alarm gehört im Dashboard in den Bereich Events. Die Tabs Config und Texte sind Teil des Event-Moduls Shot-Alarm und sollen langfristig mit den bestehenden Event-Dropdown-Patterns für Module/Bereiche konsistent bleiben.


## STEP SHOT-ALARM-2B.2 Dashboard Community Event-System Placement

- Separater linker Hauptnavigationspunkt `Events` entfernt.
- `Event-System` liegt wieder als Karte im Bereich `Community`.
- `Shot-Alarm` bleibt als Event-Untermodul vorhanden, aber nicht als eigener Hauptnavigationspunkt.
- Texte/Config sollen im Event-System-Kontext über vorhandene Modul-/Bereichs-Dropdowns weitergeführt werden.
- Backend, Regeln, DB-Texte, DB-Config, Overlay und Counter wurden nicht geändert.
