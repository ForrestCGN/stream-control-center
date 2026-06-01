# EVENTBUS CAN-5.0 RECOVERY / TIMEOUT STRATEGY PLAN

Stand: 2026-06-01
Status: Plan / Read-only Vorbereitung

## Ausgangslage

CAN-3 und CAN-4 sind als Diagnose-Zwischenstand stabil bestätigt.

```text
Alert -> Sound -> Visual Overlay -> Finish-ACK
```

Bestätigter Stand:

```text
alert_system: 3.1.9
sound_system: 0.1.20
bus_diagnostics: 1.2.2
handshakeState: matched
visualDeliveryState: matched_and_visual_acknowledged
warnings: []
```

## Ziel von CAN-5

CAN-5 definiert, welche Zustände später sicher behandelt werden dürfen.

Noch keine Recovery-Automatik aktivieren.

## Zu behandelnde Zustände

```text
missingAck
noClient
unmatched
waiting_too_long
sound_fetch_failed
bundle_wait_timeout
overlay_watchdog_issue
```

## Grundregeln

```text
Keine doppelte Alert-Auslösung
Keine doppelte Sound-Auslösung
Keine automatische Wiederholung ohne Schutzfenster
Keine Recovery bei unklarer Korrelation
Keine Änderung an bestehenden Queue-/Sound-/Overlay-Flows in CAN-5.0
```

## Erste Strategie-Matrix

| Zustand | Diagnose | Spätere mögliche Aktion | CAN-5.0 Entscheidung |
|---|---|---|---|
| matched_and_visual_acknowledged | alles ok | keine | ok |
| matched_waiting_for_visual_ack | Overlay wartet noch | weiter beobachten | read-only |
| matched_but_visual_ack_missing | ACK fehlt nach expectedAckBy | manuelle Recovery prüfen | keine Automatik |
| matched_but_no_overlay_client | kein Overlay-Client beim Send | Browserquelle/OBS prüfen | keine Automatik |
| sound_not_matched_yet | Sound-Kette noch nicht bestätigt | warten/diagnostizieren | read-only |
| unmatched | Alert ohne Sound-Match | Warnung anzeigen | keine Wiederholung |
| sound_eventbus_unavailable | Sound-Status nicht erreichbar | Modulstatus prüfen | keine Aktion |

## Nächster Code-Step Vorschlag

```text
CAN-5.1: Recovery-Strategy-Status read-only in Bus-Diagnostics ergänzen
```

Mögliche Felder:

```text
recoveryStrategyState.ok
recoveryStrategyState.mode
recoveryStrategyState.readOnly
recoveryStrategyState.allowedActions
recoveryStrategyState.blockedActions
recoveryStrategyState.reasons
recoveryStrategyState.nextAction
```

## Nicht ändern

```text
Keine Queue-Logik ändern
Keine Sound-Playback-Logik ändern
Keine Overlay-Ausgabe ändern
Keine TTS-Logik ändern
Keine automatische Recovery aktivieren
Keine DB-/Config-Migration
```
