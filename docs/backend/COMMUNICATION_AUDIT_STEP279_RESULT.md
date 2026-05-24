# STEP279 – Communication Audit Ergebnis

Status: abgeschlossen / stabiler Diagnose- und Recovery-Stand

## Ausgangsproblem

Bei Alerts kam es wiederholt vor, dass Sound/TTS abgespielt wurden, aber das visuelle Alert-Overlay nicht angezeigt wurde. Nach `/api/alerts/clear` und Aktualisieren der OBS-Browserquelle funktionierte es wieder.

Ziel des Audits war nicht nur ein einzelner Alert-Fix, sondern eine grundlegende Prüfung der Kommunikation zwischen Backend-Modulen, Sound-System, Overlays und WebSocket-/HTTP-Signalen.

## Ergebnis in Kurzform

Der aktuelle Teststand zeigt:

- Der echte Alert-Flow erreicht den `playing`-Punkt korrekt.
- Das alte Alert-Overlay-Signal wird direkt nach `playing` gesendet.
- Der Communication-Bus-Mirror wird direkt danach gesendet.
- Der Bus liefert an den Master-Test-Client aus und erhält ACKs.
- Das echte Alert-Overlay meldet nach Ablauf korrekt `finished` zurück.
- Die manuelle Recovery `clear_overlay` funktioniert und verändert Queue, Sound und TTS nicht.

Damit ist der Fehler im getesteten Zustand nicht reproduzierbar. Wenn er erneut auftritt, ist die wahrscheinlichste Fehlerzone nicht der generelle Alert-Timing-Pfad, sondern OBS-Browserquelle, Overlay-WebSocket, Reconnect/Stale-State oder ein konkreter Overlay-Empfangs-/Renderzustand.

## Stabile Bestandteile

### Real Alert Bus Mirror

Route:

```text
/api/alerts/bus-mirror/status
/api/alerts/bus-mirror/enable?confirm=1
/api/alerts/bus-mirror/disable?confirm=1
```

Eigenschaften:

- Direkt in `backend/modules/alert_system.js` integriert.
- Kein separates Bridge-Modul.
- Runtime-only aktivierbar.
- Nach Backend-Neustart wieder aus, solange nicht per Config aktiviert.
- Sendet echte Alert-Events als `visual.alert.play` in den Communication Bus.

Bestätigter Test:

```text
emitted: 1
skipped: 0
errors: 0
lastResult.ok: true
deliveredCount: 1
deliveredTo: overlay_master_test
```

### Alert Timing Diagnostics

Status wird über `/api/alerts/bus-mirror/status` mit ausgegeben.

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

Bewertung: Sound/Playing/Overlay/Bus liegen zeitlich sauber zusammen.

### Alert Overlay Delivery Watchdog

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

### Manuelle Alert-Overlay-Recovery

Route:

```text
/api/alerts/overlay-watchdog/recover?confirm=1
```

Eigenschaften:

- Sendet ausschließlich ein `clear` an das bestehende Alert-Overlay.
- Verändert keine Queue.
- Verändert keinen Sound.
- Verändert kein TTS.
- Startet OBS nicht neu.
- Führt keine automatische Recovery aus.

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

### Communication Debug View

URL:

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

Zeigt aktuell:

- Communication Bus Status
- Bus Events / Clients / Issues
- Real Alert Mirror + Timing
- Echtes Alert-Overlay ACK
- Recovery-Status
- Buttons für Status/Check/Recovery
- Auto-Refresh

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

- Keine automatische Recovery-Policy.
- Kein automatischer OBS-Reload.
- Kein Ersatz des bestehenden Alert-Overlay-WebSocket-Flows.
- Kein Entfernen bestehender Funktionalität.
- Keine DB-Migration.
- Kein neues dauerhaftes Alert-Mirror-Modul.

## Empfehlung

Den Stand zunächst im Live-Betrieb beobachten. Eine automatische Recovery sollte erst umgesetzt werden, wenn mindestens ein realer Fehlerfall mit Watchdog-Daten vorliegt. Bis dahin ist die manuelle Recovery sicherer und vermeidet falsche Eingriffe während laufender Alerts.


## STEP281

Die Communication Debug View enthält nun einen Normalbetrieb-/Live-Check. Der Check ist nur lesend und ändert keine Alert-, Sound-, TTS- oder Queue-Logik.
