# HT3.7 – HypeTrain Media-Picker/Upload-Integration

## Ziel

Der Event-Actions-Tab nutzt das vorhandene zentrale Media-System direkt aus dem HypeTrain-Modul heraus. Forrest muss nicht manuell Media-IDs suchen und auch keine separate Upload-Insel im HypeTrain-Modul benutzen.

## Änderung

- Sound-Auswahl pro Event-Action läuft über `MediaField` / `MediaPicker`.
- Der Button ist als „Sound auswählen / hochladen“ formuliert.
- Upload/Picker nutzt `moduleKey=hypetrain` und pro Aktion eine Kategorie (`start`, `levelUp`, `end`, `record`).
- Die gewählte Media-ID wird automatisch in die HypeTrain-Config übernommen.
- Das manuelle Media-ID-Feld ist nicht mehr die Hauptbedienung.

## Nicht geändert

- Kein Backend-Umbau.
- Keine DB-Migration.
- Kein neues Dashboard-Modul.
- Keine separaten `hypetrain_event_actions.*` Dateien.
- Keine produktiven Sounds werden automatisch aktiviert.
