# Changelog

## 2026-05-05

### STEP177 - Tagebuch/Todo DB-Settings und DB-Texte Backend-Grundlage

- `backend/modules/helpers/helper_texts.js` erweitert:
  - neue zentrale Tabelle `module_texts`
  - neue Helper fuer Modultexte: Seed, List, Get, Set
  - bestehende JSON-Message-Funktionen bleiben erhalten
- `backend/modules/tagebuch.js` erweitert:
  - `tagebuch_settings` als DB-Settings-Schicht
  - `module_texts` mit `module_name = tagebuch` als DB-Text-Schicht
  - neue Admin-Routen:
    - `GET/POST /api/tagebuch/admin/settings`
    - `GET/POST /api/tagebuch/admin/texts`
- `backend/modules/todo.js` erweitert:
  - `todo_settings` als DB-Settings-Schicht
  - `module_texts` mit `module_name = todo` als DB-Text-Schicht
  - neue Admin-Routen:
    - `GET/POST /api/todo/admin/settings`
    - `GET/POST /api/todo/admin/texts`
- JSON-Dateien bleiben Seed/Fallback.
- Bestehende Tagebuch-/Todo-Routen bleiben erhalten.
- Keine Dashboard-Frontend-Dateien in diesem STEP geaendert.
- Neue STEP-Doku:
  - `project-state/STEP177_TAGEBUCH_TODO_DB_ADMIN_BACKEND_2026-05-05.md`

### STEP176 - Tagebuch/Todo DB-/Dashboard-Audit

- Audit-/Plan-Doku fuer Tagebuch/Todo erstellt.
- Keine Codeaenderung.
- Neue STEP-Doku:
  - `project-state/STEP176_TAGEBUCH_TODO_DB_DASHBOARD_AUDIT_2026-05-05.md`

### STEP175.5 - Projekt-Dokus nach VIP-Block synchronisiert

- Zentrale Doku-Einstiegspunkte nach STEP174.8 bis STEP175.4 aktualisiert.
- VIP-Handoff als aktuelle Referenz verankert.
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

### STEP175.3 - Grosser VIP-Upload-Umbau verworfen / vereinfacht

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
- Schnellzugriff fuer fehlende Sounds ergaenzt.
- Doppelte Anzeige fehlender Sounds reduziert.
- Keine Backend-/DB-Aenderung.

### STEP174.9 - VIP-Statistikseite ergaenzt

- Neuer Tab `Statistik` im VIP-Dashboard.
- Nutzt vorhandene VIP-Routen.
- Keine neue Tabelle.
- Keine Backend-Route geaendert.

### STEP174.8 - VIP-Uebersicht aufgeraeumt

- Technische Standardbox aus der VIP-Uebersicht entfernt.
- Rohe Event-Tabelle aus der Uebersicht entfernt.
- Uebersicht zeigt kompakte Metriken, Statuskarten und Warnkarten.
- Events bleiben im Tab `Events`.
- Keine Backend-/DB-Aenderung.

### STEP172 - Sound / Alert / TTS Status Current

- Aktueller Sound-/Alert-/TTS-Stand als neue Referenz dokumentiert.
- Keine Codeaenderung in diesem Doku-STEP.

## 2026-05-04

### STEP047 - VIP Dashboard Base

- Neues Dashboard-Modul fuer VIP angelegt.
- VIP-System ist jetzt in der Community-Sektion sichtbar.
- VIP-Dashboard nutzt bestehende Backend-APIs, kein direkter SQLite-/Dateizugriff.

### STEP046 bis STEP040

- Sound-/Alert-/TTS- und VIP-Backend-Vorarbeiten dokumentiert.

## 2026-05-03

### STEP017 bis STEP015

- VIP-Sound-System-Vorarbeiten und Dokumentation.

## 2026-05-01

### Repository bootstrap

- Repository `ForrestCGN/stream-control-center` eingerichtet.
- Branch `dev` angelegt.
- `.gitignore` angelegt.
- Projektstatus-Dateien vorbereitet.
