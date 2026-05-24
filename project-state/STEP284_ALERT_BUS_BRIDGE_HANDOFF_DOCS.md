# STEP284 – Alert Bus Bridge Handoff & Dokumentation

Datum: 2026-05-24T13:00:20Z

## Zweck

Dieser Stand dokumentiert den aktuellen Abschluss nach STEP283 und bereitet den nahtlosen Wechsel in einen neuen Chat vor.

Der Alert-Bereich ist aktuell in einem stabilen Zwischenstand:

- das bisherige produktive Alert-System bleibt erhalten,
- die neue Alert-Bus-Bridge ist als separate Overlay-Datei vorhanden,
- das echte Alert-Overlay kann über den Communication Bus getestet werden,
- die Debug View erkennt die Bridge und kann Diagnose-Snapshots erstellen,
- der Real Alert Mirror ist nur Test-/Diagnose-Schalter und bleibt im Normalbetrieb aus.

## Aktuell stabile Dateien

- `backend/modules/alert_system.js`
- `backend/modules/communication_bus.js`
- `htdocs/overlays/_overlay-alerts-v2-bus.html`
- `htdocs/public/tools/communication_debug_view.html`

## Erfolgreich getesteter Stand

Zuletzt getesteter Ablauf:

1. Neue Bridge-Overlay-Quelle geöffnet:
   `http://127.0.0.1:8080/overlays/_overlay-alerts-v2-bus.html?debug=1&mode=bridge`
2. Alte Alert-Overlay-Quelle ausgeblendet.
3. Real Alert Mirror aktiviert.
4. Echter Alert ausgelöst.
5. Snapshot aus der Communication Debug View erzeugt.

Ergebnis laut Snapshot:

- Bridge-Version `0.1.1`
- Communication Bus `0.8.1`
- Debug View `0.1.9`
- Client `overlay_alerts_v2_bus_bridge` online
- `connectedClientCount: 1`
- `emitted: 1`
- `delivered: 1`
- `ackCount: 1` beim Bus-Event
- `issues: 0`
- `dropped: 0`
- `overlayClients: 1`
- Alert Watchdog: `status: acknowledged`
- `missingFinishAck: 0`
- `noClient: 0`
- Queue leer

Timing im erfolgreichen Test:

- `queueToSoundWaitMs: 543`
- `soundPrepareDurationMs: 1`
- `soundWaitDurationMs: 1`
- `playingToOverlayMs: 4`
- `overlayToBusMirrorMs: 3`
- `playingToBusMirrorMs: 7`

## Wichtig: aktueller Betriebsmodus

Aktuell sendet das Alert-System noch nicht dauerhaft nativ über den Bus. Für die Bridge-Tests wird weiterhin der Real Alert Mirror verwendet:

- Aktivieren: `/api/alerts/bus-mirror/enable?confirm=1`
- Deaktivieren: `/api/alerts/bus-mirror/disable?confirm=1`

Normalbetrieb aktuell:

- Bridge kann als OBS-Testquelle genutzt werden.
- Mirror bleibt im Normalbetrieb aus.
- Alter Alert-Pfad bleibt erhalten.

## Was NICHT geändert wurde

- Sound-System nicht umgebaut.
- TTS-System nicht umgebaut.
- Queue-Logik nicht geändert.
- Alert-Regeln nicht geändert.
- Bestehendes altes Alert-Overlay nicht ersetzt.
- Keine DB-Migration.
- Keine bestehende Funktionalität entfernt.

## Nächste sinnvolle Arbeit

STEP285 sollte nicht wieder bei der Diagnose anfangen, sondern direkt hier anschließen:

**STEP285 – Alert-System native Bus Output Mode**

Ziel:

- Im Alert-System eine konfigurierbare Ausgabeart vorbereiten.
- Optionen z.B. `legacy`, `legacy_and_bus`, `bus_first`, später `bus_only`.
- Mirror soll perspektivisch durch einen echten regulären Bus-Ausgabeweg ersetzt werden.
- Bridge bleibt im Modus `bridge` als Fallback-fähiger Overlay-Client.
- Doppelanzeige weiterhin vermeiden.

Danach:

**Sound-System-Audit und spätere Bus-Migration**

Das Sound-System wird später als eigener großer Block behandelt, weil es zentrale Audio-/Medien-Schicht für mehrere Systeme werden soll.

Hinweis 2026-05-24: Der neue Chat-Prompt wurde nach Nutzer-Vorgabe vollständig aktualisiert und enthält nun STEP284, STEP285-Ausblick und den kommenden Sound-System-Block.
