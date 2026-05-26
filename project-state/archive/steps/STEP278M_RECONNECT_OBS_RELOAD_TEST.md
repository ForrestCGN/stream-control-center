# STEP278M - Reconnect / OBS Reload Test für Master-Test-Overlay

## Ziel

Das vorhandene Master-Test-Overlay wurde für Browser-/OBS-Reloads und WebSocket-Reconnects gehärtet.

Der STEP bleibt ein reiner Test-/Mirror-Schritt. Es wird keine produktive Alert-, Sound-, TTS-, VIP- oder Mod-Kommunikation migriert.

## Geändert

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Overlay-Version

```text
overlay_master_test v0.1.1 / STEP278M
```

## Neue Funktionen

- Reconnect-/Session-Debug im Overlay
- `connectCount` und `disconnectCount`
- neue Session-ID pro WebSocket-Verbindung
- Zeitstempel für letzte Verbindung und letzte Trennung
- Zeitstempel für letzte `hello_ack` und `heartbeat_ack`
- Heartbeat-Intervall wird bei Reconnect garantiert neu gestartet
- Heartbeat-Intervall wird bei Disconnect garantiert gestoppt
- alte Testkarten werden bei WebSocket-Close/Open ausgeblendet
- ACK-Details enthalten Session-/Reconnect-Informationen

## Test-URL

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

## Testablauf

1. Overlay mit `?debug=1` öffnen.
2. Status prüfen:

```text
http://127.0.0.1:8080/api/communication/status
```

3. Browserseite oder OBS-Browserquelle aktualisieren.
4. Status erneut prüfen.
5. Testevent senden:

```text
http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Reconnect%20Test&requireAck=1&replayable=1
```

6. Status erneut prüfen.

## Erwartung

- Client `overlay_master_test` ist online.
- `connectedAt` aktualisiert sich nach Reload/Reconnect.
- `lastHeartbeatAt` läuft weiter.
- Overlay-Debug zeigt Session/Reconnect-Infos.
- Testevent wird ausgeliefert.
- ACK-Zähler steigt.
- `lastAckAt` aktualisiert sich.

## Bewusst nicht geändert

- Kein Backend-Umbau
- Kein `server.js`-Umbau
- Kein Ersatz von `broadcastWS`
- Keine Alert-Produktion
- Keine Sound-/TTS-/VIP-/Mod-Migration
- Keine Datenbankänderung
- Keine Dashboard-Seite
- Keine OBS-Konfigurationsänderung

## Rollback

Rollback nur über die vorherige Version von:

```text
htdocs/overlays/_overlay-master-test.html
```

Die Änderung betrifft keine produktiven Backend- oder Datenbankpfade.
