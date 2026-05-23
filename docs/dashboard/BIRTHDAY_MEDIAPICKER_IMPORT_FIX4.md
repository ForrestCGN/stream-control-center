# Birthday MediaPicker Import – FIX4

Der MediaPicker wählt Medien aus der zentralen Media-Registry. Für das aktuelle Birthday-Playback werden diese Medien kontrolliert nach `assets/sounds/birthday/` kopiert und anschließend die bestehenden Birthday-Referenzen aktualisiert.

## Test

1. Birthday-System → Show/Medien öffnen.
2. Bei `User für eigenen Song` einen Login eintragen, z. B. `urlug`.
3. `User-Song auswählen` klicken.
4. Audio im MediaPicker auswählen.
5. Es darf kein `Cannot POST /api/birthday/admin/show/import-media` erscheinen.
6. Unter `Geburtstage` sollte beim User der Show-Song sichtbar sein.
7. Unter `Partys` → `User-Zuordnungen & Songs` sollte der User mit Song auftauchen.
