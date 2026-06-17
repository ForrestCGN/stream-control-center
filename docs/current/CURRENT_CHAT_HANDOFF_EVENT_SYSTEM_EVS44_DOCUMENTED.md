# CURRENT CHAT HANDOFF – Event-System EVS44 dokumentiert

Stand: 2026-06-17  
Projekt: `stream-control-center` / `stream_events` / EventSound Runtime  
Arbeitsweise: Deutsch, strikt schrittweise, erst prüfen/planen, dann auf ausdrückliches `go` umsetzen.

## Projektbasis

```text
GitHub: ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-System: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard
Backend: http://127.0.0.1:8080
Produktive SQLite: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Harte Arbeitsregeln

- Echte aktuelle Dateien/Repo/ZIP sind Single Source of Truth.
- Nicht raten. Wenn benötigte Dateien fehlen: exakt anfordern.
- Keine Funktionalität entfernen.
- Keine DB ersetzen, neu bauen oder überschreiben.
- Produktive SQLite nur sanft erweitern/migrieren.
- Keine Apply-/Patch-/Regex-Scripte.
- Keine PowerShell-Set-Content-Hacks.
- Änderungen nur als vollständige Ersatzdateien mit echten Zielpfaden im ZIP.
- Bei Datei-/ZIP-Steps immer: ZIP entpacken → `stepdone.cmd` ausführen → dann testen.
- Nach jedem stabilen Step: Doku/TODO/NEXT/FILES/CHANGELOG/Handoff aktualisieren.
- Vor neuen Umbauten vorhandene Systeme nutzen: Communication/EventBus, twitch_events Stream-State, Sound-System, Media-System, Helper/Texte/DB.
- Dashboard streamer-/modfreundlich halten, keine unnötig technischen Eingaben.

## Aktives Test-Event

```text
eventUid: evs_event_mqi781rt_f19c50c6c409
Name: 1.Kopie von Kopie von 1 Jahr Twitch
Spieltyp: Sound
Status: active
```

## Bestätigter Stand vor EVS43

Sound-Schnipsel-Runtime läuft grundsätzlich:

- 3 Sekunden PreRoll/Countdown vor Sound.
- Sound-Playback über normales Sound-System.
- Antwortfenster startet nach Sound-Ende.
- Antwortzeit kommt aus Event-Einstellung: 60 Sekunden.
- Bei richtiger Antwort: Punkte, Runde solved, optional Reveal-Video via Sound-System.
- Bei Timeout: unresolved, je nach Config später erneut in Rotation.
- Event bleibt aktiv, bis alle konfigurierten Teilspiele erledigt sind oder manuell beendet wird.

## EVS43 – RuntimeGate Stream-State Fix

Problem:

`stream_events` nutzte trotz Dashboard-Manual-Override noch eine rohe Twitch-/API-/Stream-Quelle und dachte weiterhin `stream_offline`. Dadurch war `chatEvaluationActive=false` und Chatantworten wurden nicht verarbeitet.

Fix:

```text
stream_events v0.5.60
Build: STEP_EVENT_RUNTIME_GATE_TWITCH_EVENTS_STREAM_STATE_1
```

Geändert:

- RuntimeGate nutzt jetzt den zentralen `twitch_events` Stream-State.
- Manual Override Online wird korrekt akzeptiert.
- `runtimeGate.stream.source = manual_override` wird korrekt durchgereicht.
- `effectiveSource = twitch_events_stream_state`.
- `chatEvaluationActive = true`, wenn Event aktiv und effektiver Stream-State online ist.
- Raw Twitch-/Statusquellen bleiben nur Fallback.

Bestätigung durch Test:

```text
runtimeGate.active = True
chatEvaluationActive = True
source = manual_override
effectiveSource = twitch_events_stream_state
manualOverrideActive = True
```

Danach wurde eine Antwort erkannt und gespeichert:

```text
solved: 1
soundScoreEntries: 1
userDisplayName: ForrestCGN
sourceType: sound_solved
reason: sound_snippet_solved
points: 10
answer: Full House
answerWindowCloseReason: solved
```

## EVS44 – Stream Offline Auto-Wait + Button Guard

Problem:

EVS38 hatte Stream-Offline-Schutz eingebaut, setzte das Event aber in einen klebenden Pausezustand. Das Dashboard zeigte `Manuell pausiert`, obwohl die Pause automatisch durch Offline-Erkennung kam. Außerdem war der Button `Wartezeit überspringen` in einem unpassenden Zustand sichtbar.

Zielentscheidung:

Stream offline soll nicht zu einem dauerhaft manuellen Pausemodus führen. Das Event soll automatisch warten und beim Wieder-Online automatisch weiterplanen. Manuelles Pausieren/Fortsetzen bleibt perspektivisch sinnvoll, darf aber getrennt von Auto-Offline-Warten betrachtet werden.

Fix:

```text
Build: STEP_EVENT_STREAM_OFFLINE_AUTO_WAIT_1
Step: EVS44 Stream Offline Auto-Wait Button Guard
```

Geändert:

- Stream offline setzt das Event nicht mehr dauerhaft in manuellen Pausemodus.
- Stream offline → Event wartet automatisch.
- Laufende Runde wird weiterhin sicher abgebrochen/requeued.
- Offline startet kein neuer Schnipsel.
- Wenn Stream wieder online erkannt wird, soll das Event automatisch zurück zu `active/waiting` und eine normale Auto-Wartezeit planen.
- Kein sofortiger Schnipselstart beim Wiederkommen.
- `Wartezeit überspringen` wird im Dashboard nur noch angezeigt, wenn es sinnvoll ist.

Bestätigter Status nach Alt-Pause-Resume:

```text
runtimeStatus: active
phase: stream_offline_waiting
recoveryReason: stream_offline
recoveryNote: Stream ging offline. Event wartet automatisch bis der Stream wieder online ist.
label: Stream offline – Event wartet automatisch
chatEvaluationActive: False
```

Interpretation:

- Alter manueller Pausezustand wurde gelöst.
- Event hängt nicht mehr manuell pausiert fest.
- Event ist active, wartet aber automatisch wegen Offline-State.
- Sobald Stream-State online wird, soll es automatisch weiterplanen.

## Gewinner-Overlay Stand

Es wurden mehrere EVS42.x Overlay-Varianten getestet. Ergebnis: EVS42.5/42.6 waren nicht zufriedenstellend bzw. visuell/technisch nicht stabil genug.

Aktuelle Entscheidung:

- Overlay morgen neu und sauber weiterbauen.
- Kein weiteres Flicken an EVS42.5/42.6 als Basis.
- Designrichtung bleibt:
  - CGN-Stil mit statischem Rahmen.
  - Kein rotierender Komplett-Rand.
  - Plätze 10–4 sind keine Verlierer, sondern Top-10-Ehrenrunde.
  - Platz 10–4: einzeln einblenden, dann Kachel verkleinern und in Ehrenwand wandern lassen.
  - Top 3 am Ende groß als Podium aufbauen: Platz 3 links, Platz 2 rechts, Platz 1 mittig.
  - Top 3 bekommen Gutscheine.
  - Kein goldener Umschlag.
  - Avatare sollen wenn möglich sichtbar eingebunden werden.
  - Mehr Show, mehr Effekt, weniger Dashboard-/Boxenlayout.

## Offene Punkte für nächsten Chat

1. EVS44 Live-Online-Rückkehr testen: Wenn Stream wieder online erkannt wird, muss `stream_offline_waiting` automatisch verlassen und normal weitergeplant werden.
2. Dashboard prüfen: `Wartezeit überspringen` darf nur sichtbar sein bei `runtimeStatus=active`, `phase=waiting`, Stream online, keine aktive Runde.
3. Gewinner-Overlay neu aufbauen:
   - Fresh, aber auf stabiler sichtbarer HTML-Basis.
   - Erst eine sehr einfache sichtbare Version mit Demo-Daten und klaren Phasen.
   - Danach Effekte/Feinschliff.
4. EVS44 ggf. mit echtem Online-/Offline-Wechsel final bestätigen.
5. Finale-/Winner-Live-Anbindung später mit echtem `finished` Event und Punkten testen.

## Wichtige Testbefehle

Status:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeGate | Select-Object active,status,reason,label,chatEvaluationActive
$s.runtimeGate.eventRuntimeState | Select-Object runtimeStatus,phase,nextAutoStartAt,recoveryReason,recoveryNote
```

Sound-Runtime Report:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/sound-runtime/report?eventUid=evs_event_mqi781rt_f19c50c6c409"
$r.counts
$r.scoreEntries | Select-Object -First 10 createdAt,userLogin,userDisplayName,sourceType,reason,points | Format-List
$r.rounds | Select-Object -First 5 roundUid,status,result,itemUid,finishedAt,resultData | Format-List
```

Resume nur falls nötig:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/runtime/resume?confirm=1" | ConvertTo-Json -Depth 8
```
