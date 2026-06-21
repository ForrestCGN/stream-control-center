## STEP_DOC_MASTER_PROMPT_STEPDONE_DESCRIPTION_RULE

Stand: 2026-06-21

Bestätigt / ergänzt:

- Master-Prompt wurde um die verbindliche Regel ergänzt, dass jeder ZIP-Step künftig einen vollständigen Abschlussblock enthalten muss.
- Pflicht je ZIP-Step: `installstep.cmd`, Neustart-Hinweis, Testbefehle, erwartete Version/Build-Werte, konkreter `stepdone.cmd`-Befehl mit Beschreibung und `stepundo.cmd`-Hinweis.
- Hintergrund: Beim HypeTrain-FIX1 fehlte die `stepdone.cmd`-Beschreibung in der ZIP-Antwort; das wurde als dauerhafte Arbeitsregel aufgenommen.

Nicht geändert:

```text
Backend-Code
Dashboard
Datenbank
HypeTrain-Runtime
Sound-System
Twitch-Events
```

---

## STEP_HT2_1_FIX1_HYPETRAIN_PREVIEW_LINEBREAK

Stand: 2026-06-21
Marker: `STEP_HT2_1_FIX1_HYPETRAIN_PREVIEW_LINEBREAK`
Modul: `hypetrain`
Version: `0.1.1`

### Status

- HT2.1 Backend-Modul ist installiert und lauffähig.
- Statusroute, DB-Schema, Settings, Texte, Bus-Subscriptions, Preview und synthetischer DB-Test wurden bestätigt.
- Fix1 korrigiert nur die Preview-/Discord-Formatierung: Zwischen `GiftSubs` und `HypeTrain-Punkte` steht jetzt zuverlässig ein Zeilenumbruch.

### Nicht geändert

```text
Keine produktive Discord-Ausgabe aktiviert
Keine produktive Tagebuch-Ausgabe aktiviert
Keine Dashboard-Tabs ergänzt
Kein Umbau von twitch_events
Kein Umbau von sound_system
Keine Funktionalität entfernt
```

---

## STEP_HT2_1_HYPETRAIN_BACKEND_DB_STATUS_PREVIEW

Stand: 2026-06-21  
Modul: `hypetrain`  
Version: `0.1.0`

### Neu

- Neues HypeTrain-Fachmodul als Backend-Basis erstellt.
- Das Modul abonniert vorhandene Bus-Events aus `twitch_events` und baut kein eigenes EventSub-System.
- DB-Tabellen vorbereitet:
  - `hypetrain_runs`
  - `hypetrain_contributions`
  - `hypetrain_runtime_events`
- Settings werden ueber `hypetrain_settings` vorbereitet.
- Multi-Texte/Textvarianten werden ueber das vorhandene `module_text_variants`-System vorbereitet.
- Discord-/Tagebuch-Ausgaben sind in HT2.1 nur Vorschau, nicht produktiv sendend.
- Top-Unterstuetzer und Namen sind standardmaessig deaktiviert.

### Status-Routen

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
GET  /api/hypetrain/routes
```

### Wichtig

`twitch_events` bleibt in diesem Step unveraendert und weiterhin EventSub-/Event-Besitzer. Das neue Modul hoert nur zu und speichert/previewt.

---

## STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

Stand: 2026-06-21
Marker: `STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED`
Modul: `clip_shoutout`
Version: `0.2.51`

### Bestätigt

- `clip_shoutout` Version `0.2.51` ist aktiv.
- Der SoundSync-Listener ist installiert und empfängt Sound-Bus-Events.
- Der finale Test `so_sync_final_test_20260621_124845.txt` bestätigt den gewünschten Ablauf:
  - Clip-Shoutout läuft über Sound-System/Overlay.
  - Sound-System meldet `client_audio_ended`.
  - DisplayQueue wird auf `done` gesetzt.
  - OfficialQueue wird erst nach Clip-Ende befüllt.
  - Kein zu frühes offizielles Twitch-Shoutout mehr.

### Testbefund

DisplayQueue-ID `236`:

```text
status = done
displayStartedAt = 2026-06-21T10:49:47.028Z
displayFinishedAt = 2026-06-21T10:49:57.524Z
officialQueueId = 177
officialQueuedAt = 2026-06-21T10:49:57.527Z
officialStatus = waiting
officialError = waiting_official_cooldown
```

Sound-System Recent Playback:

```text
label = Video-Shoutout @together_not_alone
mediaType = twitch_clip
sourceModule = clip_shoutout
startedAt = 2026-06-21T10:49:47.763Z
audioEndedAt = 2026-06-21T10:49:57.530Z
finishedAt = 2026-06-21T10:49:59.540Z
reason = client_audio_ended
```

### Ergebnis

```text
✅ Clip läuft über Sound-System/Overlay
✅ Clip-Ende wird erkannt
✅ DisplayQueue wird auf done gesetzt
✅ OfficialQueue wird erst nach Clip-Ende befüllt
✅ Kein zu frühes offizielles SO mehr
⚠️ Finale Twitch-Sendebestätigung nur sauber im echten Livebetrieb möglich
```

### Einschränkung

Der Test lief im Offline-/Grace-Zustand. Der Sync ist bestätigt, aber ein finaler `officialStatus=sent` / Twitch-204 muss im nächsten echten Livebetrieb geprüft werden.

Details:

- `docs/current/STEP_SO_SYNC_FINAL_VERIFIED_2026-06-21.md`
- `docs/current/CURRENT_CHAT_HANDOFF_SO_SYNC_2026-06-21.md`

---

## STEP_HT1_FIX1_HYPETRAIN_MEDIA_SAVE

Stand: 2026-06-19

Bestätigt aus Testlog:
- Hype-Train-Rekord-Erkennung funktioniert.
- Total- und Level-Rekord werden erkannt.
- Tagebuch-Eintrag bei Hype-Train-Ende funktioniert.

Fix:
- Dashboard-Save-Bug bei `recordSound.mediaId` behoben.
- Ursache: Beim Speichern wurde zuerst gerendert; dadurch ging die aktuell im MediaField gesetzte Hidden-Input-Auswahl verloren.
- Lösung: Config wird jetzt vor dem Busy-Render aus dem DOM gelesen.

Nächster Test:
- Sound im Dashboard auswählen, speichern, Status prüfen: `recordSound.mediaId` muss > 0 sein.
- Danach synthetischen Hype-Train-Rekord mit neuer ID testen.

---

## STEP CAN-5.8 Recovery-Diagnose Dashboard-Plan

Stand: 2026-06-01
Marker: STEP_CAN5_8_RECOVERY_DASHBOARD_PLAN

CAN-5.8 plant die spätere read-only Anzeige der Recovery-Diagnose im bestehenden Bus-Diagnostics-Dashboard.

~~~text
Nur read-only anzeigen
Keine Simulation per Dashboard auslösen
Keine automatische Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

Geplante Anzeige:

~~~text
recoveryStrategyState.mode
recoveryStrategyState.state
recoveryStrategyState.severity
recoveryStrategyState.nextAction
recoveryStrategyState.reasons
recoveryStrategyState.blockedActions
automationEnabled
productiveActions
flowTouched / queueTouched / soundSystemTouched / alertSystemTouched / overlayTouched
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_8_RECOVERY_DASHBOARD_PLAN.md`

## STEP CAN-5.7 Simulation-Harness Live-Test stabil bestätigt

Stand: 2026-06-01
Marker: STEP_CAN5_7_SIMULATION_HARNESS_LIVE_TEST_STABLE

CAN-5.6 wurde live mit dem CAN-5.5 read-only Recovery-Simulation-Harness geprüft.

~~~text
bus_diagnostics: 1.2.4
feature: recovery_simulation_harness
simulationVersion: CAN-5.5
readOnly: true
automationEnabled: false
productiveActions: false
flowTouched: false
queueTouched: false
soundSystemTouched: false
alertSystemTouched: false
overlayTouched: false
~~~

Geprüfte Szenarien:

~~~text
missingAck -> blocked_missing_visual_ack
noClient   -> blocked_no_overlay_client
unmatched  -> blocked_unmatched_alert_sound
~~~

Bestätigung:

~~~text
Simulationen sind synthetisch.
Keine echten Alerts wurden ausgelöst.
Keine Sounds wurden gestartet.
Keine Overlays wurden gesteuert.
Keine Recovery-Automatik wurde aktiviert.
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_7_SIMULATION_HARNESS_LIVE_TEST_STABLE.md`

## STEP CAN-5.5 Read-only Recovery Simulation Harness

Stand: 2026-06-01
Marker: STEP_CAN5_5_READONLY_RECOVERY_SIMULATION_HARNESS

CAN-5.5 ergänzt isolierte Recovery-Simulationen in bus_diagnostics.

~~~text
bus_diagnostics: 1.2.4
/api/bus-diagnostics/recovery-simulation/status
/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck
readOnly: true
automationEnabled: false
productiveActions: false
~~~

Keine echten Alerts/Sounds/Overlays werden ausgelöst.


## STEP CAN-5.4 Fehler-/Timeout-Simulation geplant

Stand: 2026-06-01
Marker: STEP_CAN5_4_ERROR_TIMEOUT_SIMULATION_PLAN

CAN-5.4 definiert die geplanten read-only Fehler- und Timeout-Simulationen.

~~~text
missingAck
noClient
unmatched
waiting_too_long
sound_fetch_failed
bundle_wait_timeout
overlay_watchdog_issue
~~~

Regel bleibt:

~~~text
Recovery bleibt read-only
automationEnabled bleibt false
keine produktive Wiederholung
keine Flow-Änderung
~~~

## STEP CAN-5.3 Recovery read-only stabil bestätigt

Stand: 2026-06-01
Marker: STEP_CAN5_3_RECOVERY_READONLY_STABLE

CAN-5.2 wurde live mit einem Test-Alert erfolgreich geprüft.

```text
bus_diagnostics: 1.2.3
summary.status: ok
handshakeState: matched
correlationMatched: 2
correlationUnmatched: 0
recoveryStrategyMode: read_only
recoveryStrategyState: ok_no_recovery_needed
automationEnabled: false
warnings: []
errors: []
flowTouched: false
```

Bestätigt:

```text
Alert erfolgreich
Sound erfolgreich
Visual ACK erfolgreich
Recovery bleibt read-only
keine Automatik ausgelöst
```

Keine produktive Flow-Änderung in diesem Dokumentations-Step.

## STEP CAN-5.1 Recovery Strategy State read-only

Stand: 2026-06-01
Marker: STEP_CAN5_1_RECOVERY_STRATEGY_STATE

Bus-Diagnostics zeigt jetzt zusätzlich einen read-only Recovery-Strategy-Status.

```text
bus_diagnostics: 1.2.3
recoveryStrategyState.mode: read_only
automationEnabled: false
flowTouched: false
blockedActions: auto_replay_alert, auto_replay_sound, auto_retry_overlay, auto_recovery
```

Keine produktive Recovery-Automatik wurde aktiviert.

## STEP CAN-5.0 Recovery-/Timeout-Strategie geplant

Stand: 2026-06-01
Marker: STEP_CAN5_0_RECOVERY_TIMEOUT_PLAN

CAN-5.0 dokumentiert nur die Strategie für spätere Recovery-/Timeout-Behandlung.

```text
Status: Plan / read-only
Keine Recovery-Automatik
Keine Backend-Modul-Code-Änderung
Keine Flow-Änderung
```

Wichtigste Regel:

```text
Keine doppelte Alert- oder Sound-Auslösung durch Recovery.
```

## STEP CAN-4.3 Overlay ACK stabil dokumentiert

Stand: 2026-06-01
Marker: STEP_CAN4_3_OVERLAY_ACK_STABLE

CAN-4.2 wurde live erfolgreich geprüft.

```text
alert_system: 3.1.9
handshakeState: matched
visualDeliveryState: matched_and_visual_acknowledged
overlayRows: 1
acknowledged: 1
waiting: 0
missingAck: 0
noClient: 0
warnings: []
ackEvent: finished
ackReason: finished
ackLatencyMs: 25867
```

Bestätigte Kette:

```text
Alert -> Sound -> Visual Overlay -> Finish-ACK
```

Keine produktive Flow-Änderung in diesem Dokumentations-Step.

# CURRENT SYSTEM STATUS – STEP278 Vorbereitung

<!-- CAN-3.7-STABLE-STATUS:START -->
## CAN-3.7 stabiler Zwischenstand

Stand: 2026-06-01

### Ergebnis

CAN-3 ist bis einschließlich CAN-3.6 erfolgreich geprüft.

```text
alert_system: 3.1.8
sound_system: 0.1.20
bus_diagnostics: 1.2.2
handshakeState: matched
matched: 2
unmatched: 0
warnings: []
```

### Bestätigte Kette

```text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State
```

### Wichtig

Dieser Stand ist ein Diagnose-/Stabilitätsstand. Es wurden keine produktiven Flow-Umbauten an Queue, Sound-Playback, Overlay, TTS, DB oder Config vorgenommen.

Details: `docs/system-inspection/EVENTBUS_CAN3_7_STABLE_STATUS.md`
<!-- CAN-3.7-STABLE-STATUS:END -->


Stand: 2026-05-31 08:14 UTC

## Kontext

Projekt: `stream-control-center`  
Repo: `https://github.com/ForrestCGN/stream-control-center`  
Branch: `dev`  
Live-System: `D:\Streaming\stramAssets`  
Lokales Repo: `D:\Git\stream-control-center`

## Aktueller Arbeitsstand

Heute wurde kein Script-Umbau durchgeführt. Es wurde nur die Konfiguration für einen Live-Test angepasst.

### Clip-/Shoutout-System

Datei: `D:\Streaming\stramAssets\config\clip_system.json`

Unter `clipShoutout.officialShoutout` wurde für den heutigen Test gesetzt:

```json
"officialShoutout": {
  "enabled": true,
  "liveGateEnabled": false
}
```

Ziel: Die interne Live-Sperre des Clip-Shoutout-Moduls testweise deaktivieren, damit geprüft werden kann, ob wartende offizielle Twitch-Shoutouts während des Streams korrekt abgearbeitet werden.

Der Status nach der Änderung zeigte:

```json
"officialShoutout": {
  "liveGateEnabled": false,
  "globalCooldownMs": 120000,
  "targetCooldownMs": 3600000
}
```

und:

```json
"officialQueue": {
  "liveGate": {
    "enabled": false,
    "live": false
  },
  "pending": 10
}
```

Damit ist die Live-Gate-Sperre aktuell aus. Die alten Queue-Einträge enthalten teilweise weiterhin `last_error: waiting_stream_live_offline`, das ist aber der gespeicherte alte Fehlertext am jeweiligen Eintrag.

### Weiterhin aktive Sperren

Auch mit deaktiviertem Live-Gate sind weiterhin aktiv:

```json
"globalCooldownMs": 120000
```

= 2 Minuten Abstand zwischen offiziellen Twitch-Shoutouts insgesamt.

```json
"targetCooldownMs": 3600000
```

= 1 Stunde Sperre pro Zielkanal.

Der Status zeigte außerdem:

```json
"lastBusEvent": {
  "action": "shoutout.official.waiting_cooldown"
}
```

Das bedeutet: Nach Deaktivierung des Live-Gates wartet die Official-Queue nicht mehr auf „Stream live“, sondern auf den Cooldown.

## Beobachtung für heutigen Stream

Gestern funktionierten die offiziellen Shoutouts grundsätzlich. Heute soll beobachtet werden, ob sie mit deaktiviertem Live-Gate wieder zuverlässig gesendet werden.

Beim Stream beobachten:

- Kommt `!so` / `!vso` rein?
- Wird der Video-/Clip-Shoutout über Sound-System/Overlay abgespielt?
- Wird danach der offizielle Twitch-Shoutout gesendet?
- Wenn mehrere Shoutouts kommen: warten sie sauber in der Queue?
- Werden die offiziellen Shoutouts alle 2 Minuten gesendet?
- Wird derselbe Zielkanal innerhalb 1 Stunde korrekt blockiert?

## Bekannte Auffälligkeiten

Der Status zeigte weiterhin:

```text
registeredCommand: false
```

und:

```text
Unknown named parameter 'trigger'
```

Das ist nicht direkt der Live-Gate-Blocker, muss aber später geprüft werden.

## Alert-System / Overlay-Kommunikation

Es trat wiederholt ein Problem auf:

- Sound/TTS wurde abgespielt.
- Visuelles Alert-Overlay wurde nicht angezeigt.
- Nach `/api/alerts/clear` und Aktualisieren der OBS-Browserquelle lief es wieder.

Aus dem Status war auffällig:

```json
"queueLength": 2,
"current": null,
"currentEventId": null
```

sowie `active_bundle_lock` und ein `waitForStart`-Timeout von 300 Sekunden.

Interpretation: Wahrscheinlich Kommunikations-/Timingproblem zwischen Alert-System, Sound-System und Overlay. Kein OBS-Designproblem und kein Benutzerfehler.

## Geplanter nächster großer Schritt

`STEP278_COMMUNICATION_AND_QUEUE_RESILIENCE`

Ziel:

- Kommunikation zwischen Backend-Modulen, Sound-System und Overlays prüfen.
- Einheitlichen Ablauf für Start, Queue, Running, Finished, Failed definieren.
- Verhindern, dass Sound/TTS läuft, aber Overlay kein klares Play-Signal bekommt.
- Verhindern, dass Queues in Zwischenzuständen hängen.
- Live-/Offline-Status robuster und transparenter machen.
- Dashboard-Status verbessern.

## CAN-4.0 Plan erstellt

Stand: 2026-06-01

CAN-3 ist stabil dokumentiert. CAN-4 beginnt als reiner Plan-/Diagnoseabschnitt.

```text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
```

Ziel ist, den naechsten Fehlerbereich sichtbar zu machen: Alert/Sound kann sauber gematcht sein, waehrend das visuelle Overlay eventuell kein Finish/ACK liefert.

Dokument:

```text
docs/system-inspection/EVENTBUS_CAN4_0_OVERLAY_ACK_VISUAL_DELIVERY_PLAN.md
```

## STEP_HT1_FIX2_HYPETRAIN_MEDIA_STATE_SAVE

Status: gebaut / einzuspielen.

Fix fuer Hype-Train-Rekord-Dashboard: Media-Auswahl wird beim `media-field:change` sofort im Modul-State gespiegelt und beim Speichern aus Hidden-Input, MediaField-Dataset oder State gelesen. Ziel ist, dass `recordSound.mediaId` nach dem Speichern stabil in `config/twitch_events.json` landet.


## STEP_HT1_FIX3_HYPETRAIN_DASHBOARD_RENDER_FIX
- Twitch-Events-Dashboard-Renderfehler im Hype-Train-Rekord-Tab behoben.
- Ursache: `selectedMediaId` wurde im Template genutzt, aber im Render-Scope nicht gesetzt.
- Backend-Status HT1 bleibt unverändert.
