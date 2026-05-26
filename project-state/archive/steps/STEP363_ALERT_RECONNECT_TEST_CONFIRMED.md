# STEP363 - Alert Reconnect Test Confirmed

Datum: 2026-05-24
Projekt: stream-control-center
Bereich: Alert-System / SoundBus / Overlay-Reconnect

## Ziel

STEP363 dokumentiert das Ergebnis der STEP360-/STEP362-Tests.
Es werden keine Backend-, Dashboard-, Overlay-, Sound-System- oder Datenbankdateien geändert.

## Ergebnis

STEP360 wurde im Live-/OBS-nahen Test erfolgreich bestätigt.

Der geprüfte Ablauf war:

1. Alert läuft aktiv.
2. OBS-Alert-Browserquelle wird während des laufenden Alerts aktualisiert / reconnectet.
3. Alert-System erkennt den Overlay-Reconnect per `overlay_reconnect_hello`.
4. Der aktuell laufende Alert wird erneut an genau diesen Overlay-Client gesendet.
5. Sound/TTS wird nicht erneut gestartet.
6. Queue wird nicht verändert.
7. Watchdog meldet keine Fehler.

## Bestätigte Log-Belege

### Testlauf 1

Logdatei:

- `STEP362_alert_reconnect_live_20260524_181814.log`

Wichtige Beobachtungen:

- Alert aktiv mit `currentStatus=playing`
- Event-ID: `al_1779639525196_e3076aa0`
- Sound: `100-249 Bits- Neu`
- Recovery-Modus: `reconnect_resend`
- Recovery-Grund: `overlay_reconnect_hello`
- `sent:true`
- `soundChanged:false`
- `ttsChanged:false`
- `queueChanged:false`

### Testlauf 2

Logdatei:

- `STEP362_alert_reconnect_live_20260524_182056.log`

Wichtige Beobachtungen:

- Alert aktiv mit `currentStatus=playing`
- Event-ID: `al_1779639665759_2f810618`
- Sound: `100-249 Bits- Neu`
- Recovery-Modus: `reconnect_resend`
- Recovery-Grund: `overlay_reconnect_hello`
- `sent:true`
- `soundChanged:false`
- `ttsChanged:false`
- `queueChanged:false`

## Bewertung

STEP360 gilt als bestanden.

Bestätigt:

- Alert-System läuft auf STEP360.
- Alert-Overlay ist verbunden.
- Reconnect während eines laufenden Alerts wird erkannt.
- Laufender Alert wird visuell erneut gesendet.
- Sound/TTS wird nicht doppelt gestartet.
- Queue bleibt unverändert.
- Watchdog meldet keine Fehler.

## Nebenbefund

In einem Testlauf war gegen Ende zu sehen, dass `currentStatus=playing` noch gesetzt war, obwohl `currentSound` bereits leer war.

Das ist nicht automatisch ein Fehler, weil Alert-Sichtdauer und Sound-Dauer getrennt laufen können.
Es sollte im nächsten Prüfpunkt nur beobachtet werden:

- Bleibt `currentStatus=playing` nur bis zum geplanten Alert-Ende aktiv?
- Wird `state.current` danach zuverlässig geleert?
- Entstehen dadurch keine Folgeprobleme bei Queue, Replay oder neuen Alerts?

## Nicht geändert

- Kein Backend-Code geändert
- Kein Dashboard-Code geändert
- Kein Overlay-Code geändert
- Kein Sound-System geändert
- Keine Datenbank geändert
- Keine Alert-Regeln geändert
- Keine Assets geändert
- Keine Queue-Logik geändert
- Kein `activeBundleLock` eingebaut

## Empfohlener nächster Schritt

`STEP364_ALERT_CURRENT_LIFECYCLE_CHECK`

Ziel:

- Nur prüfen, ob Alert-`current` nach Alert-Ende zuverlässig sauber geleert wird.
- Kein Umbau, solange kein echter Fehler sichtbar ist.
- Falls nötig, erst Diagnose erweitern, dann minimal patchen.
