# Neuer Chat Prompt – Event-System ab EVS44

Wir machen morgen mit dem Projekt `stream-control-center` / `stream_events` / Event-System weiter.

Bitte auf Deutsch antworten, ruhig, direkt und strikt schrittweise.

## Arbeitsweise

Wichtig: Erst prüfen, dann planen, dann auf mein ausdrückliches `go` warten. Keine Umsetzung ohne `go`.

Bei Datei-/ZIP-Steps gilt verbindlich:

```text
ZIP entpacken → stepdone.cmd ausführen → dann testen
```

Bitte bei jedem Datei-ZIP immer den passenden StepDone-Befehl nennen.

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

## Harte Regeln

```text
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
- Nach stabilen Steps Doku/TODO/NEXT/FILES/CHANGELOG/Handoff aktualisieren.
```

## Bitte zuerst lesen/berücksichtigen

```text
docs/current/CURRENT_CHAT_HANDOFF_EVENT_SYSTEM_EVS44_DOCUMENTED.md
docs/modules/stream_events_CURRENT_EVS44.md
project-state/CURRENT_STATUS_EVENT_SYSTEM_EVS44.md
project-state/TODO_EVENT_SYSTEM_EVS44.md
project-state/NEXT_STEPS_EVENT_SYSTEM_EVS44.md
project-state/CHANGELOG_EVENT_SYSTEM_EVS44.md
project-state/FILES_EVENT_SYSTEM_EVS44.md
MASTER_PROMPT_stream_control_center_CLEAN_2026-06-15.txt
```

## Aktueller bestätigter Stand

### EVS43 bestätigt

RuntimeGate nutzt jetzt den zentralen `twitch_events` Stream-State. Manual Override Online wird korrekt akzeptiert. Chatantworten werden wieder verarbeitet.

Bestätigt:

```text
runtimeGate.active = True
chatEvaluationActive = True
source = manual_override
effectiveSource = twitch_events_stream_state
solved = 1
soundScoreEntries = 1
points = 10
```

### EVS44 bestätigt / aktueller Zustand

Stream offline führt nicht mehr zu klebendem manuellem Pausemodus. Das Event bleibt active und wartet automatisch:

```text
runtimeStatus = active
phase = stream_offline_waiting
label = Stream offline – Event wartet automatisch
recoveryNote = Stream ging offline. Event wartet automatisch bis der Stream wieder online ist.
```

Wenn der Stream-State wieder online erkannt wird, soll das Event automatisch aus `stream_offline_waiting` zurück in `waiting` wechseln und eine normale Auto-Wartezeit planen. Kein sofortiger Schnipselstart.

## Auftrag für morgen

### 1. EVS44 überprüfen

Zuerst prüfen, ob bei wieder Online-State automatisch aus `stream_offline_waiting` zurück in `waiting` gewechselt wird.

Teststatus:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s.runtimeGate | Select-Object active,status,reason,label,chatEvaluationActive
$s.runtimeGate.eventRuntimeState | Select-Object runtimeStatus,phase,nextAutoStartAt,recoveryReason,recoveryNote
```

Dashboard prüfen:

```text
- Wartezeit überspringen darf nicht angezeigt werden bei offline_waiting/manual_paused/active_round/answer_window.
- Wartezeit überspringen nur bei active + waiting + Stream online.
- Offline-Warten soll klar und nicht wie Fehler/Pause aussehen.
```

### 2. Gewinner-Overlay neu/sauber bauen

Die bisherigen EVS42.5/42.6 Overlay-Versionen waren nicht gut genug. Bitte nicht blind weiterflicken. Erst echte aktuelle Datei prüfen oder Datei anfordern.

Gewünschte Richtung:

```text
- CGN-Stil: Neon-Lila/Cyan, dunkler Hintergrund, statischer Rahmen, Runner nur dezent.
- Kein komplett rotierender Rand.
- Mehr Show, weniger Dashboard/Boxenlayout.
- Plätze 10–4 sind Top-10-Ehrenrunde, keine Verlierer/Trostpreise.
- Plätze 10–4: einzeln groß einblenden, dann verkleinern und in Ehrenwand wandern lassen.
- Top 3: Platz 3 links, Platz 2 rechts, Platz 1 Mitte.
- Top 3 bekommen Gutscheine: Bronze/Silber/Gold.
- Kein goldener Umschlag.
- Avatare wenn möglich einbinden.
- Bei fehlendem Avatar schöner Glow-Fallback, nicht nur nackter Buchstabe.
- Show darf 3–5 Minuten dauern, aber Test-Speed muss vorhanden sein.
```

Vorgehen für Overlay:

```text
1. Erst Datei prüfen.
2. Dann Design-/Ablaufplan nennen.
3. Auf go warten.
4. Erst eine stabile sichtbare Basis bauen.
5. Demo-URL muss sofort sichtbar funktionieren.
6. Danach Effekte verfeinern.
```

### 3. Nicht anfassen ohne Auftrag

```text
- Punkte-Logik
- Finale-Backend-Logik
- Sound-System-Playback
- DB-Struktur
- Loyalty
- Alert-System
```

## Wichtige bekannte URLs

Sound-Runtime Report:

```text
http://127.0.0.1:8080/api/stream-events/sound-runtime/report?eventUid=evs_event_mqi781rt_f19c50c6c409
```

Stream-Events Status:

```text
http://127.0.0.1:8080/api/stream-events/status
```

Overlay-Test später:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=single&speed=fast&debug=1
```
