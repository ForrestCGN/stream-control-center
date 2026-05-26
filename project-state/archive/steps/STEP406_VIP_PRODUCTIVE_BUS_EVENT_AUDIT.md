# STEP406 – VIP Productive Bus Event Audit

Stand: 2026-05-25

## Status

Doku-/Audit-STEP. Keine Codeänderung.

## Ziel

Prüfen und festhalten, ob das VIP-/Mod-Sound-System künftig echte produktive `vip.overlay`-/VIP-Bus-Events zusätzlich zum bestehenden Sound-System ausgeben sollte.

## Ergebnis

Der produktive VIP-/Mod-Sound-Pfad bleibt unverändert:

```text
Streamer.bot / Dashboard / API
→ /api/vip-sound/command oder /api/vip-sound/enqueue
→ backend/modules/vip_sound_overlay.js
→ /api/sound/play
→ Sound-System steuert Queue, Ausgabe und Playback
→ VIP-Overlay reagiert auf sound_system WebSocket + /api/sound/status
→ Overlay zeigt passende Karte
```

Der Communication-Bus-Preview-Pfad bleibt separat:

```text
/api/communication/test-vip-overlay-preview?action=show|hide|update
→ Communication Bus
→ vip.overlay.show/hide/update
→ vip_sound_overlay_v2 zeigt Preview-Testkarte
→ Overlay sendet Ack
→ Sound-System bleibt unberührt
```

## Audit-Befund

### 1. Produktive VIP-/Mod-Events laufen über Sound-System

`backend/modules/vip_sound_overlay.js` baut für akzeptierte VIP-/Mod-Sounds ein Sound-System-Payload und sendet dieses an `VIP_SOUND_SYSTEM_PLAY_URL`, standardmäßig `/api/sound/play`.

Wichtige Payload-Bestandteile:

- `category`: `vip` oder `crew`
- `priority`: aktuell `60`
- `queueIfBusy`: `true`
- `dropIfBusy`: `false`
- `parallelAllowed`: `false`
- `meta.module`: `vip_sound_overlay`
- `meta.requestId`: VIP-interne Request-ID
- `visual.module`: `vip_sound_overlay`
- `visual.type`: `vip` oder `mod`
- `visual.requestId`: VIP-interne Request-ID
- `visual.title`, `visual.text`, `visual.displayName`, `visual.login`, `visual.avatarUrl`

Damit bekommt das Sound-System bereits alle visuellen Daten, die das VIP-Overlay braucht.

### 2. Command-Flow ist bereits korrekt gekapselt

`handleVipCommand()` macht aktuell:

1. DB-/Schema-Check.
2. Actor/Target auflösen.
3. Twitch-VIP-/Mod-Berechtigung prüfen.
4. System-Enabled prüfen.
5. Override-/Daily-Usage-Regeln prüfen.
6. Duplicate prüfen.
7. Sound über Sound-System queuen.
8. Daily-Usage schreiben, wenn erlaubt/nötig.
9. Eventlog schreiben.
10. Chatantwort erzeugen.

Das ist der richtige Ort, falls später zusätzlich ein produktiver VIP-Bus-Mirror ergänzt wird.

### 3. Bestehende direkte Overlay-Queue ist Legacy/Direct-Overlay-Pfad

`/api/vip-sound/enqueue` und `/api/vip-sound-overlay/enqueue` existieren weiterhin als direkte Overlay-Queue-Routen.

Diese Routen sollten nicht entfernt werden. Für den normalen produktiven VIP-/Mod-Sound sind sie aber nicht der Hauptweg, weil der aktuelle Produktivpfad über `/api/vip-sound/command` → Sound-System läuft.

### 4. Bus-Preview ist aktuell bewusst nicht produktiv

Das Overlay `htdocs/overlays/vip_sound_overlay_v2.html` registriert sich am Communication Bus als:

```text
clientId: vip_sound_overlay_v2
module: vip_sound_overlay
type: overlay
mode: shadow
capabilities:
- vip.overlay.test
- vip.overlay.show
- vip.overlay.hide
- vip.overlay.update
- ack
```

`vip.overlay.show`, `vip.overlay.hide` und `vip.overlay.update` dienen aktuell der Preview-/Diagnoseanzeige.

`vip.overlay.test` bleibt shadow-only.

## Entscheidung für STEP406

In STEP406 wird keine produktive Bus-Ausgabe eingebaut.

Begründung:

- Der produktive Sound-System-Pfad funktioniert bereits.
- Das VIP-Overlay zeigt produktive Karten bereits über Sound-System-Events und `/api/sound/status`.
- Ein zusätzlicher produktiver Bus-Event ohne klares Dedup-/Prioritäts-/Timing-Konzept könnte doppelte Anzeigen erzeugen.
- Der Communication-Bus-Pfad ist technisch vorbereitet, aber als Preview-/Shadow-Pfad markiert.
- Sound-System/Queue/Daily-Usage/Eventlog dürfen nicht nebenbei verändert werden.

## Empfohlene spätere Zielarchitektur

Später sinnvoll, aber erst in eigenem STEP:

```text
/api/vip-sound/command
→ VIP-Modul prüft Berechtigung/Daily-Usage
→ VIP-Modul queued Sound über /api/sound/play
→ Sound-System bleibt führend für Audio/Queue/Playback
→ optionaler VIP-Bus-Mirror sendet Diagnose-/Status-Events
→ Overlay-Anzeige bleibt bis zur expliziten Umstellung sound_system-geführt
```

Mögliche spätere Eventtypen:

```text
vip.sound.requested
vip.sound.accepted
vip.sound.queued
vip.sound.rejected
vip.sound.duplicate
vip.sound.started
vip.sound.finished
vip.sound.failed
```

Wichtig: Diese Events sollten zunächst Diagnose-/Mirror-Events sein, nicht Anzeige-Trigger.

## Späterer sicherer Umsetzungsplan

### STEP407 – VIP Productive Bus Mirror Design

Nur Design/Doku:

- Event-Namen final festlegen.
- Payload-Vertrag festlegen.
- Dedup-Regel festlegen.
- Klären, ob `vip.overlay.*` wirklich Produktiv-Overlay-Events bleiben oder ob `vip.sound.*` besser ist.
- Keine Codeänderung.

### STEP408 – VIP Bus Mirror Backend Shadow

Kleiner Backend-Step:

- Optionalen Mirror im VIP-Modul ergänzen.
- Nur Diagnose-/Status-Events senden.
- Keine Overlay-Anzeige über Bus.
- Sound-System bleibt führend.
- Feature-Flag/Setting nutzen.

### STEP409 – VIP Bus Mirror Stable Check

Test-Step:

- `/api/vip-sound/command` mit Testuser prüfen.
- Sound-System queue/current prüfen.
- Communication-Bus Events prüfen.
- Keine doppelte Overlay-Anzeige.
- Daily-Usage/Eventlog unverändert.

## Nicht geändert

- Keine Änderung an `backend/modules/vip_sound_overlay.js`.
- Keine Änderung an `htdocs/overlays/vip_sound_overlay_v2.html`.
- Keine Änderung an `backend/modules/communication_bus.js`.
- Keine Sound-System-Änderung.
- Keine Queue-Änderung.
- Keine Daily-Usage-Änderung.
- Keine DB-Migration.
- Keine Dashboard-Änderung.
- Keine Entfernung alter Routen.

## Minimaltests nach Entpacken

Nur Status-/Routenchecks, keine produktiven Sounds nötig:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/routes"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
```

Optionaler Preview-Test, falls das Overlay offen ist:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test-vip-overlay-preview?action=show&user=STEP406_Test&requestId=step406-preview&durationMs=5000&requireAck=true&replayable=true"
Start-Sleep -Seconds 6
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/test-vip-overlay-preview?action=hide&user=STEP406_Test&requestId=step406-preview-hide&requireAck=true&replayable=true"
```

Erwartung:

- VIP-Status erreichbar.
- `/api/vip` bleibt absichtlich nicht registriert.
- Bus-Client `vip_sound_overlay_v2` ist online, wenn Overlay geöffnet ist.
- Sound-System bleibt bei Preview-Test ohne current/queue.
