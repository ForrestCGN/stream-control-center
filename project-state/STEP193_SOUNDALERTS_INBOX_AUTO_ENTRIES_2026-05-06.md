# STEP193 - SoundAlerts Inbox / Auto Entries

Stand: 2026-05-06

## Ziel

Wenn ein echter SoundAlerts-Chat-Trigger erkannt wird, aber noch kein aktiver Mapping-Eintrag existiert, soll das Backend automatisch einen sichtbaren DB-Eintrag anlegen.

Damit erscheinen neue SoundAlerts direkt im Dashboard unter SoundAlerts / Eintraege und koennen dort geprueft, mit Datei versehen und aktiviert werden.

## Betroffene Datei

- `backend/modules/soundalerts_bridge.js`

## Version

- `soundalerts_bridge` von `0.1.5` auf `0.1.6`

## Geaendertes Verhalten

Wenn ein SoundAlerts-Event geparst wird und `findRule(...)` keinen aktiven Eintrag findet:

1. Es wird geprueft, ob bereits ein Eintrag mit gleichem SoundAlert-Namen existiert.
2. Wenn kein Eintrag existiert, wird automatisch ein DB-Eintrag in `soundalerts_bridge_entries` angelegt.
3. Wenn lokal eine passende Datei anhand des SoundAlert-Namens gefunden wird, wird der Eintrag mit Status `file_matched` angelegt.
4. Wenn keine Datei gefunden wird, wird der Eintrag mit Status `missing_file` angelegt.
5. Der Eintrag bleibt bewusst `enabled = false`, damit nichts ungeprueft automatisch abgespielt wird.
6. Das Event wird weiterhin als `unmatched` in `soundalerts_bridge_events` gespeichert, aber mit Auto-Entry-Meta-Daten.

## Datei-Auto-Matching

Das Backend prueft automatisch moegliche Dateinamen auf Basis des normalisierten SoundAlert-Namens:

- Video-Prefix aus `upload.videoRelativePrefix`, Standard `soundalerts/video`
- Audio-Prefix aus `upload.audioRelativePrefix`, Standard `soundalerts/audio`
- erlaubte Endungen aus den DB-/JSON-Settings

Beispiel:

```text
SoundAlert: "Mega Hupe"
Pruefung u.a.:
- soundalerts/video/mega_hupe.mp4
- soundalerts/video/mega_hupe.webm
- soundalerts/audio/mega_hupe.mp3
- soundalerts/audio/mega_hupe.wav
```

## Bewusstes Sicherheitsverhalten

Neue automatisch erkannte Eintraege werden nicht sofort aktiv geschaltet.

Grund:

- keine ungeprueften Sounds/Videos automatisch abspielen
- Dashboard soll erst Pruefung/Upload/Aktivierung erlauben
- bestehende SoundAlerts-Queue bleibt stabil

## Datenbank

Genutzte Tabellen bleiben:

- `soundalerts_bridge_entries`
- `soundalerts_bridge_events`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

Keine neue Tabelle in diesem STEP.

## MariaDB-Portability

Das Modul bleibt auf dem mit STEP192.2.1 eingefuehrten Pfad:

- DB-Zugriff ueber `backend/core/database.js`
- Settings ueber `helper_settings.js`
- SQLite bleibt aktuell aktiv
- MariaDB bleibt vorbereitet, aber echter Adapter ist noch nicht implementiert

Hinweis:

Einige SQL-Konstrukte sind weiterhin SQLite-nah und muessen spaeter beim echten MariaDB-Adapter zentral/dialektfaehig gekapselt werden. Dieser STEP verschlechtert die Portability nicht.

## Tests

Vor Lieferung lokal geprueft:

```powershell
node -c backend/modules/soundalerts_bridge.js
```

## Empfohlene Live-Tests

Nach Deploy:

```powershell
cd D:\Streaming\stramAssets
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
```

Unbekannten SoundAlert simulieren:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/test/chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"text":"ForrestCGN spielt Neuer Test Sound fuer 0 Bits!"}' | ConvertTo-Json -Depth 30
```

Danach:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/entries" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/events?limit=5" | ConvertTo-Json -Depth 30
```

Erwartung:

- neuer Eintrag fuer `Neuer Test Sound`
- `enabled = false`
- `status = missing_file` oder `file_matched`
- Event bleibt `unmatched`, enthaelt aber Auto-Entry-Meta-Daten
- bestehender `fahrstuhl_sound` bleibt unveraendert aktiv

## Bewusst offen

- Dashboard-UX fuer Auto-Entries kann spaeter verfeinert werden.
- Upload-aus-Eintrag heraus besteht bereits grundlegend, kann aber spaeter komfortabler werden.
- Optionaler Admin-Schalter fuer Auto-Entry-Verhalten kann spaeter ergaenzt werden.
- Zentrale Rollup-Dokus koennen nach erfolgreichem Live-Test synchronisiert werden.
