# Overlay EventBus Standard – STEP623

## Referenz

Das Referenzoverlay ist:

```text
htdocs/overlays/_overlay-eventbus-test.html
```

Es nutzt:

```text
htdocs/overlays/shared/overlay_bus_client.js
```

## Standard-Verhalten pro Overlay

Ein produktives Overlay soll:

1. beim Laden `bus_hello` senden,
2. alle 5 Sekunden `bus_heartbeat` senden,
3. bei WebSocket-Close offline werden,
4. bei `requireAck=true` ACKs senden,
5. eine feste `clientId`, ein `module`, einen Anzeigenamen und Capabilities besitzen,
6. Page-Visibility und Overlay-Datei in den Meta-Daten liefern.

## In STEP623 angebundene Overlays

| Overlay-Datei | Client-ID | Modul | Rolle |
|---|---|---|---|
| `/overlays/_overlay-tts.html` | `overlay:tts_overlay` | `tts_overlay` | TTS-Visual-Overlay |
| `/overlays/_overlay-deathcounter-v2.html` | `overlay:deathcounter_v2` | `deathcounter_v2` | permanentes Status-Overlay |
| `/overlays/_overlay-challenge_status.html` | `overlay:challenge_status` | `challenge_status` | Challenge-Status-Overlay |

## Wichtige Regel

Für das Monitoring gilt:

```text
OK = Overlay ist verbunden und sendet frische Heartbeats.
Warnung = Overlay ist verbunden/angemeldet, aber sendet keinen echten Heartbeat.
Offline = WebSocket geschlossen, Quelle deaktiviert oder OBS aus.
```

## Nächste sinnvolle Schritte

1. OBS-Quellen mit Bus-Clients mappen.
2. Nutzerfreundliche Anzeigenamen im Dashboard pflegen.
3. Manuelle Reparaturbuttons bauen:
   - Browserquelle Cache neu laden
   - Quelle aus/ein toggeln
   - Quelle anzeigen/verstecken
4. Danach erst Automatik planen.
