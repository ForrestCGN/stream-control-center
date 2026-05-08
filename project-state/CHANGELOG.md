# Changelog

## 2026-05-08

### STEP199.5 - TTS Documentation Sync

- Zentrale Projekt-Dokus nach STEP199.1 bis STEP199.4 synchronisiert.
- Dokumentiert:
  - TTS-Backend in `backend/modules/tts_system.js`
  - keine separate TTS-Admin-Datei als Zielstand
  - neue TTS-Standardrouten
  - TTS-Dashboard-Dateien
  - TTS-User-Statistik
  - offene TTS-Folgepunkte
- Keine Code-/API-/DB-Aenderung.

### STEP199.4 - TTS Dashboard Stats Polish

- TTS User-Statistik im Dashboard optisch verbessert.
- Filter-/Sortierbereich responsiver angeordnet.
- Tabellenkopf sticky gemacht.
- Hover-Zeilen und bessere Zahlenlesbarkeit ergaenzt.
- Keine Backend-/DB-Aenderung.

### STEP199.3 - TTS User Statistics

- Neue Backendroute `GET /api/tts/stats/users` ergaenzt.
- User-Auswertung aus `tts_events` aufgebaut:
  - wer wie oft TTS genutzt hat
  - Zeichenverbrauch
  - OK/Fehler
  - Google/Piper-Nutzung
  - Dauer
  - erste/letzte Nutzung
  - Rollen-Auswertung
- Dashboard-Tab `User-Statistik` ergaenzt.
- SQLite-Parameter-Fix fuer User-Stats umgesetzt.

### STEP199.2 - TTS Dashboard Module

- TTS-Dashboard-Modul ergaenzt:
  - `htdocs/dashboard/modules/tts.js`
  - `htdocs/dashboard/modules/tts.css`
- `htdocs/dashboard/index.html` laedt TTS-CSS, TTS-Panel und TTS-Script.
- TTS registriert sich selbst in `window.CGN.modules.tts` und `window.CGN.moduleCatalog.tts`.
- `htdocs/dashboard/app.js` wurde fuer TTS nicht geaendert.
- Dashboard-Tabs: Uebersicht, User-Statistik, Stimmen, Rollen, Sound-System, Settings, Test, Events, Routen.

### STEP199.1 - TTS Standard Routes

- TTS-Standardrouten direkt in `backend/modules/tts_system.js` ergaenzt.
- Keine separate Admin-Datei als Zielstand.
- Die temporaere `backend/modules/tts_admin_api.js` wurde wieder entfernt.
- Neue/standardisierte Routen:
  - `GET /api/tts/config`
  - `GET /api/tts/voices`
  - `GET /api/tts/routes`
  - `GET /api/tts/admin/settings`
  - `POST /api/tts/admin/settings`
- Bereinigte Config-/Voice-Antworten geben keine technischen Zugangswerte und keinen Google-Keyfile-Pfad aus.
- DB-Settings gewinnen gegen JSON-Fallback.

## 2026-05-07

### STEP194 - StreamElements Loyalty Migration Architecture

- Architekturstandard fuer die spaetere Migration von StreamElements Loyalty, Stream Store, Giveaways und Chat-Games dokumentiert.
- Harte Punktehoheit festgelegt:
  - Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
- Dokumentiert:
  - aktuelle sichtbare StreamElements-Loyalty-Settings
  - zentrale Loyalty-Transaktionspflicht
  - Reservierungslogik fuer laufende Sessions
  - Import-Regel fuer StreamElements-Daten
  - Zielmodule fuer Loyalty, Rewards, Giveaways und Loyalty Games
  - Overlay-Regel: Overlays zeigen nur fertige Events und veraendern keine Punkte
  - Dashboard-Zielbild
  - DB-Portabilitaetsregeln fuer neue Loyalty-Features
- Keine Code-/API-/DB-Aenderung.

## 2026-05-06

### STEP193.17.2 - SoundAlerts Final Documentation Sync

- Zentrale Projekt-Dokus nach `STEP193.17.1` synchronisiert.
- Dokumentiert:
  - `soundalerts_bridge` Version `0.1.14`
  - Parser-Formate als dashboardfaehige Settings
  - Review-Workflow fuer neue SoundAlerts
  - automatische Ausgabe nach Medientyp/globalem Audio-/Video-Ziel
  - Filter-Regression-Fix aus `STEP193.17.1`
  - lokaler Overlay-Test und temporaerer Overlay-Test-Override
  - offene Overlay-Bugs als naechster Schwerpunkt
- Keine Code-/API-/DB-Aenderung.

### STEP193.17.1 - SoundAlerts Filter Regression Fix

- Regression im Eintraege-Filter behoben.
- `ruleMatchesFilter` nutzt wieder den aktiven globalen Filter, wenn kein expliziter Filterwert uebergeben wird.
- Filter fuer Alle/Aktiv/Inaktiv/Zur Pruefung/Datei fehlt/Ignoriert funktionieren wieder ueber die zentrale Statuslogik.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.17 - SoundAlerts Output Field Cleanup

- Manuelles Ausgabe-Dropdown aus dem Eintrag-Editor entfernt.
- Ausgabeziel wird automatisch aus Medientyp und globalen Audio-/Video-Zielen bestimmt.
- Audio nutzt das globale Audio-Ziel, Video nutzt das globale Video-Ziel.
- Beim Wechsel von Audio/Video bleibt die automatische Zielzuordnung erhalten.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.16 - SoundAlerts Entry Editor Output/Selection Fix

- `soundalerts_bridge` auf Version `0.1.14` gesetzt.
- Ausgabeziel im Eintrag-Editor orientiert sich an Medientyp und globalem Audio-/Video-Ziel.
- Wechsel von Audio/Video setzt das passende Ausgabeziel.
- Nach Upload/Speichern bleibt der aktuell bearbeitete SoundAlert ausgewaehlt.
- Wenn der Eintrag durch Speichern den Filterbereich verlaesst, wechselt die Ansicht auf `Alle`, statt auf den naechsten Eintrag zu springen.
- Keine DB-Schemaaenderung.

### STEP193.15 - SoundAlerts Test Output Override

- `soundalerts_bridge` auf Version `0.1.13` gesetzt.
- `/api/soundalerts/test/chat` akzeptiert optional `outputTarget`.
- Normaler Test nutzt weiterhin das gespeicherte Ausgabeziel.
- Overlay-Test sendet temporaer `outputTarget: overlay`.
- Gespeicherter Eintrag bleibt unveraendert.
- Keine DB-Schemaaenderung.

### STEP193.14 - SoundAlerts Local Overlay Test Workflow

- Button `Lokales Overlay` im Dashboard ergaenzt.
- Lokaler Overlay-Test-Bereich unter `Bot & Settings` ergaenzt.
- Eintraege zeigen ihr Ausgabeziel.
- Ausgabeziel im Eintrag-Editor bearbeitbar gemacht.
- Hinweise fuer Overlay-/Device-Test ergaenzt.
- Doppelte Status-Chips bei fehlender Datei reduziert.

### STEP193.13 - SoundAlerts Entry Test Buttons

- Eintragskarten um Test-Button ergaenzt.
- Detail-Editor auf Icon-Aktionen umgestellt.
- Test-Button wird nur bei vorhandener Datei angezeigt.
- Test nutzt bestehende Route `/api/soundalerts/test/chat`.

### STEP193.12 - SoundAlerts Parser Formats Dashboard Editor

- Bereich `Chat-Erkennung` unter `Bot & Settings` ergaenzt.
- Parser-Formate im Dashboard sichtbar und bearbeitbar gemacht.
- Formate aktiv/inaktiv schaltbar.
- Lokaler Parser-Test ohne Event-/DB-Eintrag ergaenzt.
- Speichern schreibt `parser.messageFormats` ueber Settings-API.

### STEP193.11.1 - SoundAlerts Parser Settings Serialization Fix

- `soundalerts_bridge` auf Version `0.1.12` gesetzt.
- `parser.messageFormats` wird korrekt als Objekt-Array geladen/gespeichert.
- Kaputte `[object Object]`-Werte fallen auf Default-Formate zurueck.

### STEP193.11 - SoundAlerts Configurable Parser Formats

- `soundalerts_bridge` auf Version `0.1.11` gesetzt.
- Parser-Formate ueber `parser.messageFormats` konfigurierbar gemacht.

### STEP193.10 - SoundAlerts Parser Format Fix

- `soundalerts_bridge` auf Version `0.1.10` gesetzt.
- Parser erkennt zusaetzlich Format `loest ... mit ... aus`.

### STEP193.9 - SoundAlerts Stable Handoff / Doku-Sync

- Stabilen SoundAlerts-Zwischenstand nach STEP193.8.1 dokumentiert.
