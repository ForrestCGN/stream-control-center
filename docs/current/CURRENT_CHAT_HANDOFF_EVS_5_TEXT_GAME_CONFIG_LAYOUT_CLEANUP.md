# CURRENT CHAT HANDOFF – EVS-5 Text Game Config Layout Cleanup

Datum: 2026-06-13  
Projekt: ForrestCGN / stream-control-center  
Stand: EVS-5

## Ziel dieses Steps

Der Text-/Geheimsatz-Spielbereich im Event-Erstellen/Bearbeiten-Modal soll genauso verständlich und streamerfreundlich wirken wie der bereits aufgeräumte Sound-Bereich.

## Umgesetzt

Geändert wurden nur Dashboard-Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Der Bereich `Text-Spiel konfigurieren` ist nun in Karten aufgeteilt:

```text
Geheimsatz – Pflicht
Antworten & Hinweise – Optional
Punkte & Zeitfenster
```

Details:

- Geheimsatz klar als Pflicht markiert.
- Erlaubte Antworten klar als optionaler Bereich.
- Hinweiswörter/Suchwörter-Feld vorbereitet.
- Punkte erster Löser bleibt erhalten.
- `Weitere Löser Zeitfenster` wurde verständlicher als `Zeitfenster für weitere Löser` formuliert.
- Responsive Layout: auf kleineren Breiten werden die Karten untereinander angezeigt.

## Nicht geändert

```text
Backend
Datenbank
Media-System
Sound-System
Twitch-Chat-Auswertung
Sound-/Video-Playback
Overlay
```

## Wichtiger Nutzerhinweis

Forrest hat ausdrücklich darauf hingewiesen:

```text
stepdone vor Test, sonst nicht im Live-System
```

Daher nach Entpacken zuerst:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-5 Stream Events Text Game Config Layout Cleanup"
```

Erst danach im Dashboard/Live-System testen.

## Nächster sinnvoller Schritt

Nicht sofort Chat-Auswertung oder Playback bauen. Erst die Datenpflege robuster machen:

```text
EVS-6 – Multiple Items Foundation
- mehrere Sound-Schnipsel pro Event
- mehrere Text-/Geheimsätze pro Event
- Hinzufügen/Bearbeiten/Entfernen im Dashboard
- weiterhin Media-System für Upload/Auswahl
- weiterhin Event-Snapshot/DB-Speicherung
```

Danach:

```text
EVS-7 Sound-Rundensteuerung
EVS-8 Chat-Auswertung
EVS-9 Overlay/Playback-Anbindung
```
