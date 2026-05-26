# Commands Dashboard v0.1.7 — Action-Type Driven Editor

Dieser Stand korrigiert die Bedienlogik des Command-Editors.

## UI-Version

- UI_VERSION: `0.1.7`
- UI_BUILD: `action-type-driven-editor`
- Backend bleibt kompatibel mit Commands v0.1.4+ und der sicheren Edit-Logik per `id`/`originalTrigger`.

## Bedienlogik

### Neuer Command

Beim Erstellen steht im Feld **Was soll passieren?** zuerst die normale Streamer-Auswahl:

1. Song abspielen
2. Video abspielen
3. Text anzeigen
4. Modul-Befehl ausführen
5. Benutzerdefinierte Aktion

Der Editor zeigt direkt die passende Maske zur gewählten Aktionsart.

### Bestehender Command

Beim Bearbeiten ist immer der gespeicherte Zustand maßgeblich:

- Das Dropdown zeigt an erster Stelle die aktuell gespeicherte Aktion.
- Die Maske darunter richtet sich nach der gespeicherten Aktionsart.
- Audio-, Video-, Text- und Modul-Aktionen können weiterhin auf eine andere Aktionsart umgestellt werden.
- Gespeicherte Modul-/Action-/Route-Werte stehen nicht mehr als Sonderkasten in der normalen UI, sondern unter **Erweitert / technische Details**.

### Modul-Katalog

Der Katalog ist nur eine Vorlage. Eine Auswahl aus dem Katalog schreibt erst dann in das Formular, wenn **Ausgewählte Aktion übernehmen** geklickt wird.

## Textausgabe

Textausgabe ist vorbereitet:

- keine Textausgabe
- Einzeltext
- Text-Key/Textgruppe
- Auswahl: zufällig, erste Variante, der Reihe nach

Die zentrale Textverwaltung bleibt ein eigenes geplantes System und wird nicht in die Medienverwaltung gemischt.
