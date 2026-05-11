# STEP190 - SoundAlerts Dashboard

Stand: 2026-05-06

## Ziel

SoundAlerts-Bridge im Dashboard sichtbar und bedienbar machen, ohne direkte DB-/Dateizugriffe im Frontend.

## Basis

Vorherige abgeschlossene Steps:

- STEP188: Sound-System kann Video-Dateien ueber das vorhandene Sound-Overlay abspielen und wartet auf Overlay-Ende.
- STEP189: SoundAlerts-Bridge erkennt Chatmeldungen, mappt SoundAlert-Namen auf lokale Medien und schreibt Events/Statistiken in SQLite.
- STEP189.1: Parser-Hotfix fuer deutsche SoundAlerts-Meldungen ohne Anfuehrungszeichen.

## Geaenderte Dateien

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `project-state/STEP190_SOUNDALERTS_DASHBOARD_2026-05-06.md`

## Dashboard-Integration

Neues Dashboard-Modul:

- Modul-ID: `soundalerts`
- Titel: `SoundAlerts Bridge`
- Bereich: `System`
- Anzeige im System-Bereich direkt nach `Sound-System`
- Overlay-Link: `/overlays/sound_system_overlay.html?debug=1`

Die Registrierung passiert in `soundalerts.js`, damit `app.js` nicht umgebaut werden muss.

## Funktionen im Dashboard

Tabs:

- `Uebersicht`
- `Bot & Settings`
- `Mappings`
- `Events`
- `Statistik`

Funktionen:

- Status anzeigen
- WebSocket-Verbindung anzeigen
- DB-Eventzaehler anzeigen
- Bot-Login/User-ID/DisplayName bearbeiten
- Bridge aktiv/inaktiv setzen
- Default-Kategorie/Prioritaet/Lautstaerke bearbeiten
- Audio-/Video-Ausgabeziel bearbeiten
- Dedupe konfigurieren
- Chatmeldung bei fehlender Datei konfigurieren
- Mappings anzeigen, bearbeiten, hinzufuegen und entfernen
- Letzte Events anzeigen
- Statistik nach Sound, User und Status anzeigen
- Testbutton fuer bekanntes Mapping
- Testbutton fuer unbekannten SoundAlert

## Backend-APIs

Das Dashboard nutzt nur vorhandene Bridge-APIs:

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/events?limit=25`
- `GET /api/soundalerts/stats`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`
- `POST /api/soundalerts/reload`
- `POST /api/soundalerts/test/chat`

Kein direkter Zugriff auf SQLite oder JSON-Dateien im Dashboard.

## Bewusst offen

- Userinfo-Pruefbutton fuer den SoundAlerts-Bot ist noch nicht umgesetzt.
- Upload-/Dateiauswahl fuer SoundAlerts-Medien ist noch nicht umgesetzt.
- Fehlende Dateien werden aktuell nur ueber Backend/Eventstatus sichtbar, nicht vor dem Speichern live validiert.
- Eine eigene Navigationsrubrik fuer externe Integrationen ist noch nicht umgesetzt; Modul liegt vorerst im System-Bereich.
- Dashboard-Rechte/Audit-Logging fuer Config-Aenderungen spaeter zentral loesen.

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/events?limit=10" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/stats" | ConvertTo-Json -Depth 30
```

Dashboard pruefen:

```text
http://127.0.0.1:8080/dashboard
System -> SoundAlerts Bridge
```

Test im Dashboard:

- `Test Fahrstuhl` sollte das Mapping `Fahrstuhl Sound` ausloesen.
- `Test Unbekannt` sollte einen `unmatched` Event schreiben und nichts abspielen.

## Rollback

Falls noetig, nur diese Dateien aus Git zuruecksetzen:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
