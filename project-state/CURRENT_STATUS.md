## STEP CAN-5.9.3 Recovery-Dashboard aufgeräumtes Layout

Stand: 2026-06-01
Marker: STEP_CAN5_9_3_RECOVERY_DASHBOARD_CLEANUP_LAYOUT

CAN-5.9.3 räumt nur die Darstellung im Recovery-Tab des Bus-Diagnostics-Dashboards auf.

~~~text
Recovery-Quelle kompakter als Zeilenliste
lange State-Werte ohne harten Wortumbruch
Tooltip mit vollständigem Wert
Blockierte Aktionen / Erlaubte Aktionen / Gründe bleiben sichtbar
Simulation-Harness bleibt read-only sichtbar
~~~

Nicht geändert:

~~~text
Keine Backend-Änderung
Keine API-Änderung
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
Keine Queue-/Sound-/Overlay-Logik geändert
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_9_3_RECOVERY_DASHBOARD_CLEANUP_LAYOUT.md`

## STEP CAN-5.9.2 Recovery-Dashboard kompakter Layout-Fix

Stand: 2026-06-01
Marker: STEP_CAN5_9_2_RECOVERY_DASHBOARD_COMPACT_LAYOUT

Die Recovery-Ansicht im Bus-Diagnostics-Dashboard wurde optisch kompakter gemacht.

~~~text
Recovery-Quelle als kompakte Kachelgruppe
Blockierte Aktionen, erlaubte Aktionen und Gründe bleiben sichtbar
Simulation-Harness bleibt read-only sichtbar
Keine Test-Buttons
Keine Recovery-Automatik
~~~

Nicht geändert:

~~~text
Keine Backend-Änderung
Keine produktive Flow-Änderung
Keine Queue-/Sound-/Overlay-Logik geändert
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_9_2_RECOVERY_DASHBOARD_COMPACT_LAYOUT.md`

## STEP CAN-5.9.1 Recovery-Dashboard Layout-Fix

Stand: 2026-06-01
Marker: STEP_CAN5_9_1_RECOVERY_DASHBOARD_LAYOUT_FIX

CAN-5.9.1 verbessert nur die Lesbarkeit im Recovery-Tab des Bus-Diagnostics-Dashboards.

~~~text
Dashboard-Datei: htdocs/dashboard/modules/bus_diagnostics.js
Recovery-Quelle breiter/als Liste dargestellt
lange State-Werte besser lesbar
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

Details: `docs/system-inspection/EVENTBUS_CAN5_9_1_RECOVERY_DASHBOARD_LAYOUT_FIX.md`

## STEP CAN-5.9 Recovery-Diagnose im Dashboard read-only sichtbar

Stand: 2026-06-01
Marker: STEP_CAN5_9_RECOVERY_DASHBOARD_READONLY_DISPLAY

CAN-5.9 ergänzt im bestehenden Bus-Diagnostics-Dashboard einen read-only Recovery-Tab.

~~~text
Dashboard-Datei: htdocs/dashboard/modules/bus_diagnostics.js
Tab: Recovery
Nur Anzeige-Logik
Keine Simulation-Buttons
Keine Recovery-Automatik
Keine produktive Flow-Änderung
~~~

Angezeigt werden Recovery-Strategy-State, Gründe, blockierte Aktionen, Quellwerte und Sicherheitsflags.

Details: `docs/system-inspection/EVENTBUS_CAN5_9_RECOVERY_DASHBOARD_READONLY_DISPLAY.md`

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
