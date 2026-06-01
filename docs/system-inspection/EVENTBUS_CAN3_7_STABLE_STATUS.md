# EVENTBUS CAN-3.7 STABLE STATUS

Stand: 2026-06-01
Status: stabiler Zwischenstand / Dokumentation

## Ergebnis

CAN-3 ist bis einschließlich CAN-3.6 erfolgreich geprüft.

```text
CAN-3.1 Trace IDs: live
CAN-3.2 Trace Matching: live
CAN-3.3 ACK-State Plan: dokumentiert
CAN-3.4 Handshake-State in Alert-Korrelation: live
CAN-3.5 Handshake-State in Bus-Diagnostics: live
CAN-3.6 Live-Test mit echtem Alert: erfolgreich
```

## Bestätigter Live-Stand

```text
alert_system: 3.1.8
sound_system: 0.1.20
bus_diagnostics: 1.2.2
```

## CAN-3.6 Testergebnis

```text
handshakeState: matched
alertRows: 2
soundRows: 2
matched: 2
unmatched: 0
warnings: []
bundlesOk: 1
bundlesFailed: 0
```

## Bestätigte Kette

```text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State
```

## Nicht geändert

```text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Logik geändert
Keine TTS-Logik geändert
Keine DB-/Config-Änderung
Keine Recovery-Automatik
```

## Relevante Prüfbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 10
```

## Nächster sinnvoller Schritt

CAN-4 sollte nicht sofort produktive Flows umbauen. Sinnvoll ist zuerst ein weiterer Diagnose-/Absicherungs-Step:

```text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
```

Ziel: erkennen, ob ein Alert zwar Sound/Bundle sauber matched, aber das Visual Overlay kein Finish/ACK liefert.
