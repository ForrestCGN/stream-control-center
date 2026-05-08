# STEP199.1 - TTS Standard Admin/API

Stand: 2026-05-08

## Ziel

TTS bekommt die fehlenden Standard-/Dashboard-Routen, ohne die bestehende TTS-Ausgabe, Queue, Commands oder Audio-Erzeugung in `tts_system.js` zu veraendern.

## Geaenderte Datei

- `backend/modules/tts_admin_api.js`

## Neue Routen

```text
GET  /api/tts/config
GET  /api/tts/voices
GET  /api/tts/routes
GET  /api/tts/admin/settings
POST /api/tts/admin/settings
```

## Bewusst nicht geaendert

- `backend/modules/tts_system.js`
- bestehende TTS-Queue
- bestehende TTS-Playback-Logik
- bestehende Chat-Commands
- bestehende DB-Tabellen
- bestehende JSON-Dateien
- bestehende Sound-System-Anbindung

Grund: `tts_system.js` ist gross und wird in GitHub-Ausgaben gekuerzt. Fuer STEP199.1 wurde deshalb ein separates kleines Modul angelegt, damit keine bestehende Funktionalitaet riskant ueberschrieben wird.

## Verhalten der neuen Routen

### `/api/tts/config`

Liefert die effektive TTS-Konfiguration fuer Status/Dashboard.

Regel:

```text
DB gewinnt gegen JSON-Fallback.
```

Die Route liest:

1. `config/tts_config.json` als Fallback/Seed
2. `tts_settings` aus SQLite
3. merged DB-Werte ueber JSON-Werte

Sensible Werte werden nicht ausgegeben:

- `system.key` wird entfernt und nur als `keyConfigured` gemeldet.
- Voice-Secrets wie `key`, `apiKey`, `token`, `secret`, `credentials`, `password` werden entfernt.
- `voices.*.keyFile` wird nicht als Pfad ausgegeben, sondern als `keyFileConfigured` und `keyFileExists`.

### `/api/tts/voices`

Liefert die konfigurierten Stimmen aus der effektiven Konfiguration, ebenfalls sanitisiert.

Enthaelt:

- `defaultVoice`
- `fallbackVoice`
- `voices`
- Quelle/Fallback-Info

### `/api/tts/routes`

Liefert eine Selbstdiagnose der bekannten TTS-Routen.

Enthaelt:

- neue STEP199.1-Routen
- bekannte vorhandene TTS-Routen aus `tts_system.js`
- Hinweis, dass `tts_admin_api.js` nur Admin-/Status-Routen ergaenzt

### `/api/tts/admin/settings`

Liest `tts_settings` ueber `helper_settings.js`.

### `POST /api/tts/admin/settings`

Schreibt ein einzelnes Setting in `tts_settings` ueber `helper_settings.js`.

Akzeptiert u. a.:

```json
{
  "key": "enabled",
  "value": true,
  "valueType": "boolean",
  "description": "TTS insgesamt aktiv/inaktiv"
}
```

Bei JSON-Strings versucht die Route, gueltiges JSON zu parsen.

## Architekturregel

TTS bleibt technisch so aufgebaut:

```text
TTS erzeugt Audiodateien.
Sound-Ausgabe soll standardmaessig ueber das Sound-System laufen.
Overlay bleibt Visualisierung/Fallback.
Dashboard liest/schreibt nur ueber Backend-APIs.
DB ist aktive Wahrheit fuer dashboardfaehige Settings.
JSON bleibt Seed/Fallback/technische Boot-Konfig.
Secrets bleiben ENV/Secret-Dateien.
```

## Tests nach Deploy

Nach Pull/Deploy und Backend-Neustart pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/config" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/voices" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/routes" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/admin/settings" | ConvertTo-Json -Depth 30
```

Erwartung:

- Keine 404 mehr fuer `/api/tts/config`, `/api/tts/voices`, `/api/tts/routes`.
- `/api/tts/config` gibt keine Secretwerte und keinen Google-Keyfile-Pfad aus.
- `/api/tts/voices` zeigt Stimmen ohne Secretwerte.
- `/api/tts/admin/settings` zeigt DB-Settings aus `tts_settings`.
- Bestehende TTS-Routen funktionieren unveraendert.

## Naechster sinnvoller Schritt

`STEP199.2`:

- echte Live-Responses pruefen
- Dashboard-TTS-Modul planen/bauen
- Settings in sinnvolle UI-Bloecke aufteilen
- Sound-System-Ausgabe im Dashboard sichtbar/konfigurierbar machen
- TTS-Texte spaeter in das globale DB-basierte Textvarianten-System migrieren
