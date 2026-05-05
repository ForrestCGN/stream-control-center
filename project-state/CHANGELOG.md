# Changelog

## 2026-05-05

### STEP181.8 - Hug/Rehug Doku-Sync

- Zentrale Projekt-Dokus nach Hug/Rehug-Umstellung aktualisiert.
- `docs/current/CURRENT_SYSTEM_STATUS.md` und `project-state/*` verweisen jetzt auf den neuen STEP181-Stand.
- `stepdone.cmd` als Standardabschluss nach manuellem ZIP-Entpacken dokumentiert.
- Keine Codeaenderung in diesem STEP.

### STEP181.7 - Stepdone CMD-only

- `stepdone.cmd` als reines Batch-Script bereitgestellt.
- Ziel: Nach manuellem ZIP-Entpacken reicht kuenftig ein Befehl:
  - `.\stepdone.cmd "commit beschreibung"`
- Das Script prueft JS-Syntax, staged relevante Projektdateien, blockiert sensible Dateien, committed, pushed nach `origin/dev` und startet das bekannte Live-Deploy-Script.
- Die PowerShell-Variante wurde wegen Parserproblemen verworfen.

### STEP181.4 - Hug/Rehug ohne Typen-Komplexitaet

- Dashboard-Bedienung vereinfacht:
  - Text
  - Antwort-Text
  - Aktiv/Inaktiv
  - Gewichtung
  - Sortierung
- Typen-Tab und Typ-Filter aus der Bedienung entfernt.
- Backend-Auswahl nutzt aktive Textpaare global.
- `hug_types` und `type_id` bleiben nur als Kompatibilitaets-/Migrationsstruktur erhalten.
- Keine Daten geloescht.

### STEP181.2 - Hug/Rehug Textpaare Dashboard

- Hug-Dashboard im Texte-Tab um Kategorien erweitert.
- Kategorie `Hug/Rehug-Paare` als gekoppelte Bearbeitung ergaenzt.
- Neue/erwartete Dashboard-Routen:
  - `GET /api/dashboard/community/hug/text-pairs`
  - `POST /api/dashboard/community/hug/text-pairs`
- Chatweite Hugs, Systemantworten und Toplisten bleiben als Kategorien sichtbar, aber noch nicht editierbar.

### STEP181.1 - Hug/Rehug Textpaare Backend

- `backend/modules/hug.js` auf Schema-Version 3 erweitert.
- Neue Tabelle `hug_text_pairs`.
- `hug_pending_rehugs` um `pair_id` erweitert.
- Bestehende `hug_texts` wurden sanft in gekoppelte Textpaare migriert.
- `!hug` speichert das gezogene Textpaar.
- `!rehug` nutzt exakt den passenden Antworttext ueber `pair_id`.
- Neue Status-/Admin-Routen:
  - `GET /api/hug/status`
  - `GET /api/hug/db/status`
  - `GET /api/dashboard/community/hug/status`
  - `GET/POST /api/hug/admin/text-pairs`
  - `GET/POST /api/dashboard/community/hug/text-pairs`
- Live-Test bestaetigt:
  - `schemaVersion = 3`
  - `hugTextPairs = 30`
  - `activeHugTextPairs = 30`

### STEP180 - Textvarianten Status-/UX-Cleanup

- Status-Ausgaben fuer Tagebuch/Todo auf `module_text_variants` als aktive Varianten-Tabelle bereinigt.
- `module_texts` bleibt als Legacy-Tabelle ausgewiesen.
- Tagebuch-/Todo-Texteditor zeigt lesbarere Labels und kurze Hinweise je Text-Key.
- Platzhalter fuer neue Varianten nutzen lesbare Textnamen.
- Keine bestehende Funktionalitaet entfernt.

### STEP179 - Text-Varianten-Editor fuer Tagebuch/Todo

- Zentrale DB-Tabelle `module_text_variants` fuer mehrere Textvarianten pro Modul/Text-Key ergaenzt.
- Tagebuch und Todo nutzen zufaellige aktive Varianten bei Textausgabe.
- Dashboard-Texte-Tabs von Einzeltexten auf Kategorie-/Varianten-Editor umgestellt.
- JSON bleibt Seed/Fallback; bestehende Funktionen bleiben erhalten.

### STEP178 - Tagebuch/Todo Dashboard Integration

- Tagebuch und Todo im Community-Dashboard aktiviert.
- Neue Dashboard-Module fuer Status, DB-Settings, DB-Texte und Statistiken ergaenzt.
- `index.html`, `app.js` und `controlhome.js` entsprechend erweitert.
- Keine Backend- oder Datenbankdateien geaendert.

### STEP177 - Tagebuch/Todo DB-Settings und DB-Texte Backend-Grundlage

- `backend/modules/helpers/helper_texts.js` erweitert:
  - neue zentrale Tabelle `module_texts`
  - neue Helper fuer Modultexte: Seed, List, Get, Set
  - bestehende JSON-Message-Funktionen bleiben erhalten
- `backend/modules/tagebuch.js` erweitert:
  - `tagebuch_settings` als DB-Settings-Schicht
  - `module_texts` mit `module_name = tagebuch` als DB-Text-Schicht
  - neue Admin-Routen
- `backend/modules/todo.js` erweitert:
  - `todo_settings` als DB-Settings-Schicht
  - `module_texts` mit `module_name = todo` als DB-Text-Schicht
  - neue Admin-Routen
- JSON-Dateien bleiben Seed/Fallback.
- Bestehende Tagebuch-/Todo-Routen bleiben erhalten.

### STEP176 - Tagebuch/Todo DB-/Dashboard-Audit

- Audit-/Plan-Doku fuer Tagebuch/Todo erstellt.
- Keine Codeaenderung.

### STEP175.5 - Projekt-Dokus nach VIP-Block synchronisiert

- Zentrale Doku-Einstiegspunkte nach STEP174.8 bis STEP175.4 aktualisiert.
- VIP-Handoff als aktuelle Referenz verankert.
- Keine Codeaenderung.
- Keine Backend-Aenderung.
- Keine Datenbank-Aenderung.

### STEP175.4 - VIP-Sound Upload-Auswahlfluss verbessert

- `htdocs/dashboard/modules/vip.js` und `htdocs/dashboard/modules/vip.css` angepasst.
- Manuelle Login-Eingabe im Sounds-Tab entfernt.
- Klick auf `Hochladen` oder `Aendern` setzt den User und scrollt zum Upload-Bereich.
- Keine Backend-/DB-Aenderung.

### STEP175.3 - Grosser VIP-Upload-Umbau verworfen / vereinfacht

- Der grosse Upload-Block wurde als zu dominant und verwirrend bewertet.
- Ansatz wurde bewusst verworfen.

### STEP175.2 - VIP-Sound-Vorschau-Buttons ergaenzt

- Vorschau-Buttons `Anhoeren` in Sounds und VIPs-&-Mods ergaenzt.
- Vorschau laeuft direkt im Browser ueber `/assets/sounds/vip/...`.
- Keine Backend-/DB-Aenderung.

### STEP175.1 - VIP-Sound-Verwaltung aufgeraeumt

- Sounds-Seite mit Filter, Suche und Sortierung verbessert.
- Schnellzugriff fuer fehlende Sounds ergaenzt.
- Keine Backend-/DB-Aenderung.

### STEP174.9 - VIP-Statistikseite ergaenzt

- Neuer Tab `Statistik` im VIP-Dashboard.
- Nutzt vorhandene VIP-Routen.
- Keine neue Tabelle.

### STEP174.8 - VIP-Uebersicht aufgeraeumt

- Technische Standardbox aus der VIP-Uebersicht entfernt.
- Rohe Event-Tabelle aus der Uebersicht entfernt.
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
