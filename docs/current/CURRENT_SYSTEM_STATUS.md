# CURRENT SYSTEM STATUS – STEP301

Stand: 2026-05-24

## Aktueller Fokus

SoundBus ist nach STEP289–STEP297 als stabile Event-/Status-Schicht im Dev-/Testbetrieb aktiv. STEP299 hat das rein lesende SoundBus/Sound-System Monitoring im Dashboard ergänzt. STEP300 hat den Live-Test dieses Dashboard-Monitors bestätigt. STEP301 validiert die Dashboard-/Auth-/Backend-Einbindung.

Aktuelle Betriebsentscheidung:

```text
soundBus.enabled = true
```

Dies ist weiterhin keine vollständige Bus-only-Produktivmigration. Bestehende HTTP-/WebSocket-Wege bleiben aktiv.

## Bestätigte Punkte

- SoundBus-Basis-Events funktionieren.
- `/api/sound/status` enthält Top-Level `soundBus`.
- Einzel-Sound `test_ping` erfolgreich.
- Alert-Bundle mit Sound + TTS erfolgreich.
- V5 Queue-/Bundle-Regression bestanden.
- Discord Media Path Resolver Fix bestätigt.
- SoundBus Debug View funktioniert.
- Sound Dashboard Monitoring Modul wurde im Dashboard sichtbar getestet.
- Dashboard-/Auth-/Backend-Einbindung wurde geprüft.

## STEP301 Ergebnis

Validiert:

- Das Sound-System Dashboard-Modul ist regulär eingebunden.
- `sound_system` ist in der Dashboard-Modulstruktur vorhanden.
- Der Monitor nutzt die bestehende Dashboard-API-Hilfe `window.CGN.api`.
- Keine neuen Backend-Routen wurden benötigt.
- `dashboard_auth.js` musste nicht geändert werden.
- `dashboard_controlcenter.js` musste nicht geändert werden.
- `sound_system.js` musste nicht geändert werden.
- `communication_bus.js` musste nicht geändert werden.

Auffälligkeit:

- Der Button `Status neu laden` im Bus-Monitor hängt aktuell an der bestehenden Action `reload`.
- Diese Action ruft `POST /api/sound/reload` auf und lädt danach den Status.
- Für eine strikt rein lesende Bus-Monitor-Ansicht sollte dieser Button künftig auf eine reine Frontend-/Status-Refresh-Action umgestellt werden.

## Nächster Schritt

STEP302 – Sound Dashboard Bus-Monitor Readonly Refresh Fix.

Ziel:

- Im Bus-Monitor `Status neu laden` nicht mehr über `POST /api/sound/reload` ausführen.
- Stattdessen nur den Status neu laden.
- Keine Sound-/Queue-/Bundle-/SoundBus-Logik ändern.
