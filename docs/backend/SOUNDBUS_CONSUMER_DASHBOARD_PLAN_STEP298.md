# STEP298 – SoundBus Consumer-/Dashboard-Planung

Stand: 2026-05-24
Projekt: stream-control-center

## Ziel

STEP298 legt fest, wie der SoundBus nach den bestätigten Basis-, Regression- und Debug-View-Tests künftig genutzt werden soll, ohne bestehende HTTP-/WebSocket-Wege vorschnell zu ersetzen.

Der SoundBus bleibt eine zentrale Event-/Status-Schicht für Diagnose, Monitoring und spätere Dashboard-/Overlay-Consumer.

## Ausgangslage

Bestätigte Vorstufen:

- STEP289: Sound-System sendet native SoundBus-Events.
- STEP289B: Top-Level `soundBus` in `/api/sound/status` sichtbar.
- STEP290: Basis-Tests bestanden.
- STEP291: V5 Queue-/Bundle-Regression bestanden.
- STEP293/294: Discord Media Path Resolver Fix bestätigt, `discordFailed = 0`.
- STEP296: SoundBus Debug View gebaut.
- STEP297: Debug View Test bestätigt.

Aktueller Betriebsentscheid aus STEP295:

```text
soundBus.enabled = true
```

SoundBus bleibt im Dev-/Testbetrieb aktiv, aber nicht als vollständige Produktiv-Migration auf Bus-only.

## Grundsatzentscheidung

Der SoundBus wird vorerst nicht als neuer direkter Steuerkanal für alle Module verwendet.

Er dient zunächst für:

1. Live-Monitoring
2. Debugging
3. Dashboard-Anzeigen
4. Event-Korrelation
5. spätere Overlay-Consumer
6. spätere Modul-Migrationen mit Rückfallpfad

Die bestehenden HTTP-APIs und alten Modul-WebSockets bleiben erhalten.

## Consumer-Klassen

### 1. Reine Beobachter

Dürfen Events lesen, aber keine ACKs oder Steuerbefehle senden.

Beispiele:

- `soundbus_debug_view`
- später Dashboard Sound-Monitor
- Diagnose-/Trace-Tools

Regel:

```text
Kein ACK standardmäßig.
Keine Produktionslogik beeinflussen.
```

### 2. Dashboard-Consumer

Dürfen Events lesen und Status über APIs abrufen.

Beispiele:

- Sound-Queue-Ansicht
- Bundle-Lock-Anzeige
- Device-/Discord-Fehleranzeige
- Event-Timeline

Regel:

```text
Dashboard schreibt nicht direkt in SoundBus-Events.
Steueraktionen laufen weiterhin über Backend-APIs.
```

### 3. Overlay-Consumer

Dürfen später gezielt auf SoundBus-Events reagieren, aber erst nach separater Freigabe.

Mögliche spätere Consumer:

- Sound-System Overlay
- Alert Debug Overlay
- VIP Overlay Monitoring
- Queue-Anzeige

Regel:

```text
Overlay-Consumer erst mit explizitem target/capability-Modell freigeben.
Keine Wildcard-Produktionsabhängigkeit ohne Fallback.
```

### 4. Modul-Consumer

Module dürfen vorerst nicht blind auf SoundBus als einzige Quelle migriert werden.

Mögliche spätere Module:

- alert_system
- vip_sound_overlay
- tts_system
- sound_media_bridge
- soundalerts / channel rewards
- dashboard_controlcenter

Regel:

```text
Module bleiben vorerst API-basiert.
Bus-Nutzung pro Modul separat planen, testen und dokumentieren.
```

## Dashboard-Zielbild

Ein späteres Dashboard-Sound-Modul soll folgende Bereiche bekommen:

### Live Status

- SoundBus aktiv/inaktiv
- Communication Bus verfügbar
- WS-Client-Anzahl
- Queue-Länge
- aktueller Sound
- aktuelles Bundle
- activeBundleLock
- Sound-/Device-/Discord-Fehler

### Event-Timeline

Filterbar nach:

- action
- source
- category
- soundId
- requestId
- bundleId
- alertEventUid
- requestedBy

### Bundle-Ansicht

Für Alert-/TTS-Bundles wichtig:

- Bundle-ID
- Bundle-Typ
- Rollen: main, tts
- aktives Item
- queued Items
- Lock-Status
- Abschlusszeit

### Fehlerbereich

Sichtbar trennen:

- Sound-System Fehler
- Device Fehler
- Discord Fehler
- SoundBus Emission Errors
- Communication Bus unavailable

### Debug-Werkzeuge

Erlaubt im Dashboard nur für Admin/Owner:

- Status neu laden
- Queue anzeigen
- SoundBus-Events pausieren/filtern
- Test-Ping auslösen
- optional Trace starten

Keine riskanten Aktionen ohne Rollen-/Rechteprüfung.

## Event-Korrelation

Künftige Auswertung soll primär über IDs erfolgen:

- `requestId`
- `soundId`
- `bundleId`
- `alertEventUid`
- `source`
- `category`
- `requestedBy`

Wichtig:

Alert-Hauptsound und Alert-TTS müssen über `bundleId` zusammen sichtbar bleiben.

## Offene technische Punkte

### Doppeltes `sound.finished`

STEP297 hat dokumentiert:

- `sound.finished Test Ping` = konkretes Item-Finish
- `sound.finished auto_finished` = zusätzliches Lifecycle-/System-Finish

Aktuell kein Fehler, aber Dashboard sollte dies klar darstellen oder später semantisch besser trennen.

Möglicher späterer Cleanup:

```text
sound.finished.item
sound.finished.auto
```

oder Payload-Flag:

```text
finishKind: item | lifecycle | auto
```

### Zielgruppen/Targets

Aktuell werden SoundBus-Events an alle passenden Clients geliefert.

Für spätere Produktiv-Consumer sollte geprüft werden:

- targetType
- targetId
- targetModule
- targetCapability

## Nicht in STEP298

- keine Codeänderung
- kein Dashboard-Modul gebaut
- keine Overlay-Migration
- keine Modul-Migration
- keine Änderung am SoundBus-Eventformat
- keine Queue-/Bundle-/activeBundleLock-Änderung
- keine DB-Migration

## Nächster empfohlener Schritt

STEP299 – Sound Dashboard Monitoring Modul Plan/Scaffold

Ziel:

- Dashboard-Sound-Monitor als eigene Moduldateien vorbereiten
- zunächst lesend
- API + WS-Anzeige kombinieren
- keine Steueraktionen außer optionalem Test-Ping für Admin

Mögliche Dateien:

```text
htdocs/dashboard/modules/soundbus.js
htdocs/dashboard/modules/soundbus.css
```

Optional später:

```text
backend/modules/dashboard_soundbus.js
config/dashboard_soundbus.json
```

