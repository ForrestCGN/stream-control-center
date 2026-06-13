# NEXT STEPS

Stand: EVS-4b / Stream Events Sound Media Layout Cleanup  
Datum: 2026-06-13

## Sofort nach Übernahme

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-4b Stream Events Sound Media Layout Cleanup"
```

Erst danach Dashboard im Live-System testen.

## Manuelle Prüfung

```text
Dashboard → Community → Event-System → Neues Event → Sound-Spiel konfigurieren
```

Prüfen:

- Audio-Schnipsel steht in eigener Karte.
- Audio-Schnipsel ist als Pflicht sichtbar.
- Auflösungs-Video steht in eigener Karte.
- Video ist als optional sichtbar.
- Audio-Auswahl öffnet MediaPicker mit Audio.
- Video-Auswahl öffnet MediaPicker mit Video/Animation.
- Auf kleinerer Fensterbreite fallen die Karten untereinander.
- Speichern bleibt möglich.
- Validierung bleibt verständlich.

## Nächster fachlicher Schritt

EVS-5 sollte die Konfiguration robuster machen:

```text
- mehrere Sound-Schnipsel pro Event
- mehrere Text-/Geheimsätze pro Event
- Hinzufügen/Bearbeiten/Entfernen je Spieltyp
- weiterhin Media-System für Medien
- weiterhin DB-Snapshot am Event
```

Danach erst:

```text
EVS-6 Sound-Rundensteuerung
EVS-7 Chat-Auswertung
EVS-8 Overlay/Playback-Anbindung
```
