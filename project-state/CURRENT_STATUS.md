# CURRENT_STATUS

## Stand: CAN-31.1 vorbereitet

CAN-31.1 reduziert das laute WebSocket connect/disconnect Log durch eine kurze Summary.

## Aktueller Arbeitsbereich

```text
CAN-31: WS connect/disconnect Log prüfen und drosseln
```

## Änderung CAN-31.1

Betroffene Datei:

```text
backend/server.js
```

Änderung:

```text
Einzelne [WS] client connected / disconnected Zeilen werden durch eine gedrosselte Summary ersetzt.
```

Neues erwartetes Format:

```text
[WS] clients=14 connectedDelta=14 disconnectedDelta=0 connectedTotal=14 disconnectedTotal=0
```

Zusätzlich in `/api/_status`:

```text
wsLogSummaryVersion
wsLogSummary.connectedTotal
wsLogSummary.disconnectedTotal
wsLogSummary.pendingConnected
wsLogSummary.pendingDisconnected
```

## Nicht geändert

```text
Keine WebSocket-Routen.
Kein dispatchWsMessage.
Keine Modul-Handler.
Keine Broadcast-Logik.
Keine Overlay-Logik.
Keine Dashboard-Dateien.
Keine DB.
Keine OBS-Aktion.
Keine produktiven Flows.
Keine Funktionalität entfernt.
```

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
node -c backend\server.js
.\stepdone.cmd "CAN-31.1 WS Connect Log Summary"
```

Danach Node neu starten und prüfen:

```text
[WS] clients=... connectedDelta=... disconnectedDelta=... connectedTotal=... disconnectedTotal=...
```

statt vieler einzelner:

```text
[WS] client connected
[WS] client connected
```

## Nächster Schritt

```text
CAN-31.1 anwenden und Live-Log prüfen.
```
