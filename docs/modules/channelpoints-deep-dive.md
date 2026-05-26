# Kanalpunkte-System — Deep Dive

Stand: UI v0.7.1 (`preserve-modal-draft-state`), Backend v0.7.0 (`safe-modal-editor`).

## Ziel

Das Kanalpunkte-Dashboard folgt dem Commands-Pattern: Suche, Kategorien, direkte Auswahl, Modal-Editor, sichere Bearbeitung und lokale Löschung mit Rückfrage.

## v0.7.1

v0.7.1 ist ein Dashboard-Sicherheitsfix für den Modal-Entwurf.

- Formularfelder im offenen Modal werden fortlaufend im Draft-State gehalten.
- Reward-Key, Titel, Prompt, Kosten, Kategorie, Regeln und Notizen bleiben erhalten, wenn MediaPicker oder UI-Refreshes ausgelöst werden.
- Sound-/Video-Auswahl schreibt nur die Medien-/Payload-Daten und setzt keine Basisdaten zurück.
- Aktionswechsel speichert den aktuellen Entwurf vor dem Re-Render.
- MediaField-Initialisierung synchronisiert den Entwurf nach kurzer Verzögerung erneut.

## Wichtige Regeln

- Keine Funktionalität entfernen.
- Produktive SQLite-Datenbank nie ersetzen.
- Medien laufen über das bestehende Media-/Sound-System.
- Normale Nutzer sehen technische Felder nur unter „Erweitert“.
- Twitch-Schreibzugriffe sind weiterhin nicht aktiv.
