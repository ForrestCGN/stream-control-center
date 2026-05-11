# STEP193.5 - SoundAlerts Upload UX / Ignore / Delete Doku-Sync

Stand: 2026-05-06

## Zweck

Dieser STEP dokumentiert den live getesteten SoundAlerts-Stand nach STEP193.2 bis STEP193.4.

Keine Codeaenderung in diesem STEP.

## Live bestaetigter Stand

- `soundalerts_bridge` Version `0.1.9`
- WebSocket verbunden
- DB ok
- Settings aus `soundalerts_bridge_settings`
- Entries aus `soundalerts_bridge_entries`
- Events aus `soundalerts_bridge_events`
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback

## Upload-Stand

Video-Upload-Limit ist live in DB gesetzt:

```text
upload.maxVideoSizeBytes = 1073741824
```

Das entspricht 1 GB.

Dashboard/Upload-Fixes:

- Upload zeigt Status/Fortschritt.
- Upload-Button wird waehrend Upload deaktiviert.
- Upload-Erfolg/Fehler wird sichtbar angezeigt.
- `file_too_large` gibt lesbare Werte zurueck.
- Max. Audio-Uploadgroesse und Max. Video-Uploadgroesse sind dashboardfaehig ueber Settings.

## Auto-Entry / Ignore / Delete

Getestete Auto-Entry-Logik:

- Unbekannte SoundAlerts erzeugen automatisch einen inaktiven DB-Eintrag.
- Neue Auto-Eintraege starten z. B. mit:
  - `enabled = false`
  - `status = missing_file`
  - `category = channel_reward`
  - `outputTarget = device`
- Bestehende aktive Eintraege bleiben unveraendert.

Getesteter Ignore-Flow:

- `neuer_test_sound` wurde im Dashboard auf `ignored` gesetzt.
- `entriesStats.ignored = 1`
- `entriesStats.missingFile = 0`
- Wiederkehr-Test mit gleichem Trigger hat keinen zweiten Eintrag erzeugt.
- `autoEntry.created = false`
- `reason = entry_exists`

Fachregel:

```text
Loeschen = Eintrag wird entfernt. Kommt derselbe SoundAlert wieder rein, wird er neu erkannt und neu angelegt.
Ignorieren = Eintrag bleibt mit Status ignored bestehen. Kommt derselbe SoundAlert wieder rein, wird er nicht als neuer offener Eintrag angelegt.
```

## Direkte Entry-Aktionen

`Loeschen` und `Ignorieren` sind direkte Backend-Aktionen.

Neue/aktuelle direkte Routen:

```text
DELETE /api/soundalerts/entries/:entryKey
POST   /api/soundalerts/entries/:entryKey/delete
POST   /api/soundalerts/entries/:entryKey/ignore
```

Dashboard-Verhalten:

- `Loeschen` fragt nach Bestaetigung.
- Bei Bestaetigung wird der Eintrag direkt im Backend geloescht.
- Danach wird die Liste neu geladen.
- Kein `Config speichern` mehr noetig.
- `Ignorieren` funktioniert analog direkt ueber Backend.

Live-Test `loesch_test_sound`:

Vorher:

```text
fahrstuhl_sound
loesch_test_sound
```

Nach Dashboard-Loeschen ohne Config-Speichern:

```text
fahrstuhl_sound
```

Damit ist die direkte Loeschaktion fachlich bestaetigt.

## Aktiver getesteter Produktiv-Eintrag

```json
{
  "id": "fahrstuhl_sound",
  "enabled": true,
  "status": "active",
  "soundAlertName": "Fahrstuhl Sound",
  "label": "Fahrstuhl Sound",
  "file": "soundalerts/video/3cgn.mp4",
  "mediaType": "video",
  "category": "channel_reward",
  "outputTarget": "overlay",
  "volume": 100
}
```

## Betroffene Dateien der vorherigen Code-Steps

```text
backend/modules/soundalerts_bridge.js
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

## Bewusst offen

- SoundAlerts-Dashboard-Layout der Eintragskarten optisch aufraeumen.
- Filter/Ansichten fuer `active`, `missing_file`, `ignored`, `file_matched`.
- Upload-Zuweisung weiter UX-seitig verbessern.
- Optional Admin-Bereich fuer Test-/Alt-Eintraege.
- MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.

## Naechster sinnvoller Schritt

`STEP193.6 - SoundAlerts Dashboard Layout Cleanup`

Ziel:

- Eintragskarten links lesbar machen.
- Button-Zeilen sauberer ausrichten.
- Ignored/Missing/Active besser anzeigen.
- Keine neue Backend-Funktionalitaet.
