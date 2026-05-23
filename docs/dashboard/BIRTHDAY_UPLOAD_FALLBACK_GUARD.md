# Birthday Upload Fallback Guard

Der zentrale Standard ist jetzt: Uploads und Medienauswahl laufen über `MediaField`/`MediaPicker`.

Die alten Birthday-spezifischen Upload-Buttons bleiben als Fallback erhalten, dürfen aber keine verwirrenden Fehler erzeugen. Deshalb sind sie deaktiviert, bis tatsächlich eine Datei gewählt wurde.

Gefährliche oder finale Aktionen bleiben weiterhin bewusst per Button:

- Speichern
- Löschen
- Upload starten
- Scan
- Reset
- Apply

Filter, Suche und Dropdowns sollen dagegen direkt reagieren.
