# STEP230A - Message-Rotator DB-Text-Runtime

Stand: 2026-05-11

## Ziel

Der Message-Rotator nutzt fuer seine echte Runtime-Ausgabe jetzt zuerst die DB-basierten Textvarianten des zentralen Textsystems.

## Geaendert

```text
backend/modules/message_rotator.js
```

## Fachliche Aenderung

- Automatische Rotator-Ausgaben (`next`) und manuelle Rotator-Ausgaben (`manual`) bauen ihre Chattexte jetzt ueber `module_text_variants` mit `module_name = message_rotator`.
- Die Admin-Textvarianten aus `/api/message-rotator/admin/texts` sind damit die Texte, die auch fuer Rotator-Ausgaben genutzt werden.
- `config/messages/*.json` bleibt als Fallback erhalten, falls die DB-Textausgabe nicht verfuegbar ist.
- `integration-check` nutzt fuer Sample-Renders ebenfalls die neue Runtime-Textfunktion.

## Bewusst nicht geaendert

- Keine Dashboard-Dateien.
- Keine Rotator-Items, Commands, Cooldowns oder Gewichte.
- Keine bestehenden Legacy-/API-Routen entfernt.
- Keine Datenbank ersetzt oder neu gebaut.
- Keine Secrets, keine `.env`, keine SQLite-Datei.

## Neue interne Runtime-Funktion

```text
buildRotatorChatResult(messageKey, context, options)
```

Reihenfolge:

1. DB-Textvariante ueber `textHelper.renderModuleText("message_rotator", ...)`.
2. Fallback auf alte `textHelper.buildChatResult(...)`-Logik aus `config/messages/*.json`.

## Tests

```powershell
node --check backend\modules\message_rotator.js

Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/admin/texts" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/message-rotator/integration-check" | ConvertTo-Json -Depth 80
```

Erwartung:

- `integration-check.healthy = true`
- Samples enthalten `source = database_variants_with_json_fallback`, solange die DB erreichbar ist.
- Bei DB-/Textfehlern bleibt `source = config_messages_fallback` als Rueckfall erhalten.
