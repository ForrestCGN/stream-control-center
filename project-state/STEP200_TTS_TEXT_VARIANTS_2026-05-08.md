# STEP200 - TTS Texte in DB-Textvarianten-System

Stand: 2026-05-08

## Ziel

TTS-Chat-/Systemtexte werden an das globale DB-basierte Textvarianten-System angeschlossen.

## Geänderte Dateien

- `backend/modules/tts_system.js`
- `htdocs/dashboard/modules/tts.js`

## Backend

Neu:

```text
GET  /api/tts/admin/texts
POST /api/tts/admin/texts
```

TTS nutzt nun `backend/modules/helpers/helper_texts.js`.

Textmodul:

```text
tts
```

DB-Tabelle:

```text
module_text_variants
```

Legacy/Fallback:

```text
config/tts_messages.json
```

Regel:

```text
DB-Textvarianten gewinnen, JSON bleibt Seed/Fallback.
```

## Dashboard

Neuer Tab im TTS-Modul:

```text
Texte
```

Funktionen:

- Kategorien anzeigen
- Text-Keys anzeigen
- Varianten hinzufügen
- Varianten bearbeiten
- Varianten aktiv/inaktiv schalten
- Gewichtung bearbeiten
- Varianten löschen

## Kategorien

- Chat-Antworten
- Rechte & Freigaben
- Mute/Ban Verwaltung
- Status & Listen
- Systemtexte
- Fehlertexte
- Debugtexte

## Bewusst nicht geändert

- keine TTS-Queue-Änderung
- keine Playback-Änderung
- keine Sound-System-Änderung
- keine Entfernung von `tts_messages.json`
- keine bestehenden Chattexte entfernt

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/admin/texts" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/routes" | ConvertTo-Json -Depth 20
```

Dashboard:

```text
/dashboard -> System -> TTS -> Texte
```

Prüfen:

1. Texte-Tab lädt.
2. Kategorien werden angezeigt.
3. Varianten sind sichtbar.
4. Neue Variante kann gespeichert werden.
5. Backend Reload lädt Texte neu.
6. `!tts help` oder Status nutzt DB-Text/Fallback sauber.

## Nächster sinnvoller Schritt

- Doku-Sync nach Live-Test.
- Optional CSS-Polish für TTS-Texte-Tab.
