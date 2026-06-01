# CURRENT SYSTEM STATUS – STEP278 Vorbereitung

<!-- CAN-3.7-STABLE-STATUS:START -->
## CAN-3.7 stabiler Zwischenstand

Stand: 2026-06-01

### Ergebnis

CAN-3 ist bis einschließlich CAN-3.6 erfolgreich geprüft.

```text
alert_system: 3.1.8
sound_system: 0.1.20
bus_diagnostics: 1.2.2
handshakeState: matched
matched: 2
unmatched: 0
warnings: []
```

### Bestätigte Kette

```text
Alert -> Bundle -> Sound-System -> Matching -> Handshake-State
```

### Wichtig

Dieser Stand ist ein Diagnose-/Stabilitätsstand. Es wurden keine produktiven Flow-Umbauten an Queue, Sound-Playback, Overlay, TTS, DB oder Config vorgenommen.

Details: `docs/system-inspection/EVENTBUS_CAN3_7_STABLE_STATUS.md`
<!-- CAN-3.7-STABLE-STATUS:END -->


Stand: 2026-05-31 08:14 UTC

## Kontext

Projekt: `stream-control-center`  
Repo: `https://github.com/ForrestCGN/stream-control-center`  
Branch: `dev`  
Live-System: `D:\Streaming\stramAssets`  
Lokales Repo: `D:\Git\stream-control-center`

## Aktueller Arbeitsstand

Heute wurde kein Script-Umbau durchgeführt. Es wurde nur die Konfiguration für einen Live-Test angepasst.

### Clip-/Shoutout-System

Datei: `D:\Streaming\stramAssets\config\clip_system.json`

Unter `clipShoutout.officialShoutout` wurde für den heutigen Test gesetzt:

```json
"officialShoutout": {
  "enabled": true,
  "liveGateEnabled": false
}
```

Ziel: Die interne Live-Sperre des Clip-Shoutout-Moduls testweise deaktivieren, damit geprüft werden kann, ob wartende offizielle Twitch-Shoutouts während des Streams korrekt abgearbeitet werden.

Der Status nach der Änderung zeigte:

```json
"officialShoutout": {
  "liveGateEnabled": false,
  "globalCooldownMs": 120000,
  "targetCooldownMs": 3600000
}
```

und:

```json
"officialQueue": {
  "liveGate": {
    "enabled": false,
    "live": false
  },
  "pending": 10
}
```

Damit ist die Live-Gate-Sperre aktuell aus. Die alten Queue-Einträge enthalten teilweise weiterhin `last_error: waiting_stream_live_offline`, das ist aber der gespeicherte alte Fehlertext am jeweiligen Eintrag.

### Weiterhin aktive Sperren

Auch mit deaktiviertem Live-Gate sind weiterhin aktiv:

```json
"globalCooldownMs": 120000
```

= 2 Minuten Abstand zwischen offiziellen Twitch-Shoutouts insgesamt.

```json
"targetCooldownMs": 3600000
```

= 1 Stunde Sperre pro Zielkanal.

Der Status zeigte außerdem:

```json
"lastBusEvent": {
  "action": "shoutout.official.waiting_cooldown"
}
```

Das bedeutet: Nach Deaktivierung des Live-Gates wartet die Official-Queue nicht mehr auf „Stream live“, sondern auf den Cooldown.

## Beobachtung für heutigen Stream

Gestern funktionierten die offiziellen Shoutouts grundsätzlich. Heute soll beobachtet werden, ob sie mit deaktiviertem Live-Gate wieder zuverlässig gesendet werden.

Beim Stream beobachten:

- Kommt `!so` / `!vso` rein?
- Wird der Video-/Clip-Shoutout über Sound-System/Overlay abgespielt?
- Wird danach der offizielle Twitch-Shoutout gesendet?
- Wenn mehrere Shoutouts kommen: warten sie sauber in der Queue?
- Werden die offiziellen Shoutouts alle 2 Minuten gesendet?
- Wird derselbe Zielkanal innerhalb 1 Stunde korrekt blockiert?

## Bekannte Auffälligkeiten

Der Status zeigte weiterhin:

```text
registeredCommand: false
```

und:

```text
Unknown named parameter 'trigger'
```

Das ist nicht direkt der Live-Gate-Blocker, muss aber später geprüft werden.

## Alert-System / Overlay-Kommunikation

Es trat wiederholt ein Problem auf:

- Sound/TTS wurde abgespielt.
- Visuelles Alert-Overlay wurde nicht angezeigt.
- Nach `/api/alerts/clear` und Aktualisieren der OBS-Browserquelle lief es wieder.

Aus dem Status war auffällig:

```json
"queueLength": 2,
"current": null,
"currentEventId": null
```

sowie `active_bundle_lock` und ein `waitForStart`-Timeout von 300 Sekunden.

Interpretation: Wahrscheinlich Kommunikations-/Timingproblem zwischen Alert-System, Sound-System und Overlay. Kein OBS-Designproblem und kein Benutzerfehler.

## Geplanter nächster großer Schritt

`STEP278_COMMUNICATION_AND_QUEUE_RESILIENCE`

Ziel:

- Kommunikation zwischen Backend-Modulen, Sound-System und Overlays prüfen.
- Einheitlichen Ablauf für Start, Queue, Running, Finished, Failed definieren.
- Verhindern, dass Sound/TTS läuft, aber Overlay kein klares Play-Signal bekommt.
- Verhindern, dass Queues in Zwischenzuständen hängen.
- Live-/Offline-Status robuster und transparenter machen.
- Dashboard-Status verbessern.
