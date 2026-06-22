# Modul-Doku: HypeTrain

Version: `0.2.3`
Build: `STEP_HT3_2_1_HYPETRAIN_EVENT_SOUND_HAS_MEDIA_HOTFIX`

## HT3.2 – Event-Action Config Vorbereitung

HT3.2 ergänzt die vorbereiteten HypeTrain-Event-Aktionen um eine backendseitige, dashboardfreundliche Konfigurationsroute.

Routen:

```text
GET  /api/hypetrain/event-actions
POST /api/hypetrain/event-actions
```

Konfigurierbare Event-Typen:

```text
start
levelUp
end
record
```

Pro Event-Typ vorbereitet:

```text
sound.enabled
sound.mediaId
sound.soundId
sound.label
sound.priority
sound.volume
sound.target
sound.outputTarget
sound.queueIfBusy
sound.dropIfBusy
sound.canInterrupt
sound.canBeInterrupted
sound.parallelAllowed
overlay.enabled
overlay.event
overlay.ttlMs
```

Wichtig:

- HypeTrain spielt keine Sounds selbst ab.
- Sounds laufen immer über das bestehende `sound_system`.
- Media-Auswahl erfolgt später über das bestehende Media-System und wird hier als `mediaId` gespeichert.
- Overlay-Events laufen über Communication-Bus.
- Das technische Overlay-Grundgerüst aus HT3.1 bleibt leer/transparent und sendet Register/Heartbeat.
- Standardmäßig sind alle neuen Event-Sounds und Overlay-Events aus.

## Vorheriger Stand

# HypeTrain-Modul

Version: `0.2.1`
Build: `STEP_HT3_1_HYPETRAIN_OVERLAY_REGISTER_HEARTBEAT`

## HT3.1 – Overlay-Anmeldung und Heartbeat

HT3.1 erweitert die HT3.0-Basis um eine echte technische Overlay-Anmeldung und Heartbeat-Überwachung. Das HypeTrain-Overlay bleibt weiterhin ein leeres/transparentes Grundgerüst mit optionaler Debug-Anzeige, meldet sich aber beim Backend an und sendet regelmäßig Heartbeats.

Neue/erweiterte Routen:

```text
POST /api/hypetrain/overlay/register
POST /api/hypetrain/overlay/heartbeat
GET  /api/hypetrain/overlay/status
```

Statusfelder:

```text
overlay.registered
overlay.connected
overlay.clientCount
overlay.connectedCount
overlay.lastRegisteredAt
overlay.lastHeartbeatAt
overlay.lastClientId
overlay.lastEvent
```

Wichtig:

```text
- Sounds laufen weiterhin ausschließlich über sound_system.
- Das Overlay spielt keine Sounds selbst.
- Neue Event-Sounds und Overlay-Events bleiben standardmäßig aus.
- HT2.9 bleibt gültig: HypeTrain-Tagebuchposts nutzen sichtbar den Tagebuch-Webhook-Namen CGN Posty.
```

## HT3.0 – Event-Actions und Overlay-Basis


HT3.0 erweitert das HypeTrain-Modul um vorbereitete Aktionen für:

- Start
- Stufenaufstieg / Level-Up
- Ende
- Rekord-Event

### Sound

Sounds werden nicht im Overlay und nicht direkt im Modul abgespielt. Das HypeTrain-Modul sendet bei aktivierter Config nur Aufträge an das bestehende `sound_system` über `/api/sound/play`.

Neue Config-Bereiche:

```text
eventActions.start.sound.enabled
eventActions.start.sound.mediaId
eventActions.start.sound.soundId

eventActions.levelUp.sound.enabled
eventActions.levelUp.sound.mediaId
eventActions.levelUp.sound.soundId
eventActions.levelUp.onlyOncePerLevel

eventActions.end.sound.enabled
eventActions.end.sound.mediaId
eventActions.end.sound.soundId

eventActions.record.sound.enabled
eventActions.record.sound.mediaId
eventActions.record.sound.soundId
```

Alle neuen Sounds sind standardmäßig AUS.

### Overlay

HT3.0 legt ein leeres Overlay-Grundgerüst an:

```text
htdocs/overlays/hypetrain/hypetrain_overlay.html
```

Das Overlay ist transparent und zeigt nur mit `?debug=1` eine kleine Diagnosebox. Es ist noch kein fertiges Design und keine Animation.

Vorbereitete Events:

```text
hypetrain.overlay.start
hypetrain.overlay.level_up
hypetrain.overlay.end
hypetrain.overlay.record
```

Neue Config-Bereiche:

```text
eventActions.start.overlay.enabled
eventActions.levelUp.overlay.enabled
eventActions.end.overlay.enabled
eventActions.record.overlay.enabled
```

Alle neuen Overlay-Events sind standardmäßig AUS.

### Testroute

```text
POST /api/hypetrain/test/event-actions?confirm=1
```

Dry-Run bleibt Standard. Produktiv nur mit:

```json
{
  "productive": true,
  "confirmProductive": "HYPETRAIN_PRODUCTIVE_ACTIONS"
}
```

### Unverändert aus HT2.9

- HypeTrain-Ende schreibt über das Tagebuch.
- Sichtbarer Discord-Name kommt vom Tagebuch-Webhook (`CGN Posty`).
- Direkt-Discord bleibt deaktiviert, solange die Config nicht geändert wird.
- Bestehender Rekord-Sound-EndAction-Bereich bleibt separat und standardmäßig deaktiviert.

---

# HypeTrain-Modul

Stand: 2026-06-22  
Modul: `hypetrain`  
Version: `0.1.6`  
Build: `STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME`

## Ziel

Das Modul `hypetrain` ist das Fachmodul fuer HypeTrain-Status, DB-Config, Textvarianten, Statistik und sichere End-Aktionen.

`twitch_events` bleibt weiterhin die einzige Twitch-EventSub-Quelle. `hypetrain` abonniert vorhandene Events ueber den Communication-Bus und baut kein eigenes EventSub-System.

## Aktueller Standard nach HT2.9

```text
diaryEndEnabled = true
directDiscordEndEnabled = false
recordSoundEndEnabled = false
```

Bedeutung:

- HypeTrain-Ende schreibt ins Tagebuch.
- Discord läuft dabei über das bestehende Tagebuch-System.
- Der sichtbare Discord-Name kommt vom Tagebuch-Webhook, bestätigt als `CGN Posty`.
- Kein separater Direkt-Discord-Post vom HypeTrain-Modul.
- Kein Rekord-Sound aktuell aktiv.

## HT2.9 – Tagebuch-Webhook-Name

Wenn `hypetrain` über `/api/tagebuch/entry` schreibt, sendet es keinen eigenen `authorDisplay` und keinen eigenen `systemUsername` mehr an das Tagebuch.

Das Tagebuch setzt bei Systemeinträgen ohne expliziten `systemUsername` keinen eigenen Webhook-`username` mehr. Dadurch nutzt Discord den normalen Webhook-Namen des Tagebuch-Webhooks.

Bestätigt:

```text
productiveActions = True
dryRun = False
trigger = manual_productive_test
Discord sichtbar = CGN Posty
discord.skipped = true
diary.ok = true / status 200
recordSound.skipped = true
```

`posterName=hypetrain` im API-Ergebnis ist nur der interne Actor/Login und nicht der sichtbare Discord-Webhook-Name.

## HT2.8 – Tagebuch Stream-State

HT2.8 ergänzt auf Tagebuch-Seite, dass Tagebuch-Einträge den zentralen Stream-State / Override aus `twitch_events` nutzen können. Dadurch blockiert das Tagebuch nicht mehr mit `stream_inactive`, wenn der zentrale Stream-State live meldet.

Bestätigt:

```text
effectiveActiveStreamForEntries = true
entryStreamSource = twitch_events_stream_state
```

## Bus-Events

Das Modul hört auf:

```text
twitch.hypetrain.started
twitch.hypetrain.progress
twitch.hypetrain.ended
twitch.hypetrain.record_broken
twitch.cheer.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.raid.received
```

Das Modul veröffentlicht Status/Diagnose über:

```text
hypetrain.status.updated
hypetrain.preview.generated
hypetrain.live_readiness.checked
hypetrain.end_actions.executed
```

## Datenschutz / Top-Unterstützer

Standard:

```text
privacy.includeTopContributors = false
privacy.includeContributorNames = false
```

Discord-/Tagebuch-Ausgaben zeigen standardmäßig keine Namen und keine Top-Unterstützer-Ranglisten.

Stattdessen werden aggregierte Werte genutzt:

```text
Bits
Subs
Resubs
GiftSubs
HypeTrain-Punkte
Level
Rekordinfo
Raid-Kontext
Dauer
```

## DB-Schema

Tabellen:

```text
hypetrain_runs
hypetrain_contributions
hypetrain_runtime_events
```

Settings:

```text
hypetrain_settings
```

Textvarianten:

```text
module_text_variants
module_name = hypetrain
```

## Relevante Config-Keys

Tagebuch:

```text
diary.enabled
diary.writeOnEnd
diary.systemUsername
diary.apiUrl
```

Hinweis: `diary.systemUsername` bleibt als Legacy-/Diagnose-/Optionalwert vorhanden. Im Standard-Tagebuch-Flow soll `hypetrain` den sichtbaren Tagebuch-Webhook-Namen nicht überschreiben.

Direkt-Discord:

```text
discord.enabled
discord.writeOnEnd
discord.mode
discord.webhookUrlEnv
discord.channelId
discord.username
discord.avatarUrl
```

Wichtig: Direkt-Discord ist nicht Standard. Für den aktuellen gewünschten Flow läuft Discord über das bestehende Tagebuch-System.

Rekord-Sound:

```text
sound.recordSoundEnabled
sound.mediaId
sound.soundId
sound.label
sound.priority
sound.volume
sound.target
sound.outputTarget
sound.queueIfBusy
sound.dropIfBusy
sound.canInterrupt
sound.canBeInterrupted
sound.parallelAllowed
```

## API-Routen

```text
GET  /api/hypetrain/status
GET  /api/hypetrain/config
POST /api/hypetrain/config
GET  /api/hypetrain/texts
POST /api/hypetrain/texts
GET  /api/hypetrain/stats
GET  /api/hypetrain/preview
POST /api/hypetrain/preview
POST /api/hypetrain/test/synthetic?confirm=1
POST /api/hypetrain/test/end-actions?confirm=1
GET  /api/hypetrain/live-readiness
POST /api/hypetrain/live-readiness
GET  /api/hypetrain/activation-profiles
POST /api/hypetrain/activation-profiles?confirm=1
GET  /api/hypetrain/routes
```

## Testbefehle

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild
```

Erwartung:

```text
moduleVersion = 0.1.6
moduleBuild   = STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME
```

Tagebuch-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" |
  Select-Object moduleVersion,moduleBuild
```

Erwartung:

```text
moduleVersion = 0.1.2
moduleBuild   = STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME
```

Produktiver EndAction-Test nur bewusst:

```powershell
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/hypetrain/test/end-actions?confirm=1" `
  -ContentType "application/json" `
  -Body '{"productive":true,"confirmProductive":"HYPETRAIN_PRODUCTIVE_ACTIONS","raid":true,"record":true,"level":5,"points":9600,"bits":3500,"subs":3,"resubs":1,"giftSubs":4}'

$r | Select-Object ok,productiveActions
$r.result | Select-Object moduleVersion,moduleBuild,dryRun,trigger
$r.result.actions.discord | Select-Object ok,skipped,reason
$r.result.actions.diary | Select-Object ok,status
$r.result.actions.recordSound | Select-Object ok,skipped,reason
$r.result.actions.diary.result | Select-Object posterName
```

Erwartung:

```text
productiveActions = True
dryRun = False
trigger = manual_productive_test
discord.skipped = true
diary.ok = true / status 200
recordSound.skipped = true
Discord sichtbarer Name = CGN Posty
```

## Aktivierungsprofile

Wichtige Profile:

```text
all_off
  Alles aus.

diary_only
  Nur Tagebuch. Gewünschter Standard.
  Discord läuft über Tagebuch-Webhook.
  Direkt-Discord und Rekord-Sound bleiben aus.

discord_only
  Nur separater Direkt-Discord. Nicht Standard.

record_sound_only
  Nur Rekord-Sound. Erst nach Media-/Sound-System-Test aktivieren.
```

## Schutzregeln

- Keine eigene Twitch/EventSub-Anbindung im `hypetrain`-Modul.
- Kein Sound am Sound-System vorbei.
- Keine eigene Media-Upload-Lösung.
- Direkt-Discord bleibt vorerst aus und ist nicht Standard.
- Rekord-Sound bleibt aus, bis Media-/Sound-Konfiguration bewusst getestet wurde.
- Produktive DB nicht ersetzen, löschen oder überschreiben.
- Keine Funktionalität entfernen.
