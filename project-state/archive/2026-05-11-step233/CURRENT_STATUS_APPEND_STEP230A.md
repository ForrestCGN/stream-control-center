# CURRENT_STATUS Ergänzung – STEP230A

Stand: 2026-05-11

## STEP230A - Message-Rotator DB-Text-Runtime

- Message-Rotator Runtime-Ausgaben nutzen jetzt zuerst `module_text_variants` mit `module_name = message_rotator`.
- Automatische Rotator-Ausgabe und manuelle Rotator-Ausgabe laufen ueber `buildRotatorChatResult(...)`.
- `config/messages/*.json` bleibt Fallback, falls DB-/Textvarianten nicht verfuegbar sind.
- `integration-check` rendert Samples ueber dieselbe Runtime-Funktion.
- Keine Dashboard-Dateien geaendert.

Naechster Schritt: STEP230B Dashboard-Modul Message-Rotator.
