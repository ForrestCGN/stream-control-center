# CHANGELOG

Stand: 2026-06-04

## CAN-44.19.4 – Dokumentation / Handoff

- Current Status aktualisiert.
- Next Steps aktualisiert.
- TODO aktualisiert.
- Dateien-Übersicht für Shoutout-System ergänzt.
- Übergabe-Datei für neuen Chat erstellt.
- Keine Code-Änderungen.
- Keine DB-Änderungen.
- Keine Runtime-Änderungen.

## CAN-44.19.3 – Shoutout Text Dropdown Polish

- Schreibweise `offiziellen Twitch-Shoutout` normalisiert.
- Kategorieanzeige im Editor als stabiler Badge/Pill.
- Entfernen-X bei nur einer Variante ausgeblendet.
- Entfernen letzter Variante zusätzlich im JS verhindert.
- kleine Alignment-/CSS-Feinschliffe.

## CAN-44.19.2 – Shoutout Text Dropdown Layout

- Kategorie-Auswahl als Dropdown.
- Text-Key-Auswahl als Dropdown.
- linkes Listenlayout entfernt.
- Editor darunter.
- Varianten als einzelne Textfelder.
- responsive-freundlicher Zwischenstand.

## CAN-44.19 – Shoutout Text Dashboard Tab

- gemeinsamer Texte-Tab im bestehenden Shoutout-System.
- `shoutout_texts.js` und `shoutout_texts.css`.
- `index.html` lädt neuen Dashboard-Baustein.
- nutzt zentrale Routen aus CAN-44.18.

## CAN-44.18 – Shoutout Text Backend Foundation

- `clip_shoutout.js` auf Version 0.2.25.
- zentrale Text-Routen:
  - `GET /api/clip-shoutout/texts`
  - `POST /api/clip-shoutout/texts`
  - `GET /api/clip-shoutout/texts/migration`
- neue `shoutout.*` Textkeys vorbereitet.
- alte Fallbacks bleiben erhalten.
