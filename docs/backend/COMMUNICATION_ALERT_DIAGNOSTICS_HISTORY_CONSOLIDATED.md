# Communication / Alert Diagnostics History – konsolidiert

Stand: 2026-05-29  
Erstellt in: STEP538_COMMUNICATION_AUDIT_CONSOLIDATION

## Ziel

Diese Datei konsolidiert die letzte verbliebene technische STEP-Doku im aktiven Bereich:

```text
docs/backend/COMMUNICATION_AUDIT_STEP279_RESULT.md
```

Die ursprüngliche Einzeldatei wird nicht vergessen, sondern nach Prüfung per Quarantine-Skript aus dem aktiven Doku-Bereich verschoben.

## Ausgangsproblem

Bei Alerts kam es wiederholt vor, dass Sound/TTS abgespielt wurden, aber das visuelle Alert-Overlay nicht angezeigt wurde.

Nach `/api/alerts/clear` und Aktualisieren der OBS-Browserquelle funktionierte es wieder.

Ziel des Audits war nicht nur ein einzelner Alert-Fix, sondern eine grundlegende Prüfung der Kommunikation zwischen:

```text
Backend-Modulen
Sound-System
Overlays
WebSocket-/HTTP-Signalen
Communication Bus
```

## Konsolidiertes Ergebnis

Der getestete Alert-Flow zeigte:

```text
- echter Alert-Flow erreicht playing korrekt
- altes Alert-Overlay-Signal wird direkt nach playing gesendet
- Communication-Bus-Mirror wird direkt danach gesendet
- Bus liefert an Master-Test-Client aus und erhält ACKs
- echtes Alert-Overlay meldet nach Ablauf finished zurück
- manuelle Recovery clear_overlay funktioniert
- Recovery verändert Queue, Sound und TTS nicht
```

Bewertung:

```text
Der Fehler war im getesteten Zustand nicht reproduzierbar.
Wahrscheinlichste Fehlerzone bei Wiederauftreten:
OBS-Browserquelle, Overlay-WebSocket, Reconnect/Stale-State oder konkreter Overlay-Empfangs-/Renderzustand.
```

## Real Alert Bus Mirror

Routen:

```text
/api/alerts/bus-mirror/status
/api/alerts/bus-mirror/enable?confirm=1
/api/alerts/bus-mirror/disable?confirm=1
```

Eigenschaften:

```text
- direkt in backend/modules/alert_system.js integriert
- kein separates Bridge-Modul
- Runtime-only aktivierbar
- nach Backend-Neustart wieder aus, solange nicht per Config aktiviert
- sendet echte Alert-Events als visual.alert.play in den Communication Bus
```

Bestätigter Teststand:

```text
emitted: 1
skipped: 0
errors: 0
lastResult.ok: true
deliveredCount: 1
deliveredTo: overlay_master_test
```

## Alert Timing Diagnostics

Timing wird über `/api/alerts/bus-mirror/status` sichtbar.

Gemessene Punkte:

```text
queuedAt
queuePickedAt
waitingForSoundAt
soundBundleReadyAt
soundWaitDoneAt
playingAt
overlaySentAt
busMirrorSentAt
```

Bestätigter Test:

```text
queueToSoundWaitMs: 557
soundPrepareDurationMs: 1
soundWaitDurationMs: 2
soundWaitDoneToPlayingMs: 1
playingToOverlayMs: 5
overlayToBusMirrorMs: 2
playingToBusMirrorMs: 7
```

Bewertung:

```text
Sound/Playing/Overlay/Bus liegen zeitlich sauber zusammen.
```

## Alert Overlay Delivery Watchdog

Routen:

```text
/api/alerts/overlay-watchdog/status
/api/alerts/overlay-watchdog/check
/api/alerts/overlay-watchdog/reset?confirm=1
```

Erkannte Zustände:

```text
acknowledged
no_overlay_client
waiting_for_finish_ack
missing_finish_ack
```

Bestätigter Test:

```text
overlayClients: 1
acknowledged: 1
issues: 0
noClient: 0
missingFinishAck: 0
status: acknowledged
ackEvent: finished
ackReason: finished
timedOut: false
```

## Manuelle Alert-Overlay-Recovery

Route:

```text
/api/alerts/overlay-watchdog/recover?confirm=1
```

Eigenschaften:

```text
- sendet ausschließlich ein clear an das bestehende Alert-Overlay
- verändert keine Queue
- verändert keinen Sound
- verändert kein TTS
- startet OBS nicht neu
- führt keine automatische Recovery aus
```

Bestätigter Test:

```text
mode: clear_overlay
overlayClientCount: 1
issuesBefore: 0
affectedCount: 0
overlayClearSent: true
queueChanged: false
soundChanged: false
ttsChanged: false
```

## Communication Debug View

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Zeigt:

```text
- Communication Bus Status
- Bus Events / Clients / Issues
- Real Alert Mirror + Timing
- Echtes Alert-Overlay ACK
- Recovery-Status
- Buttons für Status/Check/Recovery
- Auto-Refresh
```

## Diagnose bei erneutem Fehler

Wenn wieder `Sound/TTS läuft, aber Overlay erscheint nicht` passiert:

1. Communication Debug View öffnen.
2. Prüfen: `Real Alert Mirror + Timing`
   - `emitted > 0`?
   - `errors = 0`?
   - `overlaySentAt` vorhanden?
   - `busMirrorSentAt` vorhanden?
3. Prüfen: `Echtes Alert-Overlay ACK`
   - `overlayClients = 0` → OBS-Browserquelle/Overlay nicht verbunden.
   - `missingFinishAck > 0` → Overlay hat Play vermutlich nicht korrekt verarbeitet oder ist währenddessen ausgestiegen.
   - `acknowledged` → Overlay hat den Alert verarbeitet; dann eher visuelles Rendering/Layer/OBS-Sichtbarkeit prüfen.
4. Bei Bedarf manuell `Overlay Recovery Clear` auslösen.
5. Erst danach OBS-Browserquelle aktualisieren, falls Recovery nicht reicht.

## Bewusst nicht umgesetzt

```text
- keine automatische Recovery-Policy
- kein automatischer OBS-Reload
- kein Ersatz des bestehenden Alert-Overlay-WebSocket-Flows
- kein Entfernen bestehender Funktionalität
- keine DB-Migration
- kein neues dauerhaftes Alert-Mirror-Modul
```

## Empfehlung

Den Stand zunächst im Live-Betrieb beobachten.

Eine automatische Recovery sollte erst umgesetzt werden, wenn mindestens ein realer Fehlerfall mit Watchdog-Daten vorliegt.

Bis dahin ist die manuelle Recovery sicherer und vermeidet falsche Eingriffe während laufender Alerts.

## STEP281 Ergänzung

Die Communication Debug View enthält einen Normalbetrieb-/Live-Check.

Dieser Check ist nur lesend und ändert keine Alert-, Sound-, TTS- oder Queue-Logik.

## STEP283/STEP284 Ergänzung

Der Audit wurde in eine erste praktische Migration überführt.

Die neue Alert Bus Bridge wurde als einzelner aktiver Overlay-Client getestet:

```text
Bus lieferte Alert-Event an overlay_alerts_v2_bus_bridge.
Bridge sendete ACK.
Alert-System erhielt reguläres finished.
```

Daraus ergab sich als nächster sinnvoller Schritt ein nativer Bus-Ausgabeweg im Alert-System.

## Leitplanken

Diese Sammeldoku erlaubt keine Runtime-Änderung.

Bei späteren Communication-/Alert-/Overlay-Arbeiten immer:

```text
- echte aktuelle Dateien prüfen
- keine Funktionalität entfernen
- bestehende Alert-Overlay-WebSocket-Flows nicht ohne Plan ersetzen
- keine automatische Recovery ohne echten Watchdog-Fehlerfall
- Queue/Sound/TTS bei Overlay-Recovery nicht verändern
- OBS-Reload nicht automatisieren, solange manuelle Recovery reicht
- keine DB/Secrets überschreiben oder committen
```
