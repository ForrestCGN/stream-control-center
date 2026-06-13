# CURRENT STATUS

Stand: EVS-5 / Stream Events Text Game Config Layout Cleanup  
Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center

## Zweck dieses Stands

EVS-5 verbessert nur die Dashboard-Anordnung der Text-/Geheimsatz-Spiel-Konfiguration im Event-Erstellen/Bearbeiten-Dialog.

## Bestätigte Grundlage

- EVS-2 Backendstatus wurde vom Nutzer erfolgreich getestet.
- EVS-3 Dashboard Skeleton wurde übernommen.
- EVS-4 MediaPicker-Prep wurde im Dashboard sichtbar getestet.
- EVS-4b Sound-/Video-Karten wurden im Dashboard sichtbar getestet und als Richtung bestätigt.
- Nutzerhinweis bleibt verbindlich: `stepdone.cmd` vor Live-/Dashboard-Test.

## EVS-5 Änderung

Im Bereich `Text-Spiel konfigurieren` wurde das Formular in klare Karten aufgeteilt:

```text
Geheimsatz – Pflicht
Antworten & Hinweise – Optional
Punkte & Zeitfenster
```

Neu/verbessert:

- Geheimsatz ist als Pflicht sichtbar.
- Antwortvarianten sind als optional sichtbar.
- Hinweiswörter/Suchwörter sind vorbereitet.
- Feldtext `Weitere Löser Zeitfenster` wurde verständlicher als `Zeitfenster für weitere Löser` formuliert.
- Layout bleibt responsive: Desktop nebeneinander, kleinere Breite untereinander.

## Nicht geändert

```text
Backend
Datenbank
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
Media-System
Sound-Konfig-Logik
```

## Testregel

Vor Live-/Dashboard-Test:

```powershell
.\stepdone.cmd "EVS-5 Stream Events Text Game Config Layout Cleanup"
```
