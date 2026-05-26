# STEP298 – SoundBus Consumer-/Dashboard-Planung

## Typ

Planung/Dokumentation, keine Codeänderung.

## Zusammenfassung

Nach den bestätigten SoundBus-Tests wurde festgelegt, wie SoundBus künftig von Debug-Views, Dashboard, Overlays und Modulen genutzt werden soll.

## Ergebnis

SoundBus bleibt im Dev-/Testbetrieb aktiv:

```text
soundBus.enabled = true
```

Der Bus ist freigegeben für:

- Debug-/Monitoring-Views
- Dashboard-Live-Anzeigen
- Event-Korrelation
- spätere, separat getestete Overlay-/Modul-Consumer

Nicht freigegeben für:

- sofortige Bus-only-Migration
- Entfernen alter HTTP-/WebSocket-Wege
- direkte Modulsteuerung nur über Bus

## Wichtige Regeln

- Dashboard liest Bus-Events, steuert aber über Backend-APIs.
- Debug Views senden standardmäßig keine ACKs.
- Overlay-Consumer brauchen klare Targets/Capabilities.
- Modul-Migrationen werden einzeln geplant und getestet.
- Keine Funktionalität entfernen.

## Nächster Schritt

STEP299 – Sound Dashboard Monitoring Modul Plan/Scaffold.
