# Modul: Shot-Alarm

Stand: 2026-06-18  
Aktueller geprüfter Stand: **SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost**

## Zweck

Shot-Alarm ist ein Event-Modul im `stream-control-center` für ForrestCGN. Twitch-Support-Events lösen nach festen und dashboardfähigen Regeln eine Shot-Auslosung für Engel & Roxxy aus.

Stil: **CGN / Altersheim / Heimleitung / Rentner**.

## Dashboard-Einordnung

Final bestätigte Einordnung:

`Community → Event-System`

Im Event-System gibt es einen eigenen Tab:

`Shot-Alarm`

Zusätzlich gilt:

- `Community → Event-System → Texte`
  - bestehendes Textbereich-Dropdown bleibt erhalten.
  - zusätzlich vorhanden: `Shot-Alarm Chat`, `Shot-Alarm Overlay`.
- `Community → Event-System → Config`
  - neuer sicherer Config-Bereich-Dropdown.
  - Optionen: `Event-System`, `Shot-Alarm`.
  - Event-System-Config bleibt vollständig erhalten.
  - Shot-Alarm-Config ist zusätzlich getrennt auswählbar.

Wichtig: Kein eigener linker Hauptnavigationspunkt `Events`. Shot-Alarm ist kein eigenes Hauptmodul in der Navigation, sondern ein Untermodul des Event-Systems.

## Aktuelle Backend-Version

- Modul: `shot_alarm`
- Version: `0.2.1`
- Build: `STEP_SHOT_ALARM_2B_DB_TEXTS_CONFIG_HELPERS`
- Dashboard-Fix-Stand: `SHOT-ALARM-2B.6 Safe Config Dropdown No Settings Lost`
- Overlay: `/overlays/shot_alarm/shot_alarm_overlay.html`

Der Dashboard-Fix 2B.6 ändert keine Backend-Version, weil nur Dashboard-/Doku-Dateien betroffen waren.

## Finale Regeln

### Einzelne Sub-Events

Einzelne Events erhöhen den laufenden Einzel-Support-Zähler:

- Sub
- Resub
- einzelner GiftSub

Regeln:

- 1 Sub / Resub / GiftSub: 20 % Chance auf 1 Shot
- jeder 5. einzelne Sub/Resub/GiftSub: 50/50 auf 1 Shot
- jeder 10. einzelne Sub/Resub/GiftSub: 100 % auf 1 Shot

### Sub-Bomben

Sub-Bomben werden nicht zusätzlich als einzelne GiftSubs gezählt.

- 5er Bombe: 50/50 auf 1 Shot
- je 10 Subs in einer Bombe: 1 sicherer Shot
- 100er Bombe: 10 sichere Shots

Beispiele:

- 5er Bombe → 1x 50/50
- 10er Bombe → 1 sicherer Shot
- 15er Bombe → 1 sicherer Shot + 1x 50/50
- 25er Bombe → 2 sichere Shots + 1x 50/50
- 100er Bombe → 10 sichere Shots

### Bits

- je volle 1.000 Bits im Restbereich: 50/50 auf 1 Shot
- je volle 10.000 Bits: 1 sicherer Shot

Beispiele:

- 999 Bits → kein Shot
- 1.000 Bits → 1x 50/50
- 9.000 Bits → 9x 50/50
- 10.000 Bits → 1 sicherer Shot
- 11.000 Bits → 1 sicherer Shot + 1x 50/50
- 25.000 Bits → 2 sichere Shots + 5x 50/50

### Ko-fi / Tipeee

Vorbereitet, aber noch nicht produktiv angebunden:

- je volle 10 € Ko-fi: 50/50 auf 1 Shot
- je volle 10 € Tipeee: 50/50 auf 1 Shot

Ko-fi und Tipeee sind eigene Module. Die produktive Anbindung soll später sauber über Payment-Bus-Events erfolgen, nicht über Twitch-Event-Logik.

## Ablauf

1. Support-Event kommt über Twitch-Events/Communication-Bus.
2. Backend berechnet alle Würfe im Hintergrund.
3. Es wird keine Einzelwurf-Flut erzeugt.
4. Overlay/Chat meldet im Altersheim-/Heimleitungsstil: Auslosung läuft.
5. Nach Standard 10 Sekunden wird das Ergebnis angezeigt.
6. Erst beim Ergebnis werden offene Shots erhöht.
7. Pro Ergebnis wird nur eine zusammengefasste Chat-/Overlay-Ausgabe erzeugt.
8. Bei Treffer wird ein zufälliger Sound aus dem Shot-Alarm-Soundpool angefordert.

## Overlay

Overlay-Aufbau:

- Kleine Shot-Auslosungs-/Ergebnis-Karte in der oberen Bildschirmhälfte.
- Unten am Rand eine dezente Statusleiste.
- Statusleiste zeigt offene/getrunkene/gesamt hinzugefügte Shots.
- Nicht zu auffällig, dauerhaft informativ.

## Counter

Runtime-Counter:

- `shotsOpen`
- `shotsDrunk`
- `shotsAddedTotal`

Route:

- `POST /api/shot-alarm/shot-done`

Diese Route reduziert offene Shots und erhöht den Getrunken-Counter.

## DB / Config / Texte

### Config

Config wird über `helper_settings` in `module_settings` gespeichert:

- Key: `shot_alarm.config`
- Typ: JSON

`config/shot_alarm.json` bleibt Mirror/Fallback.

### Textvarianten

Texte laufen über `helper_texts` und `module_text_variants`.

Kategorien:

- `chat`
- `overlay`

Textbereiche im Dashboard:

- `Shot-Alarm Chat`
- `Shot-Alarm Overlay`

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

## Tests, die erfolgreich waren

- Backend geladen und am Communication Bus registriert.
- 100er Sub-Bombe erzeugt 10 Shots.
- Einzel-Resub-Test 1–10:
  - 1–4 = 20 %
  - 5 = 50/50
  - 6–9 = 20 %
  - 10 = 100 %
- Bits-Blocklogik:
  - 999 = keine Regel
  - 1.000 = 1x 50/50
  - 9.000 = 9x 50/50
  - 10.000 = 1x 100 %
  - 11.000 = 1x 100 % + 1x 50/50
  - 25.000 = 2x 100 % + 5x 50/50
- 25.000 Bits mit `forceRoll=0` erzeugten 7 Shots.
- 10-Sekunden-Auslosungsphase wurde korrekt resolved.
- `shot-done` reduzierte offene Shots korrekt.
- Dashboard-Config-Fix bestätigt:
  - Event-System-Config bleibt vollständig.
  - Shot-Alarm-Config ist zusätzlich auswählbar.
  - Shot-Alarm-Tab ist im Event-System sichtbar.

## Nicht geändert / bewusst nicht anfassen ohne neuen Plan

- `twitch_events.js`
- `loyalty.js`
- `alert_system.js`
- `kofi.js`
- `tipeee.js`
- `sound_system.js`
- produktive SQLite-DB-Datei

## Offene nächste Schritte

1. `!shotdone` / Shot-getrunken-Befehl über bestehendes Commands-/Chat-System anbinden.
2. Berechtigungen für Engel/Roxxy/Broadcaster/Mods prüfen und dashboardfähig machen.
3. Ko-fi/Tipeee über saubere Payment-Bus-Events an Shot-Alarm anbinden.
4. Soundpool-Auswahl im Dashboard mit vorhandenem Sound-/Media-System verbinden.
5. Persistente Counter nach Neustart prüfen/planen.
6. Statistik-/History-Auswertung im Dashboard weiter ausbauen.
7. Overlay im OBS-Livebild optisch prüfen und ggf. feinjustieren.
