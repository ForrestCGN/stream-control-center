# STEP_BIRTHDAY_006E – Command Fallback Cleanup

## Ziel
Birthday-Chatbefehle laufen wieder ausschließlich über das zentrale Command-System.

## Änderungen
- Der zusätzliche Birthday-Chat-Fallback aus STEP_BIRTHDAY_006C wurde deaktiviert/aus dem Chat-Hook entfernt.
- Der Chat-Hook bleibt nur für passive Chat-Aktivität aktiv, damit automatische kleine Geburtstagsgrüße weiterhin funktionieren.
- Chat-Ausgaben laufen weiter über helper_chat_output.
- Textauswahl läuft weiter über helper_texts / DB-Textvarianten.
- Keine Änderung an Sound-System, Queue, Overlay-Layout oder Party-Presets.

## Betroffene Dateien
- backend/modules/birthday.js

## Tests
- node --check backend/modules/birthday.js
- /api/birthday/status erwartet step STEP_BIRTHDAY_006E
