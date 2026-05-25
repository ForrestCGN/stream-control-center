# STEP407 – VIP Productive Bus Mirror Design

Stand: 2026-05-25

## Status

Doku-/Design-STEP. Keine Codeänderung.

## Ziel

Einen sauberen Entwurf für spätere echte VIP-/Mod-Bus-Mirror-Events erstellen, ohne den produktiven VIP-/Mod-Sound-Pfad umzubauen.

## Leitentscheidung

Der produktive VIP-/Mod-Sound-Pfad bleibt Sound-System-geführt:

```text
/api/vip-sound/command
→ backend/modules/vip_sound_overlay.js
→ /api/sound/play
→ Sound-System steuert Queue, Priorität, Ausgabe, Timing und Playback
→ VIP-Overlay reagiert auf sound_system WebSocket + /api/sound/status
```

Ein späterer Communication-Bus-Mirror darf diesen Pfad nur ergänzen. Er darf ihn nicht ersetzen und darf keine zusätzliche Overlay-Anzeige auslösen, solange kein dedizierter Produktiv-Overlay-Vertrag mit Dedup/Timing existiert.

## Warum kein produktives `vip.overlay.show` für echte Sounds?

`vip.overlay.show` ist aktuell ein Preview-/Diagnose-Event. Das Overlay zeigt es direkt an und sendet einen Ack. Für echte VIP-/Mod-Sounds wäre das problematisch, weil der echte Soundstart weiterhin vom Sound-System abhängt.

Risiken bei direkter Nutzung für echte Sounds:

- doppelte Anzeige möglich: einmal über `vip.overlay.show`, einmal über `sound_system`-Status/WS
- falsches Timing möglich: Preview startet vor tatsächlichem Sound-Playback
- Queue-Reihenfolge könnte optisch falsch wirken
- Sound-System bliebe nicht mehr alleinige Timing-Wahrheit
- spätere Recovery/Dedup-Logik würde unnötig komplex

Deshalb: Produktiv-Mirror ja, produktiver Overlay-Trigger nein.

## Empfohlener Eventbereich

Für produktive Mirror-Events wird nicht `vip.overlay.*`, sondern `vip.sound.*` empfohlen.

Grund:

- `vip.overlay.*` beschreibt Anzeige-Aktionen.
- `vip.sound.*` beschreibt fachliche VIP-/Mod-Sound-Ereignisse.
- Das passt besser zum bestehenden produktiven Flow, weil der Sound-System-Pfad führend bleibt.

## Vorgeschlagene Eventnamen

```text
vip.sound.requested
vip.sound.rejected
vip.sound.accepted
vip.sound.queued
vip.sound.duplicate
vip.sound.override.denied
vip.sound.override.accepted
vip.sound.sound_missing
vip.sound.system_disabled
vip.sound.failed
```

Spätere Events, sobald SoundBus-Korrelation aktiv eingebunden wird:

```text
vip.sound.started
vip.sound.finished
vip.sound.client_audio_started
vip.sound.client_audio_ended
```

Diese späteren Events sollten möglichst nicht direkt aus dem VIP-Modul geraten werden, sondern aus Sound-System/SoundBus-Zuständen abgeleitet oder daran korreliert werden.

## Event-Kanäle und Actions

Empfohlener Bus-Event-Aufbau:

```json
{
  "type": "event",
  "channel": "vip.sound",
  "action": "accepted",
  "source": {
    "type": "module",
    "id": "vip_sound_overlay",
    "module": "vip_sound_overlay"
  },
  "target": {
    "type": "all",
    "id": "*",
    "module": "",
    "capability": "vip.sound.observe"
  },
  "payload": {},
  "meta": {}
}
```

Für spezifische Actions:

```text
channel: vip.sound, action: requested
channel: vip.sound, action: accepted
channel: vip.sound, action: queued
channel: vip.sound, action: rejected
channel: vip.sound, action: duplicate
channel: vip.sound, action: failed
```

## Pflichtfelder im Payload

Jedes produktive Mirror-Event sollte mindestens enthalten:

```json
{
  "schemaVersion": 1,
  "mirrorOnly": true,
  "productionEvent": true,
  "requestId": "vip-internal-request-id",
  "soundSystemRequestId": "sound-system-request-id-if-known",
  "usageDate": "YYYY-MM-DD",
  "eventKey": "accepted_vip",
  "eventType": "accepted",
  "soundType": "vip",
  "source": "streamerbot",
  "trigger": "!vip",
  "actor": {
    "login": "forrestcgn",
    "displayName": "ForrestCGN"
  },
  "targetUser": {
    "login": "userlogin",
    "displayName": "UserDisplay",
    "avatarUrl": ""
  },
  "sound": {
    "file": "vip/User.mp3",
    "path": "D:/Streaming/stramAssets/htdocs/assets/sounds/vip/User.mp3",
    "queued": true,
    "started": false,
    "queuePosition": 0
  },
  "flags": {
    "accepted": true,
    "duplicate": false,
    "override": false,
    "overrideAllowed": false,
    "dailyUsageWritten": true
  }
}
```

## Meta-Felder

Empfohlene `meta`-Felder:

```json
{
  "module": "vip_sound_overlay",
  "step": 407,
  "mirrorOnly": true,
  "productionTarget": false,
  "requireAck": false,
  "replayable": true,
  "ttlMs": 60000,
  "doNotDisplay": true
}
```

Wichtig: `doNotDisplay: true` ist als klare Schutzmarkierung gedacht. Clients, die nur beobachten/loggen, dürfen diese Events anzeigen. Overlay-Renderer dürfen daraus aber nicht automatisch eine Karte anzeigen.

## Feature-Flag-/Setting-Strategie

Späterer Code-STEP sollte eine DB-/Setting-Option ergänzen, nicht hart codieren.

Empfohlene Settings:

```text
productiveBusMirrorEnabled: false
productiveBusMirrorChannel: vip.sound
productiveBusMirrorRequireAck: false
productiveBusMirrorReplayable: true
productiveBusMirrorTtlMs: 60000
productiveBusMirrorIncludeRejected: true
productiveBusMirrorIncludeDuplicate: true
productiveBusMirrorIncludeSoundMissing: true
```

Default muss `false` bleiben, bis der Mirror getestet ist.

## Einbaupunkt im Code – späterer STEP

Der sauberste spätere Einbaupunkt wäre nach `finishVipCommand()` beziehungsweise unmittelbar in/um `finishVipCommand()`, weil dort alle Ergebnisse zentral zusammenlaufen und ohnehin `recordVipSoundEvent()` geschrieben wird.

Vorteile:

- akzeptierte, abgelehnte, doppelte und fehlerhafte Fälle laufen zentral durch
- Eventlog und Bus-Mirror können denselben Ergebnis-Kontext nutzen
- keine doppelte Logik in mehreren Return-Zweigen
- kein Eingriff in `queueVipSoundInSoundSystem()` nötig
- Sound-System-Payload bleibt unverändert

Nicht empfohlen:

- Bus-Mirror direkt in `queueVipSoundInSoundSystem()` einbauen
- Overlay-Preview-Route für Produktivfälle wiederverwenden
- `/api/communication/test-vip-overlay-preview` für echte Sounds zweckentfremden
- Sound-System-Queue durch Bus-Events beeinflussen

## Minimaler späterer Code-Vertrag

Späterer Code-STEP könnte eine interne Funktion ergänzen:

```text
emitVipProductiveBusMirror(action, context, extra, response)
```

Diese Funktion sollte:

- Feature-Flag prüfen
- Communication-Bus nur optional holen
- bei Bus-Fehlern niemals den VIP-Command fehlschlagen lassen
- Fehler nur in Status/State/Log dokumentieren
- `mirrorOnly: true` setzen
- `doNotDisplay: true` setzen
- keine Sound-System-Queue verändern
- keine Daily-Usage ändern
- keine Chat-Ausgabe ändern

## Tests für späteren Code-STEP

Minimaltests:

1. Mirror deaktiviert:
   - VIP-/Mod-Command verhält sich exakt wie vorher.
   - Keine neuen Bus-Events.

2. Mirror aktiviert, akzeptierter VIP-/Mod-Sound:
   - `/api/vip-sound/command` akzeptiert Sound.
   - `/api/sound/status` zeigt Queue/Current wie bisher.
   - Communication-Bus enthält `vip.sound.accepted`/`vip.sound.queued`.
   - VIP-Overlay zeigt nur über Sound-System, nicht doppelt.

3. Duplicate:
   - Daily-Usage-Duplicate wird wie bisher abgelehnt.
   - Chat-Ausgabe bleibt wie bisher.
   - Optionales `vip.sound.duplicate` Mirror-Event wird erzeugt.
   - Kein Sound wird queued.

4. Sound missing:
   - `sound_missing` bleibt wie bisher.
   - Optionales `vip.sound.sound_missing` Mirror-Event wird erzeugt.
   - Kein Sound wird queued.

5. Bus nicht verfügbar:
   - VIP-Command funktioniert weiterhin.
   - Sound-System funktioniert weiterhin.
   - Nur Mirror-Status/Log zeigt Fehler.

## Bewusst nicht in STEP407

- Keine Codeänderung.
- Kein neuer API-Endpunkt.
- Keine DB-Migration.
- Keine neue Setting-Tabelle.
- Keine Änderung an `/api/sound/play`.
- Keine Änderung an `queueVipSoundInSoundSystem()`.
- Keine Änderung am VIP-Overlay.
- Kein produktives `vip.overlay.show` für echte VIP-/Mod-Sounds.
- Keine Entfernung bestehender Routen.

## Empfehlung für STEP408

`STEP408 – VIP Productive Bus Mirror Feature Flag`

Ziel:

- nur Feature-Flag/Status-Grundlage vorbereiten
- Mirror weiterhin standardmäßig aus
- noch keine echten Mirror-Events senden, falls ein noch kleinerer Zwischenschritt gewünscht ist

Alternative, wenn direkt gebaut werden soll:

`STEP408 – VIP Productive Bus Mirror Implementation`

Dann aber nur mit Default `productiveBusMirrorEnabled=false` und ohne Anzeige-Trigger.
