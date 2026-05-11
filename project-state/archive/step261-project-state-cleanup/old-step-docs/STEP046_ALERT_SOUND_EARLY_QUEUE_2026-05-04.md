# STEP046_ALERT_SOUND_EARLY_QUEUE_2026-05-04

## Ziel

Alert-Hauptsounds sollen möglichst früh ins Sound-System eingereiht werden, damit die vorhandene Sound-System-Priorität greifen kann.

Der direkte Sound-System-Test hat gezeigt:

- `sortByPriority = true` funktioniert.
- `allowParallel = false` und `maxParallel = 1` funktionieren.
- High-Prio-Items stehen vor Low-Prio-Items in der wartenden Sound-Queue.

Der echte Test `Crew -> Chat-TTS -> Alert` lief aber `Crew -> TTS -> Alert`, weil der Alert-Sound offenbar zu spät ins Sound-System kam.

## Änderung

Datei:

- `backend/modules/alert_system.js`

Neue LiveAlert-Settings im Default:

```json
{
  "earlySoundQueueEnabled": true,
  "earlySoundQueueTimeoutMs": 3500
}
```

Neue Funktion:

- `prepareEarlySoundSystemQueue(event, broadcastWS)`

Ablauf:

1. Beim Alert-Enqueue wird, wenn möglich, direkt der Overlay-Alert gebaut.
2. Das Alert-Overlay bekommt direkt ein `prepare`-Event.
3. Der Alert-Hauptsound wird sofort ins Sound-System gepostet.
4. `processQueue()` nutzt das bereits gestartete/früh eingereihte Sound-System-Promise und postet den Alert-Sound nicht doppelt.
5. Wenn der frühe Sound-System-Handoff fehlschlägt, bleibt das bestehende Fallback-Verhalten erhalten.

## Nicht geändert

- Keine Änderung am Sound-System.
- Keine Änderung am TTS-System.
- Keine Änderung am Alert-Overlay.
- Keine Funktionen entfernt.
- Alert-TTS bleibt unverändert über Sound-System gekoppelt.

## Erwarteter Test

Voraussetzung:

```text
sound_settings.queue.sortByPriority = true
sound_settings.queue.allowParallel = false
sound_settings.queue.maxParallel = 1
```

Test:

1. Crew-Sound starten.
2. Direkt Chat-TTS senden.
3. Direkt Ko-fi/Tipeee-Alert senden.

Erwartung:

```text
1. Crew-Sound läuft zu Ende
2. Alert-Sound
3. Alert-TTS
4. Chat-TTS
```

## Hinweis

Wenn der Alert trotzdem erst nach Chat-TTS kommt, obwohl der Alert während des Crew-Sounds abgesendet wurde, ist der nächste Fix nicht mehr im Alert-System, sondern im Sound-System nötig: eine kurze Priority-Grace-Phase nach Sound-Ende, bevor das nächste Low-Prio-Item gestartet wird.
