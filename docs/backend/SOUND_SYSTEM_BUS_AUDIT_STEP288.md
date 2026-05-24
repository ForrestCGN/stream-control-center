# STEP288 – Sound-System Bus Audit & Migrationsplan

Datum: 2026-05-24T13:40:00Z
Status: Analyse-/Architekturstand, keine Codeänderung

## Zweck

Nach STEP287 ist der Alert-Visual-Pfad busfähig vorbereitet und live mit `legacy`, `legacy_and_bus` und `bus_first` bestätigt. Der nächste große Block ist das Sound-System, weil es die zentrale Audio-/Medien-Schicht für Alerts, Alert-TTS, normales TTS, VIP-/Mod-Sounds, SoundAlerts, Birthday-Shows, Clip-Shoutouts, Media-Playback und Discord-Routing ist.

STEP288 prüft den Ist-Stand und legt einen sicheren Migrationsplan fest. Es wurde bewusst kein Code geändert.

## Geprüfte Dateien

- `backend/modules/sound_system.js`
- `backend/modules/alert_system.js`
- `backend/modules/tts_system.js`
- `backend/modules/vip_sound_overlay.js`
- `backend/modules/soundalerts_bridge.js`
- `backend/modules/birthday.js`
- `backend/modules/clip_shoutout.js`
- `backend/modules/sound_media_bridge.js`
- `backend/modules/commands_media.js`
- `backend/modules/video_media_bridge.js`
- `backend/modules/discord.js`
- `backend/modules/challenge.js`
- `backend/modules/clips.js`
- `backend/modules/deathcounter_v2.js`
- `backend/modules/communication_bus.js`
- `config/sound_system.json`
- `config/alert_system.json`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/*`

## Aktueller Sound-System-Ist-Stand

Das Sound-System ist aktuell der Master für:

- Queue und Prioritäten
- Locked Bundles
- Alert-Hauptsound + Alert-TTS-Reihenfolge
- aktive Bundle-Sperre (`activeBundleLock`)
- Output-Ziele `overlay`, `device`, perspektivisch `both`
- optionales Discord-Routing über die Discord-Bridge
- Overlay-Client-ACKs für `audio-started`, `audio-ended`, `error`
- Device-Playback über AudioDeviceHelper
- Level-/Pegel-Korrektur
- Media-Registry-Dateien über `mediaId`/`mediaPath`

Aktive API-Routen im Sound-System:

- `GET /api/sound/status`
- `GET /api/sound/current`
- `GET /api/sound/queue`
- `GET /api/sound/list`
- `GET /api/sound/config`
- `GET /api/sound/settings`
- `POST /api/sound/settings`
- `POST /api/sound/reload`
- `GET /api/sound/routes`
- `GET /api/sound/integration-check`
- `GET /api/sound/generated/beep.wav`
- `GET /api/sound/play`
- `POST /api/sound/play`
- `POST /api/sound/bundle`
- `POST /api/sound/stop`
- `POST /api/sound/skip`
- `POST /api/sound/clear`
- `POST /api/sound/pause`
- `POST /api/sound/resume`
- `POST /api/sound/reset`
- `POST /api/sound/client/ready`
- `POST /api/sound/client/audio-started`
- `POST /api/sound/client/audio-ended`
- `POST /api/sound/client/error`

Zusätzlich existiert `sound_media_bridge.js` mit `GET/POST /api/sound/play-media`, das Media-Registry-Assets in normale Sound-System-Requests übersetzt.

Der alte WebSocket-Statusweg bleibt aktuell:

- `op: sound_system`
- Payload enthält `reason` und `data: publicState()`

Dieser bestehende WebSocket-Weg darf in der ersten Bus-Migration nicht entfernt werden.

## Kritische bestehende Schutzlogik

Diese Punkte dürfen bei der Bus-Migration nicht verändert oder indirekt gebrochen werden:

1. `activeBundleLock` schützt locked Bundles.
   - Besonders wichtig zwischen Alert-Hauptsound und passender Alert-TTS.
   - Fremde Sounds müssen während eines aktiven Alert-Bundles hinten in die Queue.

2. Alert-Bundle-Items umgehen Dedupe/Cooldowns.
   - Gleichartige schnelle Alerts dürfen nicht wegen Same-Sound-/Same-User-Dedupe halb kaputt gehen.

3. Queue-Sortierung respektiert Bundle-Gruppierung.
   - Bundle-Items müssen zusammen und in definierter Reihenfolge bleiben.

4. Sound-System bleibt Master.
   - Module sollen nicht direkt Audio über den Bus abspielen und damit Queue/Prioritäten umgehen.

5. Device-/Overlay-/Discord-Ausgabe bleiben bestehend.
   - Der Bus darf diese Ausgabepfade zunächst nur spiegeln/diagnostizieren.

6. Overlay-Client-ACKs bleiben bestehend.
   - `audio-ended` ist aktuell relevant für Finish und Queue-Fortschritt.

## Sound-System-Nutzer / Verbraucher

### Alerts

`alert_system.js` nutzt das Sound-System für Live-Alerts über:

- `POST /api/sound/bundle`
- Alert-Hauptsound als Bundle-Item `main`
- Alert-TTS als Bundle-Item `tts`
- Status-/Start-Prüfung über `/api/sound/status`

Wichtig: Das Alert-System wartet abhängig von Config auf den Sound-Start und zeigt Visuals synchronisiert an. Diese Kette ist stabil und darf nicht verändert werden.

### TTS

`tts_system.js` nutzt standardmäßig das Sound-System:

- erzeugt TTS-Dateien unter `tts/generated`
- sendet `POST /api/sound/play`
- nutzt `/api/sound/status`, um Start/Fertigstellung zu verfolgen
- eigener Done-Modus `sound_system_status`

### VIP-/Mod-Sounds

`vip_sound_overlay.js` nutzt:

- `POST /api/sound/play`
- speichert `sound_system_request_id`
- wertet queued/started aus
- nutzt Ziel `stream`, `discord` oder `both`

### SoundAlerts Bridge

`soundalerts_bridge.js` nutzt:

- `POST /api/sound/play`
- eigene Upload-/Mapping-Logik
- Settings für Sound-System-Play-URL und Upload-Prefixe
- erwartet, dass Sound-System die Queue steuert

### Birthday

`birthday.js` nutzt:

- `POST /api/sound/play` für einzelne Sounds
- `POST /api/sound/bundle` für Show/Video/Song
- `GET /api/sound/status` zur Überwachung
- `POST /api/sound/stop` bei Abbruch

Wichtig: Birthday behandelt das Sound-System bereits als Media-Master.

### Clip-Shoutout

`clip_shoutout.js` nutzt:

- `POST /api/sound/bundle`
- Video/Audio-Dateien als Bundle

### Media / Command Media

`sound_media_bridge.js`, `commands_media.js` und `video_media_bridge.js` zeigen die Richtung:

- Media-Registry verwaltet Assets/IDs.
- Sound-System bleibt Abspieler.
- Offizieller Hub ist `/api/sound/play-media` bzw. intern `/api/sound/play`.

### Discord

`discord.js` ist kein normaler Sound-System-Caller, sondern Ausgabeziel/Bridge. Das Sound-System ruft bei Discord-Routing intern `discordBridge.enqueueSound(file)`.

### Keine direkte Sound-System-Nutzung gefunden

In den geprüften Dateien gab es keine direkte `/api/sound`-Nutzung in:

- `challenge.js`
- `clips.js`
- `deathcounter_v2.js`

Das heißt nicht, dass dort nie Sound vorkommt, aber in den geprüften Dateien gibt es aktuell keinen direkten Sound-System-API-Aufruf.

## Zielmodell für Bus-Events

Der Bus soll im Sound-System zunächst eine zusätzliche Status-/Event-Schicht werden. Das Sound-System bleibt weiterhin der einzige Master für Queue, Prioritäten, Bundles und Ausgabe.

Empfohlenes erstes Eventmodell:

| Channel | Action | Zweck |
| --- | --- | --- |
| `sound` | `queued` | Sound wurde akzeptiert und in die Queue gelegt. |
| `sound` | `started` | Sound/Media wurde aktiv gestartet. |
| `sound` | `starting` | Optional: Visual-Lead vor Audio-Start, relevant für Alerts. |
| `sound` | `finished` | Aktiver Sound wurde sauber beendet. |
| `sound` | `failed` | Playback-/Client-/Device-Fehler. |
| `sound` | `stopped` | Sound wurde manuell/systemisch gestoppt. |
| `sound` | `skipped` | Aktiver Sound wurde übersprungen. |
| `sound` | `cleared` | Queue wurde geleert. |
| `sound` | `paused` | Queue wurde pausiert. |
| `sound` | `resumed` | Queue wurde fortgesetzt. |
| `sound.queue` | `updated` | Queue-/Current-/Parallel-Status hat sich geändert. |
| `sound.bundle` | `queued` | Locked Bundle wurde angenommen. |
| `sound.bundle` | `lock_started` | Bundle-Lock wurde aktiv. |
| `sound.bundle` | `lock_finished` | Bundle-Lock wurde aufgehoben. |
| `sound.device` | `started` | Device-Ausgabe gestartet. |
| `sound.device` | `finished` | Device-Ausgabe fertig. |
| `sound.device` | `failed` | Device-Ausgabe fehlgeschlagen. |
| `sound.discord` | `queued` | Discord-Ausgabe an Bridge übergeben. |
| `sound.discord` | `failed` | Discord-Ausgabe fehlgeschlagen. |
| `sound.client` | `ready` | Overlay-Client meldet sich bereit. |
| `sound.client` | `audio_started` | Overlay meldet Audio gestartet. |
| `sound.client` | `audio_ended` | Overlay meldet Audio beendet. |
| `sound.client` | `error` | Overlay meldet Fehler. |

Payload-Minimum:

- `requestId`
- `soundId`
- `label`
- `category`
- `source`
- `requestedBy`
- `target`
- `outputTarget`
- `priority`
- `volume`
- `mediaType`
- `audioUrl`/`mediaUrl`/`videoUrl`
- `durationMs`
- `queuedAt`
- `startedAt`
- `endsAt`
- `bundle`-Block, falls vorhanden
- `visual`-Block, falls vorhanden
- `lifecycle`-Block, soweit unkritisch
- Queue-Zusammenfassung: `current`, `queuedCount`, `parallelCount`, `activeBundleLock`

## Nicht sofort tun

Nicht in STEP289:

- keine Module auf Bus-Input umstellen
- keine Entfernung von `/api/sound/play`, `/api/sound/bundle` oder `/api/sound/play-media`
- kein Entfernen des alten `op: sound_system` WebSocket-Statuswegs
- keine Änderung an `activeBundleLock`
- keine Änderung an Queue-Sortierung, Dedupe, Cooldowns oder Interrupt-Regeln
- keine Änderung an Alert-Sound/TTS-Bundle-Erzeugung
- keine Änderung an Discord-Routing
- keine DB-Migration, außer eine additive Config-/Settings-Erweiterung ist zwingend nötig

## Empfohlener STEP289

**STEP289 – Sound-System Bus Event Mirror / Native Status Output**

Ziel:

- Sound-System sendet zusätzlich zum bestehenden WebSocket-Statusweg strukturierte Events auf den Communication Bus.
- Standardverhalten der Audio-Ausgabe bleibt unverändert.
- Bus-Events sind zunächst reine Beobachtungs-/Diagnose-Events.
- Kein Modul sendet in STEP289 Sounds über den Bus.

Betroffene Datei voraussichtlich:

- `backend/modules/sound_system.js`

Doku:

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP289_SOUND_SYSTEM_BUS_EVENT_MIRROR.md`

Technischer Vorschlag:

```js
soundBus: {
  enabled: false,
  channel: 'sound',
  requireAck: false,
  replayable: true,
  ttlMs: 60000,
  targetType: 'all',
  targetId: '*',
  targetModule: '',
  targetCapability: ''
}
```

Warum Default `false`:

- maximale Sicherheit im ersten Code-Step,
- keine Änderung des Normalbetriebs,
- gezielter Live-Test per Config möglich,
- kein Risiko durch unerwartete Event-Flut.

Sobald getestet, kann später entschieden werden, ob `soundBus.enabled` standardmäßig aktiv sein soll.

## Empfohlene Testfolge nach STEP289

1. Backend startet mit `soundBus.enabled = false`.
2. `/api/sound/status` zeigt Sound-Bus-Status.
3. Normaler Test-Ping läuft unverändert.
4. `soundBus.enabled = true` per Config/DB-Setting.
5. Test-Ping erzeugt `sound.started` und `sound.finished`.
6. Alert-Bundle-Test erzeugt:
   - `sound.bundle.queued`
   - `sound.starting`/`sound.started` für Alert-Hauptsound
   - `sound.finished` für Alert-Hauptsound
   - `sound.started`/`sound.finished` für Alert-TTS
   - `sound.queue.updated`
7. V5-Real-Mod-Test erneut ausführen.
8. Danach ggf. SoundAlerts/VIP/TTS einzeln testen.

## Migrationspfad nach STEP289

1. **STEP289:** Sound-System sendet Bus-Events, alle Caller bleiben unverändert.
2. **STEP290:** Debug View/Dashboard zeigt Sound-Bus-Events, Queue, Current, Bundle-Lock.
3. **STEP291:** Module dürfen Bus-Status lesen, spielen aber weiter über API.
4. **STEP292:** optionaler Bus-Input `sound.play`, der intern dieselbe Sound-System-Queue nutzt.
5. **STEP293+:** Module schrittweise umstellen, zuerst unkritische Sounds, danach VIP/SoundAlerts/TTS, Alerts zuletzt oder nur nach erneutem Bundle-Test.

## Fazit

Das Sound-System ist busfähig vorbereitbar, aber der erste Code-Step muss rein additiv sein. Der richtige Einstieg ist ein Bus-Event-Mirror/Status-Output im Sound-System, nicht die sofortige Migration einzelner Module auf Bus-Input.
