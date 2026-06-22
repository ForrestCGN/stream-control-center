# HypeTrain-Modul

Stand: 2026-06-21  
Marker: `STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS`  
Modul: `hypetrain`  
Version: `0.1.2`

## Ziel

Das Modul `hypetrain` ist das neue Fachmodul fuer HypeTrain-Status, DB-Config, Textvarianten, Statistik und sichere End-Aktionen.

`twitch_events` bleibt weiterhin die einzige Twitch-EventSub-Quelle. `hypetrain` abonniert vorhandene Events ueber den Communication-Bus und baut kein eigenes EventSub-System.

## Aktueller Stand

HT2.3 ergaenzt sichere, konfigurierbare End-Aktionen:

```text
HypeTrain-Ende -> optional Discord-Nachricht
HypeTrain-Ende -> optional Tagebuch-Systemeintrag
HypeTrain-Rekord am Ende -> optional Rekord-Sound ueber Sound-System
```

Wichtig:

```text
Alle produktiven Aktionen sind standardmaessig AUS.
Aktionen laufen nur, wenn die jeweilige Config explizit aktiviert ist.
Sound laeuft ausschliesslich ueber /api/sound/play und bleibt damit beim Sound-System.
Tagebuch laeuft ueber /api/tagebuch/entry und bleibt damit beim Tagebuch-Modul.
Discord laeuft ueber die vorhandene Discord-Bridge.
Keine Top-Unterstuetzer-Namen standardmaessig.
```

## Bus-Events

Das Modul hoert auf:

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

Das Modul veroeffentlicht Status/Diagnose ueber:

```text
hypetrain.status.updated
hypetrain.preview.generated
hypetrain.end_actions.executed
```

## Datenschutz / Top-Unterstuetzer

Standard:

```text
privacy.includeTopContributors = false
privacy.includeContributorNames = false
```

Discord-/Tagebuch-Ausgaben zeigen standardmaessig keine Namen und keine Top-Unterstuetzer-Ranglisten.

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

Discord:

```text
discord.enabled
discord.writeOnEnd
discord.mode
discord.webhookUrlEnv
discord.channelId
discord.username
discord.avatarUrl
```

Tagebuch:

```text
diary.enabled
diary.writeOnEnd
diary.systemUsername
diary.apiUrl
```

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
GET  /api/hypetrain/routes
```

## Testbefehle

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild
```

Erwartung fuer HT2.3:

```text
moduleVersion = 0.1.2
moduleBuild   = STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS
```

Preview normal:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?level=2&points=2500&bits=1500&subs=1&resubs=1&giftSubs=1" |
  ConvertTo-Json -Depth 8
```

End-Actions Dry-Run:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/hypetrain/test/end-actions?confirm=1" `
  -ContentType "application/json" `
  -Body '{"raid":true,"record":true,"level":5,"points":9600,"bits":3500,"subs":3,"giftSubs":4}' |
  ConvertTo-Json -Depth 10
```

Der Dry-Run darf keine produktive Discord-/Tagebuch-/Sound-Aktion ausloesen.

Produktiver manueller Test ist absichtlich zusaetzlich geschuetzt:

```text
confirmProductive=HYPETRAIN_PRODUCTIVE_ACTIONS
```

Diese Option nur bewusst und nach Config-Pruefung verwenden.

## Schutzregeln

- Keine direkte Twitch/EventSub-Anbindung im `hypetrain`-Modul.
- Keine direkte Sound-/Video-Wiedergabe am Sound-System vorbei.
- Keine eigene Media-Upload-Loesung im HypeTrain-Dashboard.
- Medienauswahl/Uploads spaeter ueber zentrales Media-System-Fenster/Modal.
- Produktive Discord-/Tagebuch-/Sound-Aktionen bleiben standardmaessig aus.
- Top-Unterstuetzer-Namen bleiben standardmaessig aus.

## HT2.4 Dashboard Config-/End-Actions-Schalter

Stand: `STEP_HT2_4_HYPETRAIN_DASHBOARD_END_ACTION_CONTROLS`

HT2.4 erweitert ausschließlich das HypeTrain-Dashboard. Der Backend-Stand `0.1.2 / STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS` bleibt unverändert.

Neu im Dashboard:

- Übersicht zeigt einen eigenen Block **Produktive End-Aktionen**.
- Discord, Tagebuch und Rekord-Sound werden dort mit aktuellem Aktivierungsstatus angezeigt.
- Der letzte End-Actions-Plan beziehungsweise Dry-Run kann aufgeklappt werden.
- Tests-Tab enthält einen sicheren **End-Actions Dry-Run**.
- Config-Tab erklärt die Aktivierungslogik direkt im Dashboard.
- Media-System kann aus dem HypeTrain-Dashboard in einem eigenen Fenster geöffnet werden.

Sicherheitsregeln:

- Es gibt keinen Ein-Klick-Produktivtest im Dashboard.
- Produktive Discord-/Tagebuch-/Sound-Aktionen bleiben Backend-seitig weiterhin durch Config und Produktiv-Confirm geschützt.
- Medienauswahl/Uploads werden nicht im HypeTrain-Modul gebaut, sondern bleiben beim zentralen Media-System.
- Datenschutz-Defaults bleiben unverändert: keine Namen und keine Top-Unterstützer standardmäßig.
