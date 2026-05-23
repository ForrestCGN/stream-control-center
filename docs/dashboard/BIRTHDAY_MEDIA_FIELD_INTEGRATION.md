# STEP274V – Birthday MediaField Integration

Dieser Step bindet die zentrale MediaField-Komponente in das Birthday-Dashboard ein.

## Ziel

Das Birthday-Modul soll Upload/Auswahl nicht mehr separat neu erfinden, sondern die zentrale Media-Registry nutzen.

## Bereiche

- User-Song im Tab **Geburtstage**
- Party-Song im Tab **Partys**

Die bestehenden manuellen Textfelder bleiben erhalten. Das MediaField schreibt bei Auswahl/Upload den `relativePath` des Mediums in das vorhandene Feld.

## Warum relativePath statt mediaId?

Das aktuelle Birthday-Backend erwartet an diesen Stellen noch Dateipfade (`showSongFile`, `songFile`). Deshalb wird bewusst `asset.relativePath` gesetzt. Eine spätere Backend-Erweiterung auf direkte `mediaId`-Referenzen kann separat erfolgen.

## Sicherheit

- Keine DB-Migration
- Keine bestehenden Upload-Funktionen entfernt
- Alte Birthday-Upload-Buttons bleiben als Fallback vorhanden
- Patch-Script legt `.bak-step274v` Backups an

## Test

1. Dashboard hart neu laden
2. Birthday-System öffnen
3. Tab **Geburtstage** öffnen
4. User-Song per MediaField auswählen/hochladen
5. Prüfen, ob das Textfeld gefüllt wird
6. Speichern testen
7. Tab **Partys** öffnen
8. Party-Song per MediaField auswählen/hochladen
9. Prüfen, ob das Textfeld gefüllt wird
