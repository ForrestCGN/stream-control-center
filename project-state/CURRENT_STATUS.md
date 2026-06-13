# CURRENT STATUS

Stand: EVS-4b / Stream Events Sound Media Layout Cleanup  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

EVS-4b verbessert nur die Dashboard-Anordnung der Sound-Spiel-Konfiguration. Die Medienauswahl bleibt vollständig über das vorhandene Media-System gelöst.

## Bestätigte Grundlage

- EVS-2 Backendstatus wurde vom Nutzer erfolgreich getestet.
- EVS-3 Dashboard Skeleton wurde übernommen.
- EVS-4 MediaPicker-Prep wurde im Dashboard sichtbar getestet.
- Nutzerhinweis: StepDone vor Live-/Dashboard-Test beachten.

## EVS-4b Änderung

Im Event-Erstellen/Bearbeiten-Dialog wurde der Bereich `Sound-Spiel konfigurieren` neu angeordnet:

```text
Audio-Schnipsel – Pflicht
Auflösungs-Video – Optional
```

Desktop:

```text
Audio-Karte | Video-Karte
```

Kleinere Auflösungen:

```text
Audio-Karte
Video-Karte
```

## Nicht geändert

```text
Backend
Datenbank
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
Media-System selbst
```

## Testregel

Vor Live-/Dashboard-Test:

```powershell
.\stepdone.cmd "EVS-4b Stream Events Sound Media Layout Cleanup"
```
