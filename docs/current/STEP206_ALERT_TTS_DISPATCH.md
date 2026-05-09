# STEP206 – Alert TTS Dispatch

Stand: 2026-05-09

## Ziel

Alert-Regeln mit `tts_enabled = 1` sollen den mitgelieferten Text wirklich sprechen. Bisher war TTS zwar in den Alert-Regeln und im Overlay-Payload vorbereitet, aber der serverseitige Ablauf fehlte:

```text
Alert-Regel -> TTS vorbereiten -> erzeugte TTS-Datei ueber Sound-System abspielen
```

## Fachliche Regel

Bei aktivem TTS fuer eine Alert-Regel gilt:

```text
1. Alert-Sound zuerst
2. Danach Alert-TTS
3. Der Alert bleibt so lange sichtbar, bis die TTS-Ausgabe durch ist
```

Damit wird verhindert, dass der Alert ausgeblendet wird, waehrend der TTS-Text noch laeuft.

## Geaenderte Datei

```text
backend/modules/alert_system.js
```

## Umsetzung

Der Alert-Ablauf wurde erweitert:

```text
processQueue()
-> Alert-Sound ueber Sound-System starten
-> TTS-Payload aus vorhandener Regel bauen
-> /api/tts/prepare-alert aufrufen
-> TTS-Dauer berechnen
-> Alert-Dauer um Sounddauer + TTS-Dauer + Buffer erweitern
-> Overlay mit verlaengerter Dauer anzeigen
-> nach Alert-Sound erzeugte TTS-Datei ueber /api/sound/play abspielen
-> Ergebnis in alert_events.payload_json unter raw.alertTts speichern
```

Die bestehenden Funktionen bleiben erhalten. Es wurde kein bestehender Alert-, Chat-, Sound-, Overlay- oder Queue-Pfad entfernt.

## Neue Runtime-Defaults unter liveAlert

```json
{
  "ttsPrepareUrl": "http://127.0.0.1:8080/api/tts/prepare-alert",
  "ttsSoundCategory": "tts",
  "ttsSoundSource": "alert_tts",
  "ttsSoundPriority": 50,
  "ttsSoundVolume": 85,
  "ttsOutputTarget": "device",
  "ttsAfterSoundDelayMs": 250,
  "ttsPrepareTimeoutMs": 15000,
  "ttsPlaybackTimeoutMs": 15000
}
```

Diese Werte sind Defaults und koennen spaeter dashboardfaehig gemacht werden. Bestehende Configs brechen nicht, weil Defaults gemerged werden.

## Aktueller Regelstand vor STEP206

Bereits aktiv:

```text
Ko-fi Donation Standard: tts_enabled = 1
Tipeee Donation Standard: tts_enabled = 1
```

Noch nicht aktiv:

```text
Twitch Bits-Regeln: tts_enabled = 0
Twitch Resub-Regel: tts_enabled = 0
```

## Testziel

Zuerst Ko-fi/Tipeee testen, weil deren Regeln bereits TTS aktiv haben.

Erwartung:

```text
Ko-fi/Tipeee Donation Alert
-> normaler Alert-Sound spielt
-> danach TTS liest den Donation-Text
-> Alert bleibt sichtbar, bis TTS fertig ist
-> alert_events.raw.alertTts enthaelt prepare/playback Ergebnis
```

## Bewusst offen

- Dashboard-UX fuer TTS-Settings pro Regel weiter polieren.
- Bits/Resub TTS erst nach erfolgreichem Provider-Test bewusst aktivieren.
- TTS-Timing `before_alert` und `with_alert` sind vorbereitet, der Fokus liegt aktuell auf `after_alert`.
