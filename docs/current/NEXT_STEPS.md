# NEXT_STEPS – stream-control-center

Stand: 2026-06-17 16:20

## Neuer Chat / nächster Startpunkt

```text
EVENT-RUNTIME-STABILIZE-2 – EventSound Runtime im Live-/OBS-Setup prüfen und danach Dashboard-/Config-Anbindung fortführen
```

## Sofort zuerst prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

Erwartung aus letztem Arbeitsstand:

```text
stream_events mindestens 0.5.51 / STEP_EVENT_RUNTIME_UNRESOLVED_CARD_1
Runtime-Overlay im Browser/Live mindestens 0.3.7, wenn Demo-Step eingespielt wurde
```

## Test-Reihenfolge

### 1. Demo Gewinner-Card langer Name/Titel

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```

Sichtprüfung:

```text
- langer Name lesbar
- Punkte sichtbar
- langer Titel zweizeilig sauber begrenzt
- Card bricht nicht aus
```

### 2. Test mit Lösung und 30 Sekunden Counter-Laufzeit

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\EVENT_RUNTIME_DIAG_DELAYED_ANSWER_30S.ps1"
```

Erwartung:

```text
3 / 2 / 1 / LOS
Sound läuft ohne JETZT RATEN
Sound endet
Counter oben rechts läuft ca. 30 Sekunden
Antwort wird gesendet
Gewinner-Card erscheint
Reveal-Video startet danach über Sound-System-Overlay
```

### 3. Timeout-Test ohne Antwort

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File ".	ools	est_event_runtime_unresolved_card.ps1"
```

Erwartung:

```text
Counter läuft bis 0
Counter verschwindet
Keine-Lösung-Kachel oben mittig ca. 10 Sekunden
kein Reveal
kein Punkt
```

## Offen / nächste technische Themen

### A. Reveal-Video-Sichtbarkeit prüfen, falls nochmal unsichtbar

Reveal läuft über:

```text
htdocs/overlays/sound_system_overlay.html
```

Nicht über:

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
```

Wenn Reveal nicht sichtbar ist:

```text
- OBS-Browserquelle für sound_system_overlay.html prüfen.
- /api/sound/recent-playback?limit=10 prüfen.
- outputTarget=overlay / hasVideo / status started prüfen.
- sound_system_overlay.html als echte Datei anfordern und prüfen.
```

### B. EventSound Dashboard-/Config-Integration

```text
- Sound- und Text-Spieltypen weiterhin getrennt konfigurieren.
- Event nur startbar, wenn gewählte Spieltypen vollständig konfiguriert sind.
- Runtime-/Antwort-/Reveal-Konfiguration streamer-/modfreundlich im Dashboard abbilden.
- Texte später in zentrale Textvarianten bringen, nicht hart im Code lassen.
```

### C. Auto-Rotation weiter prüfen

Bestätigte Regel:

```text
random_auto / sequence_auto: nächste automatische Runde nach intervalMinutes ± intervalJitterMinutes.
roundDelaySeconds ist nur Mindestpause/Floor.
Manuelle next-round API darf weiter sofort auslösen.
```

Noch prüfen:

```text
- nach gelöstem Reveal kein direkter Schnipsel nach 60 Sekunden
- nach Timeout normaler Auto-Intervall
- Schnipsel je nach Config aus Rotation entfernen oder später wiederholen
```

### D. Später: Textsystem/Dashboardtexte

Aktuell sind einzelne Overlay-Texte noch im Code/Overlay hart gesetzt. Langfristig sollen Texte dashboardfähig über Textvarianten laufen:

```text
KEINE LÖSUNG
Die Heimleitung hat im Chat
keine richtige Antwort erkannt.
Der Schnipsel bleibt im Archiv.
```

## Nicht als nächstes tun

```text
- Kein neues Parallel-Sound-System bauen.
- Keine direkte Audio-/Videoausgabe aus stream_events am Sound-System vorbei.
- Keine DB ersetzen/überschreiben.
- Keine Regex-/Patch-/Apply-Scripte.
- Keine weiteren Layoutänderungen ohne Sichtproblem.
```
