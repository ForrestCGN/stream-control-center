# NEXT STEPS

Stand: EVS-5 / Stream Events Text Game Config Layout Cleanup  
Datum: 2026-06-13

## Sofort nach Übernahme

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-5 Stream Events Text Game Config Layout Cleanup"
```

Erst danach Dashboard im Live-System testen.

## Manuelle Prüfung

```text
Dashboard → Community → Event-System → Neues Event → Text-/Geheimsatz-Spiel aktivieren
```

Prüfen:

- Text-Spiel-Bereich ist sauber in Karten aufgeteilt.
- Geheimsatz ist als Pflicht sichtbar.
- Antworten & Hinweise sind als optional sichtbar.
- Hinweiswörter-Feld ist vorhanden.
- Punkte & Zeitfenster stehen in eigener Karte.
- Auf kleinerer Fensterbreite fallen die Karten untereinander.
- Speichern bleibt möglich.
- Validierung bleibt verständlich.

## Nächster fachlicher Schritt

EVS-6 sollte nicht sofort die komplette Live-Logik bauen, sondern zunächst die Datenpflege robuster machen:

```text
- mehrere Sound-Schnipsel pro Event verwalten
- mehrere Text-/Geheimsätze pro Event verwalten
- Hinzufügen/Bearbeiten/Entfernen je Spieltyp
- weiterhin Media-System für Medien
- weiterhin DB-Snapshot am Event
```

Danach erst:

```text
EVS-7 Sound-Rundensteuerung
EVS-8 Chat-Auswertung
EVS-9 Overlay/Playback-Anbindung
```
