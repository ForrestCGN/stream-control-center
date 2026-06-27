# Overlay EventBus Standard – STEP622

## Ziel

Alle OBS-/Browser-Overlays sollen künftig einheitlich mit dem CGN Communication Bus arbeiten. Das verhindert uneinheitliche Speziallogik in einzelnen Overlays und macht Monitoring/Reparatur später zuverlässiger.

## Referenzdatei

```text
htdocs/overlays/_overlay-eventbus-test.html
```

Dieses Testoverlay nutzt den gemeinsamen Client:

```text
htdocs/overlays/shared/overlay_bus_client.js
```

## Pflichtverhalten eines Overlays

Ein produktives Overlay soll:

1. sich beim Laden per `bus_hello` anmelden,
2. regelmäßig echte `bus_heartbeat` senden,
3. eine feste `clientId` besitzen,
4. einen lesbaren `name` besitzen,
5. ein fachliches `module` besitzen,
6. einen `mode`/eine Rolle besitzen,
7. Capabilities melden,
8. bei Events mit `meta.requireAck=true` ACKs senden,
9. im Heartbeat mindestens `visible/hidden` und Pfad-Kontext melden.

## Empfohlene Rollen / Modes

```text
visual_overlay       sichtbares/visuelles Overlay
sound_overlay        Sound-/Visual-Overlay
bus_consumer         Overlay hört nur auf Bus-Events
adapter              Kompatibilitäts-/Shadow-Adapter
debug_test           Test-/Diagnose-Overlay
preview              Preview/Testanzeige
```

## Bewertungslogik für Monitoring

```text
OK
- verbunden
- frischer echter Heartbeat
- optional: OBS-Quelle sichtbar oder bewusst wartend

Wartend / ausgeblendet
- OBS-Quelle existiert, ist aber nicht sichtbar
- kein Fehler, solange dies erwartet ist

Warnung
- angemeldet/verbunden, aber kein echter Heartbeat
- Heartbeat zu alt
- Bus-Client ohne OBS-Zuordnung

Fehler
- OBS-Quelle sichtbar, aber kein Bus-Client/Heartbeat
- ws_close bei erwarteter aktiver Quelle
- Browserquelle fehlt
```

## Testablauf mit dem Referenzoverlay

1. OBS-Browserquelle anlegen:

```text
http://127.0.0.1:8080/overlays/_overlay-eventbus-test.html
```

2. Quelle sichtbar schalten.
3. Im Overlay müssen `verbunden`, `hello_ack` und danach Heartbeat-ACKs erscheinen.
4. Quelle ausblenden.
5. Je nach OBS-Option `Deaktivieren, wenn Quelle nicht sichtbar ist` sollte die WebSocket-Verbindung schließen oder die Page Visibility auf hidden wechseln.
6. OBS schließen.
7. Im Dashboard muss der Client offline/ws_close werden.

## Nächste Schritte

Nach erfolgreichem Test sollen die echten Overlays gegen diesen Standard geprüft und schrittweise vereinheitlicht werden:

```text
Alerts V2
VIP Sound Overlay
Sound-System Overlay
Deathcounter
Challenges
Fireworks
TTS
ViewerAttack
```
