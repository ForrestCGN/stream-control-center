# STEP199.1 - TTS Standard API direkt in tts_system.js

Stand: 2026-05-08

## Ziel

TTS bekommt die fehlenden Standard-/Dashboard-Routen direkt im bestehenden Modul `backend/modules/tts_system.js`, ohne eine neue Admin-Datei als Zielstand zu behalten.

## Geaenderte Datei

- `backend/modules/tts_system.js`

## Entfernte Zwischenloesung

- `backend/modules/tts_admin_api.js` wurde wieder geloescht.

Grund:

```text
Keine neue separate Admin-Datei, wenn die Routen sauber im bestehenden TTS-Modul integriert werden koennen.
```

## Neue Routen

```text
GET  /api/tts/config
GET  /api/tts/voices
GET  /api/tts/routes
GET  /api/tts/admin/settings
POST /api/tts/admin/settings
```

## Bewusst nicht geaendert

- bestehende TTS-Queue
- bestehende TTS-Playback-Logik
- bestehende Chat-Commands
- bestehende DB-Tabellen
- bestehende JSON-Dateien
- bestehende Sound-System-Anbindung

## Verhalten der neuen Routen

### `/api/tts/config`

Liefert die effektive TTS-Konfiguration fuer Status/Dashboard.

Regel:

```text
DB gewinnt gegen JSON-Fallback.
```

Die Route nutzt die bereits im Modul geladene effektive Config. Diese entsteht weiterhin aus:

1. `config/tts_config.json` als Seed/Fallback
2. `tts_settings` aus SQLite
3. DB-Werte werden ueber JSON-Werte gelegt

Nicht fuer das Dashboard geeignete technische Werte werden in der Antwort bereinigt:

- `system.key` wird entfernt und nur als `keyConfigured` gemeldet.
- Voice-Felder wie `key`, `apiKey`, `token`, `secret`, `credentials`, `password` werden entfernt und nur als `...Configured` gemeldet.
- `voices.*.keyFile` wird nicht als Pfad ausgegeben, sondern als `keyFileConfigured` und `keyFileExists`.

### `/api/tts/voices`

Liefert die konfigurierten Stimmen aus der effektiven Konfiguration, ebenfalls bereinigt.

Enthaelt:

- `defaultVoice`
- `fallbackVoice`
- `voices`
- Quelle/Fallback-Info

### `/api/tts/routes`

Liefert eine Selbstdiagnose der TTS-Routen direkt aus `tts_system.js`.

### `/api/tts/admin/settings`

Alias-/Dashboardroute fuer DB-Settings aus `tts_settings` ueber `helper_settings.js`.

### `POST /api/tts/admin/settings`

Schreibt ein einzelnes Setting in `tts_settings` ueber `helper_settings.js` und laedt danach die effektive Config neu.

Beispiel:

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
Sensible Zugangsdaten bleiben ausserhalb der Dashboard-Antworten.
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
- `/api/tts/config` gibt keine technischen Zugangswerte und keinen Google-Keyfile-Pfad aus.
- `/api/tts/voices` zeigt Stimmen ohne technische Zugangswerte.
- `/api/tts/admin/settings` zeigt DB-Settings aus `tts_settings`.
- Bestehende TTS-Routen funktionieren unveraendert.

## Naechster sinnvoller Schritt

`STEP199.2`:

- echte Live-Responses pruefen
- Dashboard-TTS-Modul planen/bauen
- Settings in sinnvolle UI-Bloecke aufteilen
- Sound-System-Ausgabe im Dashboard sichtbar/konfigurierbar machen
- TTS-Texte spaeter in das globale DB-basierte Textvarianten-System migrieren
