# NEXT STEPS

Stand: EVS-4 / Stream Events Media Picker Prep  
Datum: 2026-06-13

## Sofort nach Übernahme

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-4 Stream Events Media Picker Prep"
```

Erst danach Dashboard im Live-System testen.

## Manuelle Prüfung

```text
Dashboard → Community → Event-System → Neues Event
```

Prüfen:

- Sound/Text auswählbar.
- Sound-Schnipsel öffnet Media-Picker.
- Audio-Upload im Media-Picker möglich.
- Auswahl setzt Media-ID.
- Auflösungs-Video öffnet Picker mit Video/Animation.
- Speichern bleibt möglich.
- Validierung bleibt verständlich.

## Nächster fachlicher Schritt

EVS-5 sollte nicht direkt Playback oder Chat bauen, sondern zuerst die Konfiguration robuster machen:

```text
- mehrere Sound-Schnipsel pro Event
- mehrere Text-/Geheimsätze pro Event
- einfache Hinzufügen/Bearbeiten/Entfernen-Dialoge
- weiterhin Media-System für Medien
- weiterhin DB-Snapshot am Event
```

Danach erst:

```text
EVS-6 Sound-Rundensteuerung
EVS-7 Chat-Auswertung
EVS-8 Overlay/Playback-Anbindung
```
