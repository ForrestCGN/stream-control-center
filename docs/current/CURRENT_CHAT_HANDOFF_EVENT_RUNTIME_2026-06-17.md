# CURRENT_CHAT_HANDOFF_EVENT_RUNTIME_2026-06-17

Stand: 2026-06-17 16:20

## Kontext

Wir arbeiten am Projekt `stream-control-center` von ForrestCGN.

Aktueller Block: EventSound Runtime / Runtime-Overlay / Sound-System.

## Repo / Live

```text
Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Server: http://127.0.0.1:8080
Dashboard: http://127.0.0.1:8080/dashboard
Produktive DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

DB niemals überschreiben/löschen/neu bauen. Nur sanfte Migrationen.

## Arbeitsregeln

```text
- Vor Umsetzung echte Dateien prüfen.
- Ziel / Dateien / Änderung / Nicht geändert / Tests nennen.
- Auf ausdrückliches go warten.
- Keine Apply-Scripte, Patch-Scripte, Regex-Patches oder losen Teil-Dateien.
- Vollständige echte Ersatzdateien liefern.
- ZIPs mit echten Repo-Pfaden ab Root.
- Keine Funktionalität entfernen ohne Freigabe.
- StepDone erst nach Entpacken + Deploy/Live-Aktualisierung, danach testen.
```

## Aktueller bestätigter Stand

```text
- Sound-Schnipsel läuft über Sound-System.
- Antwortfenster startet nach Sound-Ende.
- Counter oben rechts läuft während Antwortfenster.
- Richtige Antwort wird erkannt und Punkte werden vergeben.
- Gewinner-Card erscheint Mitte rechts.
- Reveal wird nach Gewinner-Card über Sound-System geplant.
- Keine-Lösung-Kachel erscheint nach Timeout oben mittig.
- Kein AUFLOESUNG/LOS/JETZT RATEN beim Reveal.
- Kein JETZT RATEN während Soundlauf.
```

## Layout-Stand

### Gewinner-Card

```text
Position: Mitte rechts
Avatar/Initialen: ja
Username eigene Zeile
Punkte eigene Zeile
Titel eigene zweizeilige Box
```

Long-Winner-Demo:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```

### Keine-Lösung-Kachel

```text
Position: oben mittig
Dauer: ca. 10 Sekunden
Text zentriert
```

Text:

```text
KEINE LÖSUNG
Die Heimleitung hat im Chat
keine richtige Antwort erkannt.
Der Schnipsel bleibt im Archiv.
```

### Counter

```text
Position: oben rechts
Hintergrund ohne Transparenz
Nur Zahl
Nur während answerWindow.active=true
```

## Wichtige Tests

Mit Lösung / Counter ca. 30 Sekunden:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\EVENT_RUNTIME_DIAG_DELAYED_ANSWER_30S.ps1"
```

Timeout / keine Antwort:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File ".\tools\test_event_runtime_unresolved_card.ps1"
```

Long Winner Layout:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```

## Bekannte Hinweise

```text
- Wenn Counter fehlt, Runtime-State prüfen: answerWindow.active muss true sein.
- Wenn Reveal unsichtbar ist, sound_system_overlay.html/OBS-Quelle prüfen.
- Long-Winner-Custom-Testevent war als Timing-Test unzuverlässig; Demo-URL ist besser.
- Event Runtime Overlay startet kein Audio/Video.
```

## Nächster sinnvoller Schritt

```text
1. Layout so lassen, wenn Live/Demo ok ist.
2. Reveal-Video-Sichtbarkeit nur bei konkretem Problem über sound_system_overlay.html prüfen.
3. Danach EventSound Dashboard-/Config-Anbindung fortführen.
4. Später Overlay-/Chattexte ins zentrale Textvarianten-System bringen.
```
