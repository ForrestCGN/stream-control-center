# NEXT_STEPS

## Direkt nach STEP273C testen

1. Dashboard öffnen: `http://127.0.0.1:8080/dashboard`
2. Community → Commands öffnen.
3. Command bearbeiten.
4. Action-Typ-Dropdown prüfen.
5. Erweitert-Bereich öffnen und bestehende Deathcounter-Routerdaten prüfen.
6. Bestehenden `!dcount show` nicht kaputt machen.

## Danach

### STEP274A – Zentrale Medienverwaltung Core

- DB-Tabelle `media_assets`
- Medien scanbar machen
- Upload-Routen vorbereiten
- Audio/Video/Bild/Animation unterscheiden
- bestehende Assets registrieren, nicht verschieben

### STEP274B – Medienverwaltung Dashboard

- System → Medien
- Audio, Video, Bilder, Animationen
- Upload, Vorschau, Löschen, Umbenennen
- Icons statt Textbuttons, wo sinnvoll

### STEP274C – Commands an Medien anbinden

- Sound-/Video-Action wählt Medium aus zentraler Medienverwaltung
- Vorschau im Dashboard
- echte Ausführung über Sound-System/Overlay
