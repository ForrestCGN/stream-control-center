# Commands Dashboard v0.1.8 — Separated Action + Optional Chat Output

Dieser Stand korrigiert die Editor-Struktur nach dem Feedback aus dem UI-Test.

## UI-Version

- UI_VERSION: `0.1.8`
- UI_BUILD: `separated-action-chat-media-picker`
- Backend bleibt kompatibel mit Commands v0.1.4+ und der sicheren Edit-Logik per `id`/`originalTrigger`.

## Neue Struktur im Modal

Der Editor ist jetzt klarer getrennt:

1. Basis
2. Aktion
3. Optionale Chat-Ausgabe
4. Erweitert / technische Details

Die Chat-Ausgabe ist nicht mehr Teil des Aktionsblocks. Sie ist entweder die Hauptaktion `Text anzeigen` oder ein eigener optionaler Zusatzbereich.

## Neuer Command

Beim Erstellen stehen weiterhin die wichtigsten Aktionen oben:

1. Song abspielen
2. Video abspielen
3. Text anzeigen
4. Modul-Befehl ausführen
5. Benutzerdefinierte Aktion

Bei `Song abspielen` und `Video abspielen` erscheint direkt eine passende Medien-Maske mit Auswahl über den bestehenden MediaPicker.

## Bestehender Command

Beim Bearbeiten ist weiterhin der gespeicherte Zustand maßgeblich:

- Die gespeicherte Aktionsart steht an erster Stelle.
- Die passende Maske wird angezeigt.
- Die Aktionsart kann geändert werden.
- Technische Werte bleiben unter `Erweitert / technische Details`.

## Medien

Song/Video-Masken zeigen keine nackte technische Media-ID als normale Bedienung mehr. Stattdessen gibt es einen Auswahl-Button über den bestehenden MediaPicker. Die Media-ID bleibt intern gespeichert und wird beim Speichern weiter über die bestehende Sound-System-Brücke ausgeführt.

## Textausgabe

- `Text anzeigen` ist eine Hauptaktion.
- Zusätzlicher Chattext zu Song/Video/Modul ist ein eigener optionaler Bereich.
- Die zentrale Textverwaltung bleibt ein späteres eigenes System, nicht Teil der Medienverwaltung.
