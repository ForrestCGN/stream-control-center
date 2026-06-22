# CURRENT_STATUS – stream-control-center

Stand: 2026-06-22

## HT2.9 – HypeTrain/Tagebuch Poster-Name bestätigt

Aktueller bestätigter Stand:

```text
HypeTrain Backend: 0.1.6
Build: STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME

Tagebuch Backend: 0.1.2
Build: STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME
```

Zweck von HT2.9:

- Wenn `hypetrain` einen Eintrag über `/api/tagebuch/entry` schreibt, überschreibt es den sichtbaren Discord-/Webhook-Namen nicht mehr.
- Systemeinträge ohne expliziten `systemUsername` setzen im Tagebuch keinen eigenen Webhook-`username` mehr.
- Dadurch nutzt Discord wieder den normalen Tagebuch-Webhook-Namen, aktuell sichtbar: `CGN Posty`.
- Direkt-Discord bleibt deaktiviert.
- Rekord-Sound bleibt deaktiviert.

Bestätigter produktiver Test:

```text
productiveActions = True
dryRun = False
trigger = manual_productive_test
Discord sichtbarer Name = CGN Posty
discord.skipped = true / disabled_or_not_applicable
diary.ok = true / status 200
recordSound.skipped = true / disabled_or_not_applicable
posterName intern = hypetrain
```

Wichtig: `posterName=hypetrain` ist nur der interne Actor/Login des Tagebuch-Eintrags. Der sichtbare Discord-Name kommt vom Tagebuch-Webhook und wurde als `CGN Posty` bestätigt.

## Aktueller HypeTrain-Standard

```text
diaryEndEnabled = true
directDiscordEndEnabled = false
recordSoundEndEnabled = false
```

Bedeutung:

- HypeTrain-Ende schreibt ins Tagebuch.
- Discord läuft über das bestehende Tagebuch-System.
- Kein separater Direkt-Discord-Post vom HypeTrain-Modul.
- Kein Rekord-Sound aktuell aktiv.
- Sichtbarer Discord-Name bei Tagebuch-Posts kommt vom Tagebuch-Webhook.

## HT2.8 – Tagebuch Stream-State bestätigt

Bestätigter Stand:

```text
Tagebuch Backend: 0.1.1
Build: STEP_HT2_8_TAGEBUCH_STREAM_STATE_ENTRIES
```

Zweck von HT2.8:

- Das Tagebuch nutzt für Einträge den zentralen Stream-State / Override aus `twitch_events`.
- Dadurch blockiert das Tagebuch nicht mehr fälschlich mit `stream_inactive`, wenn der zentrale Stream-State per Override live ist.
- Falls der zentrale Stream-State nicht verfügbar ist, bleibt der bisherige Tagebuch-State als Fallback erhalten.

Bestätigter Test:

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

## Schutzregeln bleiben unverändert

```text
Keine eigene Twitch/EventSub-Anbindung im hypetrain-Modul.
Kein Sound am Sound-System vorbei.
Keine eigene Media-Upload-Lösung.
Direkt-Discord bleibt vorerst aus und ist nicht Standard.
Rekord-Sound bleibt aus, bis Media-/Sound-Konfiguration bewusst getestet wird.
Keine produktive DB ersetzen, löschen, droppen oder überschreiben.
Keine Funktionalität entfernen.
```

## Nächster sinnvoller technischer Stand

1. Echten HypeTrain im Stream beobachten.
2. Prüfen, ob HypeTrain-Ende automatisch ins Tagebuch schreibt.
3. Prüfen, ob Discord weiterhin sichtbar als `CGN Posty` postet.
4. Optional später Rekord-Sound über Media-/Sound-System konfigurieren und separat testen.
5. Direkt-Discord bleibt aus, außer Forrest schaltet ihn bewusst als separaten Zusatzweg frei.

---

## Historie – vorherige Projektstände

### STEP_HT2_5_HYPETRAIN_LIVE_READINESS

Stand: 2026-06-21

HypeTrain-Backend erweitert:

```text
Modul: hypetrain
Version: 0.1.3
Build: STEP_HT2_5_HYPETRAIN_LIVE_READINESS
```

- Neue Readiness-Prüfung für produktive End-Aktionen.
- Readiness prüft Discord, Tagebuch und Rekord-Sound-Konfiguration.
- Keine produktiven Aktionen durch Readiness.

### STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS

Stand: 2026-06-21

HypeTrain-Backend erweitert:

```text
Modul: hypetrain
Version: 0.1.2
Build: STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS
```

Neu vorbereitet/umgesetzt:

- HypeTrain-Ende kann optional eine Discord-Nachricht senden.
- HypeTrain-Ende kann optional einen Tagebuch-Systemeintrag schreiben.
- HypeTrain-Rekord am Ende kann optional einen Rekord-Sound ueber das Sound-System ausloesen.
- Alle produktiven Aktionen sind standardmaessig AUS und laufen nur bei expliziter Config-Aktivierung.
- Neue Dry-Run-Testroute: `POST /api/hypetrain/test/end-actions?confirm=1`.
- Status enthaelt `runtime.lastEndActions` und neue Counter fuer End-Aktionen.

Wichtig:

```text
Keine eigene Twitch/EventSub-Anbindung.
Kein Sound am Sound-System vorbei.
Kein eigenes Media-Upload-System.
Keine Namen/Top-Unterstuetzer standardmaessig.
```

### STEP_HT2_2_HYPETRAIN_DASHBOARD_TABS

Stand: 2026-06-21

HypeTrain-Dashboard vorbereitet:

```text
Modul: hypetrain
Dashboard-Tabs: Übersicht | Config | Texte | Statistik | Tests
Backend-Basis: /api/hypetrain/status, config, texts, stats, preview, test/synthetic
```

Wichtig:

```text
Keine produktiven Discord-/Tagebuch-Sends aktiviert.
Keine eigene Media-Upload-Lösung gebaut.
Medienauswahl/Uploads später über zentrales Media-System-Fenster/Modal.
```

### STEP_DOC_MEDIA_SYSTEM_UPLOAD_MODAL_RULE

Stand: 2026-06-21
Marker: `STEP_DOC_MEDIA_SYSTEM_UPLOAD_MODAL_RULE`

Dokumentations-/TODO-Step:

- Master-Prompt erweitert: Medienauswahl und Uploads für Sounds, Videos, Bilder/Grafiken und sonstige Medien sollen über das vorhandene Media-System laufen.
- Dashboard-Module sollen keine eigenen Upload-/Dateiauswahl-Insellösungen bauen.
- Medienauswahl/Upload bevorzugt über ein eigenes Media-System-Fenster/Modal.
- HypeTrain-TODO ergänzt: spätere Alerts beim Start, Ende und Level-Up mit optionalem Sound/Video/Grafik vorbereiten.

Keine Code-, Dashboard-, DB- oder Runtime-Änderung.

### STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

Stand: 2026-06-21
Marker: `STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED`
Modul: `clip_shoutout`
Version: `0.2.51`

Bestätigt:

- `clip_shoutout` Version `0.2.51` ist aktiv.
- Der SoundSync-Listener ist installiert und empfängt Sound-Bus-Events.
- Der finale Test `so_sync_final_test_20260621_124845.txt` bestätigt den gewünschten Ablauf:
  - Clip-Shoutout läuft über Sound-System/Overlay.
  - Sound-System meldet `client_audio_ended`.
  - DisplayQueue wird auf `done` gesetzt.
  - OfficialQueue wird erst nach Clip-Ende befüllt.
  - Kein zu frühes offizielles Twitch-Shoutout mehr.

Offen bleibt der echte Live-Stream-Test bis `officialStatus=sent` / Twitch-204 bestätigt wurde.

