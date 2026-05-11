# NEXT CHAT HANDOFF – STEP207.1 Alert TTS

## Projekt

`stream-control-center`

## Aktueller Stand

Alert-TTS funktioniert nach STEP206/STEP207.

## Wichtigste bestätigte Funktion

```text
Alert-Sound läuft zuerst.
Danach wird TTS abgespielt.
Der Alert bleibt sichtbar, bis TTS fertig ist.
```

## Erfolgreich getestet

```text
Tipeee Donation TTS
Ko-fi Donation TTS
Twitch Bits 100–249 TTS
Twitch Bits 1.000–1.999 TTS
Twitch Resub TTS
```

## Relevante Dateien

```text
backend/modules/alert_system.js
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
```

## Wichtige Regel-IDs

```text
8  – Ko-fi Donation Standard
12 – Tipeee Donation Standard
27 – 100- 249 Bits Normal
31 – 1.000 - 1.999 Bits Normal
36 – Re-Sub
```

## Wichtige Log-Indikatoren

In `/api/alerts/events?limit=1` muss bei TTS-Alerts stehen:

```text
raw.alertTts.attempted = true
raw.alertTts.ok = true
raw.alertTts.playback.ok = true
raw.alertTts.extendedAlertDurationMs > normaler Alertdauer
```

## Offene nächste Arbeit

Der Nutzer möchte jetzt am Alert-Design / Overlay weiterarbeiten.

Wichtig:

```text
Keine Funktionalität entfernen.
TTS-Dauer muss weiter berücksichtigt bleiben.
Alert darf nicht vor TTS-Ende verschwinden.
Bestehende Sound-/Queue-/TTS-/Chattext-Funktionen nicht beschädigen.
```
