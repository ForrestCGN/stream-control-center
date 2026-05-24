# STEP278X_ALERT_OVERLAY_DELIVERY_WATCHDOG

## Ziel

STEP278X ergänzt eine Diagnose für die echte Alert-Overlay-Auslieferung.

Der bestehende Alert-Flow bleibt unverändert:

```text
sound/tts sync -> playing -> sendOverlay -> optional bus mirror
```

Zusätzlich wird beim `sendOverlay`-Play ein Watchdog-Datensatz erzeugt. Das Overlay sendet bisher am Ende des Alerts `event: finished`; dieser Rückkanal wird als Finish-/ACK-Bestätigung ausgewertet.

## Neue API

```text
/api/alerts/overlay-watchdog/status
/api/alerts/overlay-watchdog/check
/api/alerts/overlay-watchdog/reset?confirm=1
```

## Erkennung

- `no_overlay_client`: Beim Play-Signal war kein echtes Alert-Overlay verbunden.
- `waiting_for_finish_ack`: Play wurde gesendet, Finish-/ACK steht noch aus.
- `acknowledged`: Overlay hat `finished` oder `ack` für den Alert gesendet.
- `missing_finish_ack`: Nach Alert-Dauer + Grace-Zeit kam keine Bestätigung.

## Nicht geändert

- kein neues Modul
- keine DB-Migration
- keine Änderung am Overlay-HTML
- keine Änderung an Sound/TTS/Queue
- kein Ersatz von `broadcastWS`
- kein automatisches Aktivieren des Bus-Mirrors
