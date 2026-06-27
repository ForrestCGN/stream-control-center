Wir machen im Projekt `stream-control-center` von ForrestCGN weiter, Bereich `stream_events` / Event-System / EventSound Runtime / Winner-Finale-Overlay.

Bitte auf Deutsch antworten, ruhig, direkt und strikt schrittweise.

Wichtig:
Erst prüfen, dann planen, dann auf mein ausdrückliches `go` warten. Keine Umsetzung ohne `go`.

## Projektbasis

GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
Backend: http://127.0.0.1:8080
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite

Aktives Test-Event zuletzt:
evs_event_mqi781rt_f19c50c6c409

Name:
1.Kopie von Kopie von 1 Jahr Twitch

## Harte Arbeitsregeln

- Keine Funktionalität entfernen.
- Nicht raten.
- Immer echte aktuelle Dateien/Repo/ZIP als Source of Truth nehmen.
- Fehlende Dateien exakt anfordern.
- Keine Apply-Scripte.
- Keine Patch-Scripte.
- Keine PowerShell-Regex-/Set-Content-Hacks.
- Änderungen nur als vollständige Ersatzdateien mit echten Zielpfaden im ZIP.
- Produktive SQLite niemals ersetzen, überschreiben oder neu bauen.
- Bestehende Systeme nutzen: Communication/EventBus, twitch_events, Sound-System, Media-System, Helper, DB/Texte.
- Dashboard streamer-/modfreundlich halten.
- Keine unnötig technischen Eingaben im Dashboard.
- Bei ZIP-/Datei-Steps immer:
  ZIP entpacken → stepdone.cmd ausführen → danach testen.
- Bei jedem Datei-ZIP immer den passenden StepDone-Befehl nennen.
- Nach stabilen Steps Doku/TODO/NEXT/FILES/CHANGELOG/Handoff aktualisieren.

## Bestätigte Stände

EVS43:
- RuntimeGate Stream-State Fix bestätigt.
- `stream_events` nutzt `twitch_events.getStreamState()`.
- Manual Override Online wird korrekt als online erkannt.
- Chat-Evaluation aktiv.
- Sound-Schnipsel wurde korrekt gelöst.

EVS44:
- Stream Offline Auto-Wait + Button Guard bestätigt.
- Offline führt zu `stream_offline_waiting`.
- Online-Rückkehr führt automatisch zurück zu `waiting`.
- Wartezeit wird normal geplant.
- Dashboard-Button „Wartezeit überspringen“ nur bei aktiv/waiting/online sichtbar.

## Winner-Finale-Overlay aktueller Stand

Der alte CSS/Card-Look war nicht CGN genug.
KI-Hintergrundbild-Ansatz wurde verworfen, weil 1920×1080 nicht zuverlässig.
Aktuell wird ein 1920×1080 Raster-/PNG-Hintergrund genutzt:

- `htdocs/assets/stream_events/winner_finale_bg_1920x1080.png`

Overlay-Datei:

- `htdocs/overlays/stream_events/event_winner_overlay.html`

Ziel:
- Grafik ist Bühne/Hintergrund.
- HTML/CSS legt komplette Slot-Schablonen über grafische Rahmen.
- JS füllt Inhalte ein.
- Keine einzelnen Textfetzen frei platzieren.

## Aktuelles Problem

EVS49.12 wurde gebaut, um Slot-Schablonen einzuführen, aber der Test zeigte nur schwarzen Hintergrund.

Screenshot/URL:
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes&grid=1&v=4912

Problem:
- keine Grafik sichtbar
- keine Boxen sichtbar
- vermutlich Stage/Debug-Modus/JS-Renderingproblem

EVS49.12 ist daher nicht stabil und nicht final.

## Nächster Auftrag

1. Zuerst echte aktuelle Datei prüfen:
   - `htdocs/overlays/stream_events/event_winner_overlay.html`
   - `htdocs/assets/stream_events/winner_finale_bg_1920x1080.png`

2. Schwarzbild analysieren:
   - Browser-Konsole prüfen.
   - Prüfen, ob Hintergrundbild lädt.
   - Prüfen, ob `#stage.visible` gesetzt wird.
   - Prüfen, ob `renderLayoutBoxes()` läuft.
   - Prüfen, ob `debug=boxes` ohne Demo-Daten überhaupt anzeigen soll.
   - Test auch mit:
     `?demo=long&state=final&debug=boxes&grid=1&v=4912`

3. Erst minimal sichtbar machen:
   - Hintergrund immer sichtbar im Boxenmodus.
   - Schablonen sofort sichtbar.
   - Keine Animation nötig.
   - Keine Eventdaten nötig.

4. Danach erst Positionen finalisieren:
   - komplette Header-Schablone
   - komplette Top-3-Schablonen
   - komplette Honor-Schablonen 4–10

5. Danach echte Texte/Avatare wieder rein:
   - lange Namen verkleinern
   - wenn nötig Marquee/Hin-und-her-Scroll
   - keine extra Platz-Texte, weil 01/02/03 und 04–10 bereits in der Grafik stehen

## Nicht anfassen ohne ausdrücklichen Auftrag

- Punkte-Logik
- Finale-Backend-Logik
- Sound-System-Playback
- Datenbankstruktur
- Loyalty
- Alert-System
- Twitch-Events allgemein

## Wichtige Test-URLs

Status:
http://127.0.0.1:8080/api/stream-events/status

Sound Runtime Report:
http://127.0.0.1:8080/api/stream-events/sound-runtime/report?eventUid=evs_event_mqi781rt_f19c50c6c409

Winner Overlay:
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html

Boxenmodus:
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes

Boxenmodus + Raster:
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes&grid=1

Demo Endzustand:
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=long&state=final
