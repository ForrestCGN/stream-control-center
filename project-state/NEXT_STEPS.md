# NEXT_STEPS

Stand: 2026-05-30

## Sofort erledigt / aktueller Abschluss

Der Project-State-/Dokumentations-Cleanup ist abgeschlossen.

```text
STEP553–STEP588 Project-State / Dokumentations-Cleanup
STEP589 GENERAL_PROJECT_PROMPT aktualisiert
STEP590 zentrale Statusdateien aktualisiert
```

Sauber verifiziert:

```text
Unexpected STEP/NEXT_STEPS_STEP root files: 0
Archive groups checked: 6
Archive groups OK: 6
Warnings: 0
Errors: 0
```

## Nächster empfohlener STEP

```text
STEP591 – Routes and Module Docs Verification Scan
```

Ziel:

```text
- echte Backend-Routen aus den Modulen erfassen
- Dashboard-/Overlay-/Streamer.bot-relevante APIs markieren
- vorhandene docs/modules/*.md gegen echte Routen prüfen
- fehlende oder veraltete Routen-Doku melden
- kompakte Reports erzeugen, damit Forrest nur COPY_THIS_RESULT kopieren muss
```

Wichtig:
Routen nicht aus Erinnerung dokumentieren. Echte Dateien prüfen.

## Danach offen

Nach STEP591 je nach Ergebnis:

```text
STEP592 – Routes Documentation Consolidation
```

Mögliche Ziel-Dateien:

```text
docs/backend/ROUTES.md
docs/modules/<betroffene-module>.md
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

## Weiterhin offene Tests aus STEP527

Channelpoints nach Deploy/Backend-Neustart prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/_status"
$s.modules | Select-Object name,loaded,version,lastError | Format-Table -AutoSize
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Live-/Funktionsprüfung:

```text
- neuen Reward anlegen
- bestätigen: Twitch Reward wird erstellt, aber inaktiv
- Twitch Aktiv/Inaktiv-Schalter in Übersicht testen
- bestehenden aktiven Reward bearbeiten und prüfen: Aktivstatus bleibt erhalten
- bestehenden inaktiven Reward bearbeiten und prüfen: bleibt inaktiv
```

## Sound / Media offen

```text
- /api/sound/status prüfen: defaults.outputTarget=device
- Media-Dateinamen-Fix nur mit Real-STEP524 verwenden
- alte Mojibake-Dateinamen nur gezielt reparieren, nicht pauschal löschen/verschieben
```

## Späterer Block: Overlay Health / Refresh Control

Noch nicht umgesetzt.

Vor Umsetzung echte aktuelle Dateien prüfen:

```text
backend/modules/obs.js
backend/modules/scene_control.js
backend/modules/overlay_data.js
backend/modules/sound_system.js
htdocs/ws-client.js
htdocs/overlays/*.html
Dashboard Control-Center Modulstruktur
```

Ziel bleibt:

```text
- Overlay-Heartbeat per WebSocket/Event an Backend
- Dashboard-Anzeige pro Overlay: online/offline/letzter Kontakt
- Refresh einzelner Overlays
- Refresh vordefinierter Gruppen, z. B. all, sound, alerts, chat
- OBS-Browserquelle über bestehende OBS-Verbindung neu laden
- optional Quelle kurz aus/an als härtere Reparatur
- optional GET-Endpunkte für Streamer.bot
```

Keine Parallelstruktur bauen. Bestehende OBS-/WebSocket-/Dashboard-Systeme wiederverwenden.

<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_START -->
## Nach STEP612 - naechste sinnvolle Arbeiten

Stand: 2026-05-30

Die Route-/Modul-Doku-Batch-Reihe ist abgeschlossen.

Empfohlene naechste Schritte:

1. Einen frischen SystemScan laufen lassen, um den neuen Dokumentationsstand zu validieren.
2. Danach gezielt die naechste offene Projektlinie waehlen, z. B. Modul-Doku-Detailpflege, Dashboard-/Admin-Konfiguration oder konkrete Feature-Arbeit.
3. Bei weiterem Doku-Cleanup wieder mit Scan -> Triage -> Plan -> Dryrun -> Apply -> Verification arbeiten.
4. Keine produktive Route oder Funktionalitaet aus Doku-Scan-Treffern ableiten, ohne echten Code-Kontext zu pruefen.
<!-- STEP612_ROUTE_MODULE_DOCS_COMPLETION_STATUS_END -->

<!-- STEP615_CLEANUP_FREEZE_START -->
## Nach STEP615 - Fokus wieder auf produktive Arbeit

Stand: 2026-05-30

Cleanup ist eingefroren. Empfohlene naechste Schritte sind produktive Projektlinien:

1. Channelpoints / Rewards / Dashboard weiter stabilisieren.
2. Sound-System / Routing gezielt testen.
3. Dashboard Admin-/Config-Bereiche weiter ausbauen.
4. Alert-System oder Shoutout/Clip-System gezielt fortsetzen.
5. Neues Feature mit echtem Bedarf starten.

Keine weiteren Mini-Cleanup-Steps, solange kein konkretes Problem vorliegt.
<!-- STEP615_CLEANUP_FREEZE_END -->

