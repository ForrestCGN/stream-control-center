# CURRENT SYSTEM STATUS – STEP354 SOUND BUS FINAL CHECK

Stand: 2026-05-24

## Aktueller Fokus

Sound-System und SoundBus wurden als zentrale Audio-/Medien-Schicht fertig geprüft. Dashboard-Arbeit ist zurückgestellt. Der nächste fachliche Block ist die Anbindung einzelner Systeme an den fertigen SoundBus, beginnend mit dem Alert-System.

## Bestätigter Gesamtstand

- Sound-System bleibt zuständig für Sound, Queue, Bundle, Device/Discord/Overlay-Ausgabe und Playback.
- SoundBus ist aktiv und liefert normalisierte Events.
- Sound-Overlay ist verbunden und verarbeitet WebSocket-Play-Signale wieder korrekt.
- Sound-Overlay meldet tatsächlichen Playback-Start als `client.audio_started` zurück.
- Sound-Overlay meldet Playback-Ende als `client_audio_ended` zurück.
- Die Events enthalten eine durchgehende `requestId`.
- Queue läuft leer.
- `activeBundleLock` bleibt nicht hängen.
- Keine Dashboard-Erweiterung in STEP354.

## Bestätigter STEP354-Test

Testbefehl:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?type=generated_beep&outputTarget=overlay&durationMs=1200&frequency=880&label=SoundBusClientTest"
Start-Sleep -Seconds 2
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s.soundBus.recentEvents | Select-Object -First 15
```

Bestätigter Ablauf:

```text
starting / item_starting
started / item_started
state.updated / play_stream
client.audio_started / client_audio_started
client_audio_ended
finished / item_finished
```

Bewertung:

- STEP352 Backend-Client-Event-Kontext ist nutzbar.
- STEP353 Overlay-WebSocket-Fix ist bestätigt.
- STEP354 markiert den SoundBus als bereit für die erste System-Anbindung.

## Wichtige Architekturentscheidungen

- Sound-System steuert den Sound.
- SoundBus meldet Sound-Zustände und Client-Bestätigungen.
- Alert-System soll als erstes System angebunden werden.
- Alert-System liefert dann Alert-Inhalt und Overlay-Anzeige passend zum Sound-System/SoundBus-Status.
- Dashboard kommt später.
- Keine Bus-only-Produktivmigration ohne gesonderte Entscheidung.
- Alte HTTP-/WebSocket-/Legacy-Pfade bleiben erhalten.
- Keine Sound-Queue-/Bundle-/`activeBundleLock`-Logik ohne ausdrücklichen Grund anfassen.
- Keine Funktionalität entfernen.
- Zuerst echte Dateien prüfen, dann planen/ändern.

## Nächster sinnvoller Block

Empfohlen: `STEP360 – Alert-System an fertigen SoundBus anbinden`

Möglicher Inhalt:

- Alert-System liest/berücksichtigt Sound-System/SoundBus-Signale.
- Alert-Bild/Text wird passend zum tatsächlichen Sound-Start angezeigt.
- Overlay-Reconnect/Recovery für laufende Alerts wird geprüft und gezielt gelöst.
- Sound/TTS darf nicht doppelt starten.
- Keine Dashboard-Arbeit außer zwingend nötiger Testschalter.
