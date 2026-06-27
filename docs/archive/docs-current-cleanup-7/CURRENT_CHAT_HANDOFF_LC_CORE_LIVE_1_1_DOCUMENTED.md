# CURRENT_CHAT_HANDOFF – LC-CORE-LIVE-1.1 dokumentiert

Stand: 2026-06-15

## Projekt

```text
stream-control-center
Repo: ForrestCGN/stream-control-center
Branch: dev
Lokal: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Dashboard: http://127.0.0.1:8080/dashboard/
```

## Aktueller bestätigter Stand

```text
LC-CORE-LIVE-1.1 – Loyalty nutzt twitch_events Stream-State als effektive Live-Wahrheit
```

## Vorheriger stabiler Kontext

```text
CAN44.42 – Shoutout / AutoShoutout / Twitch-Events / Live-Status live-real bestätigt
```

CAN44.42 bleibt die Basis für Twitch Events, Live-Status, StreamSession/StreamDay und AutoShoutout.

## Was in diesem Chat/Arbeitsblock passiert ist

### LC-CORE-LIVE-1

```text
Loyalty wurde initial an zentrale Stream-Status-/Bus-Strukturen angebunden.
Neue Binding-/Diagnoserouten wurden ergänzt.
Der alte lokale Loyalty-Manual-Blocker wurde entschärft.
```

Problem nach Test:

```text
Die erste Quelle war /api/stream-status/status?forceApi=1.
Diese Quelle ist source-only/Twitch-API-orientiert und bildet Dashboard Manual Override nicht ab.
```

### Analyse Live-Status-Monitor

Im Dashboard-Code wurde festgestellt:

```text
Die Anzeige ONLINE (Override) kommt aus /api/twitch/events/stream-state.
Der Live-Status-Monitor kombiniert state.status.decision mit state.streamState/manualOverride.
```

### LC-CORE-LIVE-1.1

```text
Loyalty wurde auf /api/twitch/events/stream-state korrigiert.
Parser berücksichtigt manualOverride.active, live, status, provider/source, streamSessionId und streamDayId.
```

## Bestätigte Tests

### Backend geladen

```text
/api/loyalty/stream-status-binding/sync lieferte url = http://127.0.0.1:8080/api/twitch/events/stream-state
```

### Online Override

```text
parsed.live = true
parsed.source = manual_override
parsed.manualOverrideActive = true
state.effective.live = true
runner.enabled = true
runner.timerActive = true
alreadyRunning = true
```

Interpretation:

```text
Override Online -> twitch_events Stream-State live -> Bus-Event startet Runner -> manueller Sync erkennt denselben Zustand -> kein doppelter Start
```

### Override löschen / Offline

```text
parsed.live = false
parsed.source = live_status_monitor
parsed.manualOverrideActive = false
state.effective.live = false
runner.enabled = false
runner.timerActive = false
```

Interpretation:

```text
Override weg/offline -> twitch_events Stream-State offline/ending -> Loyalty spiegelt offline -> Runner stoppt/bleibt aus
```

## Wichtige Arbeitsregel neu bestätigt

```text
StepDone-Reihenfolge:
1. ZIP/Dateien einspielen/deployen
2. stepdone.cmd ausführen
3. danach testen
4. nach erfolgreichem Test kein weiteres StepDone
```

## Nächster geplanter Schritt

```text
LC-CORE-CLEANUP-1 – alte Loyalty-StreamState-/Twitch-Direktlogik entfernen
```

## Ziel von LC-CORE-CLEANUP-1

```text
- nicht mehr benötigte alte direkte Twitch-Live-Abfrage wirklich entfernen
- nicht nur deaktivieren/deprecaten
- vorher echte Verwendungen im Code prüfen
- loyalty_stream_state vorerst als Runner-/Dashboard-Spiegel behalten
- keine Punkte-/Watch-/Event-Bonus-Logik ändern
```

## Vermutlich zu prüfende Altlasten

```text
refreshAutoStreamStateFromTwitch()
parseExternalLivePayload()
/api/loyalty/stream-state/refresh-auto
alte Loyalty-eigene stream-state/start/stop/clear-override Routen, falls nicht mehr gebraucht
```

## Harte Regeln für den nächsten Chat

```text
- Deutsch antworten.
- Erst echte Dateien aus GitHub/dev prüfen.
- Nicht raten.
- Keine Apply-/Patch-/Regex-Scripte.
- Keine PowerShell Set-Content-Fixes.
- Änderungen nur als vollständige Ersatzdateien mit echten Zielpfaden im ZIP.
- Keine Funktionalität entfernen, außer sie ist fachlich ersetzt, unbenutzt und explizit Teil des Cleanup-Ziels.
- Alte Logik, die nicht mehr benötigt wird, soll entfernt werden, nicht nur deaktiviert.
- Keine produktive SQLite ersetzen oder neu bauen.
- Vor Umsetzung Ziel/Dateien/Änderungen/Nichtänderungen/Tests nennen und auf go warten.
- StepDone nach Einspielen/Deploy, vor Test, danach nicht nochmal.
```

## Wichtige Testbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-status-binding/sync?controlRunner=true&sourceKind=stream_state" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 8
```
