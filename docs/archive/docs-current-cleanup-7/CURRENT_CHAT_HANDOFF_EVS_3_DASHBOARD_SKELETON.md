# CURRENT CHAT HANDOFF – EVS-3 Dashboard Skeleton

Stand: 2026-06-13
Projekt: ForrestCGN / stream-control-center

## Ausgangspunkt

EVS-2 wurde im Live-System getestet:

- `/api/stream-events/status` liefert `ok=True`
- `moduleVersion=0.1.0`
- `moduleBuild=STEP_EVS_2_BACKEND_FOUNDATION`
- `routeCount=13`
- `diagnostics.schemaReady=True`
- `diagnostics.health=ok`

Forrest hat danach `go` fuer EVS-3 gegeben und darauf hingewiesen:

> StepDone vor Test, sonst nicht im Live-System.

Daher gilt fuer EVS-3: Erst ZIP entpacken, dann `stepdone.cmd`, dann erst Dashboard/Live testen.

## EVS-3 Ziel

Erste Dashboard-Sicht fuer Stream Events:

- Event-System im Community-Bereich sichtbar machen
- Events listen
- Event erstellen
- Sound und/oder Text auswaehlen
- einfache Konfiguration fuer Sound/Text speichern
- Validierungsstatus anzeigen
- Start/Finish/Cancel mit Bestaetigung vorbereiten

## Geaenderte Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
docs/modules/stream_events.md
docs/current/CURRENT_CHAT_HANDOFF_EVS_3_DASHBOARD_SKELETON.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Wichtig: bestehende Struktur genutzt

EVS-3 nutzt:

- bestehendes Dashboard-Modulmuster
- bestehende `window.CGN.api(...)` API-Helfer
- bestehende SectionHome-/Community-Kachelstruktur
- vorhandene EVS-2 Backend-Routen

Keine neue Dashboard-Shell, keine parallele Navigation.

## Nicht geaendert

- kein Backend-Code in EVS-3
- keine Datenbank-Migration
- keine Twitch-Chat-Auswertung
- kein Sound-System-Umbau
- kein Media-System-Umbau
- kein Overlay
- keine bestehende Funktionalitaet entfernt

## Uebernahme-Reihenfolge

Nach Entpacken nach `D:\Git\stream-control-center`:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Dann vor Live-/Dashboard-Test:

```powershell
.\stepdone.cmd "EVS-3 Stream Events Dashboard Skeleton"
```

Erst danach Live-System aktualisieren/oeffnen und testen.

## Test nach StepDone

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Browser:

```text
Dashboard -> Community -> Event-System
```

Fachtest:

1. Neues Event erstellen
2. Sound aktivieren
3. Sound-Konfiguration ausfuellen
4. Speichern
5. Validierung pruefen
6. Event bei Status startbereit starten
7. Event beenden

## Naechster sinnvoller Schritt

EVS-4 sollte nicht direkt Gameplay komplett bauen. Sinnvoller kleiner Schritt:

- Sound-Spiel Backend-Konfiguration sauber erweitern
- Snippet-Rotation vorbereiten
- erkannt/nicht erkannt Status pro Event-Snippet speichern
- Requeue/Remove-Regeln umsetzen
- noch kein automatisches Playback

