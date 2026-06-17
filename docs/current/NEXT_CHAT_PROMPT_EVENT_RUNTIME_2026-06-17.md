Wir arbeiten am Projekt stream-control-center von ForrestCGN.

Sprache: Deutsch. Kurz, direkt, pragmatisch. Keine wilden Annahmen.

Repo/Projekt:
- Repo: D:\Git\stream-control-center
- Live-Ziel: D:\Streaming\stramAssets
- Lokaler Server: http://127.0.0.1:8080
- Dashboard: http://127.0.0.1:8080/dashboard
- Produktive DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
- DB niemals überschreiben, löschen oder neu bauen. Migrationen nur sanft und datenverlustfrei.

Arbeitsweise verbindlich:
- Vor Umsetzung immer zuerst echte Dateien prüfen.
- Dann kurz nennen:
  - Ziel
  - betroffene Dateien
  - geplante Änderung
  - was NICHT geändert wird
  - Tests
- Danach auf mein ausdrückliches go warten.
- Ohne go keine Umsetzung.
- Keine Funktionalität entfernen, außer ausdrücklich erlaubt oder alte Logik wurde getestet/freigegeben und bewusst ersetzt.
- Keine Apply-Scripte, keine Patch-Scripte, keine Regex-Patches, keine losen Teil-Dateien.
- Bei Codeänderungen vollständige echte Ersatzdateien liefern.
- ZIPs immer mit echten Repo-Pfaden ab Repo-Root, direkt nach D:\Git\stream-control-center entpackbar.
- Keine ZIPs/7z ins Repo legen.

StepDone-Regel:
- Nach ZIP-Einspielen gilt immer:
  1. ZIP nach D:\Git\stream-control-center entpacken
  2. deployen / Live aktualisieren
  3. .\stepdone.cmd "PASSENDE STEP BESCHREIBUNG" ausführen
  4. erst danach testen
  5. nach erfolgreichem Test kein zweites StepDone
- Wenn Backend-Dateien geändert wurden und Node nicht automatisch neu startet: Backend neu starten.
- Bei reinen Doku-Steps ist nach StepDone kein Funktionstest nötig.

Aktueller Stand EventSound Runtime / Runtime-Overlay:
- Sound-System bleibt Playback-/Queue-Owner.
- Eventsystem/Runtime-Overlay darf Sound/Video nicht direkt am Sound-System vorbei starten.
- Sound-Schnipsel läuft hörbar.
- PreRoll: 3 / 2 / 1 / LOS.
- Während Countdown und Sound werden Antworten nicht akzeptiert.
- Während Soundlauf wird kein „JETZT RATEN“ mehr angezeigt.
- Antwortfenster startet erst nach Sound-Ende.
- Counter oben rechts läuft während answerWindow.active=true.
- Counter hat deckenden Hintergrund, nur Zahl, kein Text.
- Richtige Antwort wird erkannt und Punkte werden vergeben.
- Gewinner-Card erscheint Mitte rechts.
- Gewinner-Card Layout wurde robust gemacht:
  - Username eigene Zeile
  - Punkte eigene Zeile
  - Titel eigene 2-zeilige Titelbox
  - lange Namen/Titel sollen nicht ausbrechen
- Reveal startet nach Gewinner-Card über Sound-System-Overlay.
- Kein AUFLOESUNG/LOS/JETZT RATEN-Kreis mehr beim Reveal.
- Timeout/keine richtige Antwort:
  - Counter weg
  - Keine-Lösung-Kachel oben mittig ca. 10 Sekunden
  - kein Reveal
  - keine Punkte
  - Lösung wird nicht gespoilert
- Keine-Lösung-Text:
  KEINE LÖSUNG
  Die Heimleitung hat im Chat
  keine richtige Antwort erkannt.
  Der Schnipsel bleibt im Archiv.

Wichtige Dateien:
- backend/modules/stream_events.js
- backend/modules/sound_system.js
- htdocs/overlays/stream_events/event_runtime_overlay.html
- htdocs/overlays/sound_system_overlay.html
- tools/test_event_runtime_unresolved_card.ps1
- docs/current/CURRENT_STATUS.md
- docs/current/NEXT_STEPS.md
- docs/current/TODO.md
- docs/current/CHANGELOG.md
- docs/current/FILES.md
- docs/current/CURRENT_CHAT_HANDOFF_EVENT_RUNTIME_2026-06-17.md
- docs/current/NEXT_CHAT_PROMPT_EVENT_RUNTIME_2026-06-17.md
- docs/modules/stream_events.md
- docs/overlays/event_runtime_overlay.md
- docs/testing/SOUND_EVENT_RUNTIME_TESTFLOW.md

Wichtige URLs:
- Runtime Overlay:
  http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
- Runtime Overlay Debug:
  http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?debug=1&v=test
- Long Winner Demo:
  http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
- Sound-System Overlay für Reveal:
  http://127.0.0.1:8080/overlays/sound_system_overlay.html

Wichtige Tests:
Version prüfen:
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List

Runtime State:
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state" | ConvertTo-Json -Depth 12

Sound Recent Playback:
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=10" | ConvertTo-Json -Depth 12

Mit Lösung / 30 Sekunden Counter:
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\EVENT_RUNTIME_DIAG_DELAYED_ANSWER_30S.ps1"

Timeout / keine Antwort:
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File ".\tools\test_event_runtime_unresolved_card.ps1"

Long Winner Layout:
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test

Bekannte Hinweise:
- Wenn Counter fehlt: prüfen, ob answerWindow.active im Runtime-State true ist.
- Wenn Reveal nicht sichtbar ist: Reveal läuft über htdocs/overlays/sound_system_overlay.html, nicht über event_runtime_overlay.html.
- Wenn alte Anzeige sichtbar ist: Repo-/Live-Datei, Backend-Version, Deploy und OBS-Browsercache prüfen.
- Der korrekte Overlay-Pfad ist htdocs/overlays/stream_events/event_runtime_overlay.html.
- Long-Winner-Custom-Testevent war unzuverlässig; für Layout lieber Demo-URL nutzen.

Nächster sinnvoller Schritt:
1. Aktuellen EventSound-Runtime-Stand nicht weiter umbauen, solange Demo/Live gut aussieht.
2. Reveal-Video-Sichtbarkeit nur bei konkretem Problem über sound_system_overlay.html prüfen.
3. Danach EventSound Dashboard-/Config-Anbindung fortführen.
4. Später Overlay-/Chat-/Systemtexte in zentrale, dashboardfähige Textvarianten auslagern.
5. Auto-Rotation nach Reveal/Timeout über mehrere Runden prüfen.
