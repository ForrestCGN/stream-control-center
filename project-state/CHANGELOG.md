# CHANGELOG

## STEP215 / LWG-5.7 – 2026-06-11

### Dokumentation

- Live-Abschluss nach erfolgreichem STEP214-Test dokumentiert.
- `!punkte / !points` als aktiv bestätigter Node-Command festgehalten.
- Zentrale Chat-Ausgabe über `twitch_presence` als bestätigte Standardlösung dokumentiert.
- NEXT_STEPS/TODO/CURRENT_STATUS aktualisiert.

### Keine Runtime-Änderungen

```text
Keine JS-Dateien
Keine DB-Dateien
Keine Secrets
Keine neuen aktivierten Commands
```

## STEP214 / LWG-5.6

- Command Result Chat Send Bridge in `commands.js` integriert.
- `result.data.message` kann zentral über `twitch_presence.sendChatMessage(...)` in den Chat gesendet werden.
- `!punkte / !points` mit `sendResultToChat=true` konfiguriert.
- Live-Test erfolgreich bestätigt.
