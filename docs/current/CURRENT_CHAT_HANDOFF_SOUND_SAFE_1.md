# CURRENT CHAT HANDOFF – SOUND-SAFE-1

Stand: 2026-06-16

## Step

SOUND-SAFE-1 – Sound-System pruefen und sicheren Erweiterungspunkt fuer EventSound-Playback + Countdown-PreRoll festlegen.

## Ergebnis

Das Sound-System wurde statisch gegen den gelieferten Stand geprueft. Der sichere Einstiegspunkt fuer das Eventsystem ist nicht eine neue parallele Sound-Logik, sondern der vorhandene Sound-System-Command-/Playback-Layer.

Wichtige vorhandene Sound-System-Routen:

- `GET /api/sound/status`
- `GET /api/sound/queue`
- `GET /api/sound/eventbus/command/contract`
- `POST /api/sound/eventbus/command/dry-run` – prueft Payload ohne Queue/Audio
- `POST /api/sound/eventbus/command/play-test` – expliziter manueller Test mit Queue/Audio
- `POST /api/sound/play` – bestehender produktiver Legacy-Entry-Point

## Umgesetzte Aenderung

Datei:

- `backend/modules/stream_events.js`

Aenderungen:

- Modulversion von `0.5.22` auf `0.5.23` gesetzt.
- Modulbuild auf `STEP_SOUND_SAFE_1_SOUND_EXTENSION_PLAN` gesetzt.
- Read-only Route ergaenzt:
  - `GET /api/stream-events/sound-runtime/safety-plan`
- Sound-Runtime-Status meldet jetzt sichtbar:
  - `preRollExtensionPointPrepared: true`
  - `safetyPlanRoute: /api/stream-events/sound-runtime/safety-plan`
- Vorbereitete Playback-Payloads enthalten jetzt einen nicht-ausfuehrenden `preRoll`-Plan.
- Sound-Defaults enthalten vorbereitete, deaktivierte PreRoll-/Countdown-Felder:
  - `preRollEnabled: false`
  - `preRollSeconds: 3`
  - `countdownPreRollEnabled: false`
  - `countdownPreRollSeconds: 3`

## Nicht geaendert

- Kein `sound_system.js` geaendert.
- Keine Sound-System-Queue geaendert.
- Kein Audio-/Overlay-Playback aktiviert.
- Keine produktive Sound-Route vom Eventsystem aufgerufen.
- Keine DB-Daten migriert oder geloescht.
- Keine Dashboard-Aktionen geaendert.

## Sicherheitsentscheidung

Der Erweiterungspunkt liegt im Eventsystem vor dem Sound-System-Aufruf:

`stream_events.before_sound_system_play_request`

Geplante Reihenfolge fuer den naechsten Playback-Step:

1. Sound-Runde erstellen.
2. Playback-Payload vorbereiten.
3. Optionalen PreRoll/Countdown anzeigen.
4. Payload gegen `/api/sound/eventbus/command/dry-run` validieren.
5. Genau einen Sound-System-Play-Aufruf ausfuehren.
6. Antwortfenster erst nach akzeptiertem Sound-Start starten.
7. Solve/Unresolved wie bisher ueber Eventsystem auswerten.

## Tests nach Einspielen + StepDone

Wichtig: Erst ZIP einspielen/deployen, dann StepDone ausfuehren, danach testen.

```powershell
.\stepdone.cmd "SOUND-SAFE-1 - Sound-System Safety Plan und PreRoll-Erweiterungspunkt"
```

Danach:

```powershell
node -c .\backend\modules\stream_events.js
```

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/sound-runtime/safety-plan"
$r | Select-Object ok,module,moduleVersion,moduleBuild,step
$r.currentMode
$r.preRollPlan
$r.safetyRules
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/sound-runtime/status"
$s.rules
```

Optional nur read-only Sound-System-Check:

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/contract"
$c | Select-Object ok,module,version,mode,readOnly,queueTouched,audioTouched
```

## Naechster sinnvoller Step

SOUND-SAFE-2 – EventSound-Playback zuerst als manueller Testfluss mit Sound-System-DryRun vorbereiten. Noch kein Auto-Playback und kein Dashboard-Autobutton ohne klare Freigabe.
