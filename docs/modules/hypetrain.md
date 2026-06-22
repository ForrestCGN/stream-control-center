# HypeTrain-Modul

Stand: 2026-06-22  
Modul: `hypetrain`  
Version: `0.1.5`  
Build: `STEP_HT2_7_HYPETRAIN_DIARY_DISCORD_CLARITY`

## Ziel

Das Modul `hypetrain` ist das Fachmodul fuer HypeTrain-Status, DB-Config, Textvarianten, Statistik und sichere End-Aktionen.

`twitch_events` bleibt weiterhin die einzige Twitch-EventSub-Quelle. `hypetrain` abonniert vorhandene Events ueber den Communication-Bus und baut kein eigenes EventSub-System.

## Aktueller Standard nach HT2.7/HT2.8

```text
diaryEndEnabled = true
directDiscordEndEnabled = false
recordSoundEndEnabled = false
```

Bedeutung:

- HypeTrain-Ende schreibt ins Tagebuch.
- Discord läuft dabei über das bestehende Tagebuch-System.
- Kein separater Direkt-Discord-Post vom HypeTrain-Modul.
- Kein Rekord-Sound aktuell aktiv.

HT2.8 ergänzt auf Tagebuch-Seite, dass Tagebuch-Einträge den zentralen Stream-State / Override aus `twitch_events` nutzen können. Dadurch blockiert das Tagebuch nicht mehr mit `stream_inactive`, wenn der zentrale Stream-State live meldet.

## Aktueller bestätigter Test

```text
effectiveActiveStreamForEntries = true
entryStreamSource = twitch_events_stream_state
HypeTrain produktiver Tagebuch-Test wurde gespeichert
Tagebuch-Webhook hat gepostet
diary ok
Direkt-Discord skipped
Rekord-Sound skipped
errors leer
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
moduleVersion = 0.1.5
moduleBuild   = STEP_HT2_7_HYPETRAIN_DIARY_DISCORD_CLARITY
```

Tagebuch-Status:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status"
$r.state | Select-Object effectiveActiveStreamForEntries,entryStreamSource
```

Erwartung bei aktivem Stream-State/Override:

```text
effectiveActiveStreamForEntries = true
entryStreamSource = twitch_events_stream_state
```

Live-Readiness:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/hypetrain/live-readiness" `
  -ContentType "application/json" `
  -Body '{"raid":true,"record":true,"level":5,"points":9600,"bits":3500,"subs":3,"resubs":1,"giftSubs":4}' |
  Select-Object ok,module,moduleVersion,moduleBuild
```

## Aktivierungsprofile

Verfügbare Profile:

```text
all_off – Discord, Tagebuch und Rekord-Sound aus
diary_only – nur Tagebuch-Endeintrag aktiv
discord_only – nur Direkt-Discord aktiv
record_sound_only – nur Rekord-Sound aktiv; erfordert konfigurierte sound.mediaId oder sound.soundId
```

Zum Anwenden eines Profils ist zusätzlich erforderlich:

```powershell
confirmApply = "HYPETRAIN_ACTIVATION_PROFILE"
```

Ein echter produktiver End-Actions-Test bleibt separat geschützt und benötigt weiterhin:

```powershell
confirmProductive = "HYPETRAIN_PRODUCTIVE_ACTIONS"
```

## Schutzregeln

- Keine direkte Twitch/EventSub-Anbindung im `hypetrain`-Modul.
- Keine direkte Sound-/Video-Wiedergabe am Sound-System vorbei.
- Keine eigene Media-Upload-Lösung im HypeTrain-Dashboard.
- Medienauswahl/Uploads später über zentrales Media-System-Fenster/Modal.
- Direkt-Discord bleibt aus, außer Forrest aktiviert ihn bewusst als separaten Zusatzweg.
- Rekord-Sound bleibt aus, bis Media-/Sound-System bewusst geprüft wurde.
- Top-Unterstützer-Namen bleiben standardmäßig aus.
- Keine Funktionalität entfernen.

## Offene Punkte

- Beim nächsten echten Twitch-HypeTrain beobachten, ob Ende automatisch sauber ins Tagebuch schreibt.
- Rekord-Sound später separat über Media-/Sound-System konfigurieren und testen.
- Direkt-Discord später nur bewusst als Zusatzweg testen.
- HT3 später: Start-/Ende-/Level-Up-Alerts mit Sound/Video/Grafik über Media-System-Fenster/Modal planen.
