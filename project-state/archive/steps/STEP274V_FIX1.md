# STEP274V FIX1 – Birthday Legacy Upload Guard

## Ziel

Der Birthday-Tab **Show/Medien** zeigte noch die alten Legacy-Upload-Buttons. Wenn ein Upload-Button ohne gewählte Datei geklickt wurde, erschien eine rote Fehlermeldung: `Bitte zuerst eine Datei auswählen.`

## Änderung

- Legacy-Upload-Buttons werden deaktiviert, bis eine Datei ausgewählt wurde.
- Ein leerer Legacy-Upload-Klick erzeugt keine rote Fehlerbox mehr.
- Im Show/Medien-Uploadbereich erscheint zusätzlich ein zentrales MediaField für Birthday-Medien.
- Alte Upload-Funktion bleibt erhalten.
- Keine Backend-/DB-Änderung.

## Test

1. Dashboard hart neu laden.
2. Birthday → Show/Medien öffnen.
3. Ohne Datei dürfen Legacy-Upload-Buttons deaktiviert sein.
4. Zentrales Birthday-MediaField öffnen und Upload/Auswahl testen.
5. Datei wählen → Legacy-Upload-Button wird aktiv.
