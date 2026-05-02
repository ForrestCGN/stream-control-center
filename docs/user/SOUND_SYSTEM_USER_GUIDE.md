# Sound-System Benutzeranleitung

Stand: 2026-05-02  
Projekt: `stream-control-center`

## Zweck

Das Sound-System ist die zentrale Stelle für Sound-Ausgaben im Stream.

Es soll langfristig möglichst alle Sound-Ausgaben bündeln:

```txt
- Alerts
- VIP-/Community-Sounds
- Fun-Sounds
- System-Sounds
- später Discord-Ausgabe
- später TTS
```

## Wo finde ich es?

Im Dashboard:

```txt
System → Sound-System
```

## Aufbau

Die Sound-Seite ist in Tabs aufgeteilt:

```txt
Übersicht
Ausgabe
Queue
Einstellungen
Sounds
```

## Übersicht

Zeigt den aktuellen Zustand:

```txt
- Modul aktiv/inaktiv
- ob gerade ein Sound läuft
- Queue-Status
- Policy/Regeln
```

Hier sieht man schnell, ob das Sound-System arbeitet.

## Ausgabe

Hier wird eingestellt, wohin Sounds gehen sollen.

Aktuelle Ausgabearten:

```txt
Overlay / OBS
Audiogerät
Beides
```

Der aktuell getestete wichtige Ausgabeweg ist:

```txt
Audiogerät → Voicemeeter AUX Input
```

Wichtig:

```txt
Alert-Live-Sounds sollen über das Sound-System laufen.
Lokale Dashboard-Vorschau soll nicht über OBS/Sound-System laufen.
```

## Queue

Die Queue zeigt Sounds, die warten.

Wichtiges Verhalten:

```txt
- normale Alerts unterbrechen laufende Sounds nicht
- Alerts werden nach Priorität einsortiert
- wenn ein Alert-Sound später dran ist, startet der visuelle Alert passend zum Sound
```

Buttons:

```txt
Stop        = aktuellen Sound stoppen
Skip        = aktuellen Sound überspringen / nächsten starten
Queue leeren = wartende Sounds entfernen
```

## Einstellungen

Hier liegen normale Sound-System-Einstellungen, die im Streambetrieb sinnvoll sind:

```txt
- Lautstärken
- Queue aktiv
- maximale Queue-Länge
- Drop-Verhalten
- Prioritätssortierung
- Parallel-Regeln
- Alert-Sync
- Interrupt-Regeln
- Drop-Regeln
- Cooldowns
- Dedupe
- Prioritäten
- Kategorie-Defaults
```

Diese Werte werden gespeichert in:

```txt
SQLite: data/sqlite/app.sqlite
Tabelle: sound_settings
```

## Sounds

Hier wird die Sound-Liste angezeigt.

Aktuell ist das primär eine Übersicht und Startmöglichkeit. Upload/Dateiverwaltung ist ein späterer Ausbau.

## Alert-Sync

Alerts sollen nicht sichtbar starten, während ihr Sound noch in der Queue wartet.

Aktueller Ablauf:

```txt
1. Alert wird vorbereitet.
2. Sound wird ins Sound-System gegeben.
3. Sound-System queued nach Priorität.
4. Wenn der Alert-Sound dran ist, bekommt das Alert-Overlay ein Startsignal.
5. Overlay erscheint minimal vor oder gleichzeitig mit dem Sound.
```

Aktuelle wichtige Werte:

```txt
visualLeadMs = 150
maxVisualLeadMs = 500
```

## Unterschied: lokale Vorschau vs. Live-Test

### Lokale Vorschau

In Alerts V2:

```txt
👁 Lokale Vorschau
```

Bedeutung:

```txt
- läuft nur auf dem eigenen Rechner
- kein OBS
- kein Sound-System
- keine Live-Queue
- Sound wird lokal im Dashboard-Browser abgespielt
```

### Live-Test

In Alerts V2:

```txt
● Live-Test
```

Bedeutung:

```txt
- echte Alert-Pipeline
- OBS-Overlay
- Sound-System
- Audiogerät/Voicemeeter je nach Einstellung
```

## Was gehört NICHT auf die normale Sound-Seite?

Technische Werte gehören in den Adminbereich:

```txt
Admin → Configs → Sound-System Experten
```

Dazu zählen:

```txt
- Helper-Pfad
- Helper Timeout
- Playback Mode
- Overlay URL
- Sounds Base Dir
- Allowed Extensions
- Parallel-Kategorien als technische Basis
```

## Prüfbefehle

Sound-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

Sound-Settings:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 20
```

Nur gespeicherte SQLite-Overrides:

```powershell
(Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings").settings | ConvertTo-Json -Depth 20
```

## Bekannte gute Werte

```txt
output.defaultTarget = device
selectedDeviceName = Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)
helper.path = tools/audio-device-helper/dist/AudioDeviceHelper.exe
helper.playbackMode = auto
soundsBaseDir = htdocs/assets/sounds
allowedExtensions = .mp3, .wav, .ogg, .webm, .m4a
```

## Wenn etwas nicht funktioniert

```txt
1. Dashboard hart neu laden: Strg + F5
2. /api/sound/status prüfen
3. /api/sound/settings prüfen
4. Backend neu starten
5. Prüfen, ob sound_system.js in /api/_status geladen ist
6. Prüfen, ob AudioDeviceHelper vorhanden ist
```
