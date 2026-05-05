# Changelog

## 2026-05-05

### STEP175.5 - Projekt-Dokus nach VIP-Block synchronisiert

- Zentrale Doku-Einstiegspunkte nach STEP174.8 bis STEP175.4 aktualisiert:
  - `docs/current/CURRENT_SYSTEM_STATUS.md`
  - `project-state/CURRENT_STATUS.md`
  - `project-state/CHANGELOG.md`
  - `project-state/FILES.md`
  - `project-state/NEXT_STEPS.md`
- Neue STEP-Doku:
  - `project-state/STEP175_5_PROJECT_DOC_SYNC_AFTER_VIP_BLOCK_2026-05-05.md`
- VIP-Handoff als aktuelle Referenz verankert:
  - `project-state/STEP175_VIP_SOUND_BLOCK_HANDOFF_2026-05-05.md`
- Veraltete Hinweise auf alten VIP-/Upload-Stand korrigiert.
- Keine Codeaenderung.
- Keine Backend-Aenderung.
- Keine Datenbank-Aenderung.

### STEP175.4 - VIP-Sound Upload-Auswahlfluss verbessert

- `htdocs/dashboard/modules/vip.js` und `htdocs/dashboard/modules/vip.css` angepasst.
- Manuelle Login-Eingabe im Sounds-Tab entfernt.
- Links wird der aktuell ausgewaehlte User mit Login, Twitch-Rolle und Soundstatus angezeigt.
- Button `User pruefen` in `Auswahl laden` umbenannt.
- Klick auf `Hochladen` oder `Aendern` setzt den User und scrollt zum Upload-Bereich.
- Upload-Bereich zeigt Ziel-User und erwartete Datei.
- Vorschau-Buttons bleiben erhalten.
- Keine Backend-/DB-Aenderung.

### STEP175.3 - Großer VIP-Upload-Umbau verworfen / vereinfacht

- Der grosse Upload-Block mit Ziel-User/Ziel-Datei/Erlaubt wurde als zu dominant und verwirrend bewertet.
- Der Ansatz wurde bewusst verworfen.
- Upload-UX soll kuenftig nur behutsam verbessert werden.

### STEP175.2 - VIP-Sound-Vorschau-Buttons ergaenzt

- Vorschau-Buttons `Anhoeren` in Sounds und VIPs-&-Mods ergaenzt.
- Vorschau laeuft direkt im Browser ueber `/assets/sounds/vip/...`.
- Neue Vorschau stoppt vorherige Vorschau.
- Kein Sound-System-Queue-Item.
- Keine Backend-/DB-Aenderung.

### STEP175.1 - VIP-Sound-Verwaltung aufgeraeumt

- Sounds-Seite mit Filter, Suche und Sortierung verbessert.
- Filter:
  - Alle
  - Ohne Sound
  - Mit Sound
  - Twitch VIP
  - Twitch Mod
- Sortierung:
  - Fehlende zuerst
  - Name A-Z
  - Rolle
  - laengste Sounds
- Schnellzugriff fuer fehlende Sounds ergaenzt.
- Doppelte Anzeige fehlender Sounds reduziert.
- Keine Backend-/DB-Aenderung.

### STEP174.9 - VIP-Statistikseite ergaenzt

- Neuer Tab `Statistik` im VIP-Dashboard.
- Nutzt vorhandene Routen:
  - `GET /api/vip-sound/stats`
  - `GET /api/vip-sound/events/recent`
  - `GET /api/vip-sound/daily-usage/today`
  - `GET /api/vip-sound/sounds/users`
- Zeigt Events, Top User, Sound-Typen, Sounddatei-Statistik, letzte Ausloesungen, fehlende Sounds und letzte Nutzung pro User.
- Keine neue Tabelle.
- Keine Backend-Route geaendert.

### STEP174.8 - VIP-Uebersicht aufgeraeumt

- Technische Standardbox aus der VIP-Uebersicht entfernt.
- Rohe Event-Tabelle aus der Uebersicht entfernt.
- Uebersicht zeigt jetzt kompakte Metriken, Statuskarten und Warnkarten.
- Events bleiben im Tab `Events`.
- Keine Backend-/DB-Aenderung.

### STEP172 - Sound / Alert / TTS Status Current

- Aktueller Sound-/Alert-/TTS-Stand als neue Referenz dokumentiert:
  - `project-state/STEP172_SOUND_ALERT_TTS_STATUS_CURRENT_2026-05-05.md`
- Zentrale Einstiegspunkte auf den damaligen Stand nachgezogen.
- Live bestaetigt:
  - `alert_system` Version `3`
  - `alert_system` Step `171`
  - Queue leer
  - Current null
  - Overlay-Client verbunden
  - Schema-Version `5`
- Dokumentiert wurden die relevanten Fix-Commits.
- Aktueller Soll-Ablauf dokumentiert:
  - Alert-Hauptsound ueber Sound-System
  - Alert-TTS als eigenes Sound-System-Item hinter Alert-Hauptsound
  - Chat-TTS wartet, bis Alert-Kette idle ist
  - Overlay bleibt bis nach Alert-TTS sichtbar
  - Sound-System bleibt Audio-Wahrheit
- Keine Codeaenderung in diesem Doku-STEP.

## 2026-05-04

### STEP047 - VIP Dashboard Base

- Neues Dashboard-Modul fuer VIP angelegt:
  - `htdocs/dashboard/modules/vip.js`
  - `htdocs/dashboard/modules/vip.css`
- Dashboard-Registrierung ergaenzt.
- VIP-System ist jetzt in der Community-Sektion sichtbar.
- VIP-Overlay-Link zeigt auf `/overlays/vip_sound_overlay_v2.html`.
- VIP-Dashboard nutzt bestehende Backend-APIs, kein direkter SQLite-/Dateizugriff.
- Kein Backend-Umbau in diesem STEP.
- Kein VIP-Song-Upload in diesem STEP.

### STEP046 bis STEP040

- Sound-/Alert-/TTS- und VIP-Backend-Vorarbeiten dokumentiert.
- Details siehe historische STEP-Dateien unter `project-state/`.

## 2026-05-03

### STEP017 bis STEP015

- VIP-Sound-System-Vorarbeiten und Dokumentation.
- Details siehe historische STEP-Dateien unter `project-state/`.

## 2026-05-01

### Repository bootstrap

- Repository `ForrestCGN/stream-control-center` eingerichtet.
- Branch `dev` angelegt.
- `.gitignore` angelegt.
- Projektstatus-Dateien vorbereitet.
