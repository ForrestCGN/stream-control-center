# STEP274X – Birthday MediaPicker Categories

Status: Patch-Step zur Kategorie-Übergabe der Birthday-MediaPicker-Buttons.

## Ziel

Die Buttons im Birthday Show/Medien-Bereich öffnen weiterhin das zentrale MediaPicker-Fenster, übergeben nun aber eine fachlich passende Zusatzkategorie.

## Umsetzung

- Intro-Video → `birthday/intro`
- Standardsong → `birthday/default-song`
- User-Song → `birthday/user-songs`

Zusätzlich initialisiert der MediaPicker seinen Kategorie-Filter aus `config.categoryKey`, damit die Auswahl/Upload-Ansicht direkt passend startet.

## Hinweise

- Bestehende Funktionalität bleibt erhalten.
- Alte Upload-Fallbacks bleiben vorhanden.
- Backend-Neustart nötig, damit neue Default-Kategorien registriert werden.
