# Current System Status — Commands

Commands Dashboard UI steht auf `0.1.8` (`separated-action-chat-media-picker`).

Der Command-Editor nutzt nun eine getrennte Struktur:

- Basis
- Aktion
- Optionale Chat-Ausgabe
- Erweitert / technische Details

Wichtig:

- Chat-Ausgabe hängt nicht mehr im Aktionsblock.
- Song/Video zeigen eine eigene Medien-Maske.
- Medienauswahl nutzt den bestehenden MediaPicker.
- Text anzeigen ist eine eigene Hauptaktion.
- Zusätzlicher Chattext ist nur ein optionaler Zusatzbereich.
- Technische Werte bleiben unter Erweitert.
