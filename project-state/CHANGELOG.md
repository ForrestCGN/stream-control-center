# Changelog

## 2026-05-09

### STEP202.2 - Loyalty Shadow Mode & Configurable Bonus Rules

- Startstrategie für Loyalty geändert:
  - neues System läuft zuerst im Shadow Mode parallel zu StreamElements.
  - StreamElements bleibt aktiv.
  - User-Punkte-Import kommt später.
- StreamElements-Punkteexport ist kein Blocker mehr für STEP203.
- Konfigurierbare Bonus-Regeln eingeplant:
  - neuer Sub
  - Resub
  - Gift-Sub Gifter
  - Gift-Sub Empfänger
  - Sub-Streak Bonus
  - Follow/Cheer/Tip/Raid
- Neue Zielrichtung:
  - `STEP203 - Loyalty Core DB + Basis-API Shadow Mode`
- Keine Code-/API-/DB-Änderung.

### STEP202.1 - Loyalty DB-First Standard

- Verbindliche Datenhaltungsregel für Loyalty dokumentiert:
  - DB ist Hauptspeicher.
  - JSON ist nur Seed/Fallback/technische Boot-Konfig.
- Festgelegt, dass produktive Loyalty-Daten in die DB gehören.
- Bestätigte StreamElements-Loyalty-Werte aus Screenshots dokumentiert.
- Technische Auslegung dokumentiert:
  - Subscriber erhalten Watch amount 2 x Subscriber multiplier 3 = 6 Kekskrümel.
- Keine Code-/API-/DB-Änderung.

### STEP202 - Loyalty / Kekskrümel Capture & Migration Prep

- Start des Loyalty-/Kekskrümel-Blocks als Doku-/Erfassungs-STEP vorbereitet.
- Bewusst nicht als STEP201 geführt, weil lokal bereits viele STEP201-Diagnosedokumente existieren.
- Erfassungsplan für StreamElements-Daten dokumentiert.
- Geplantes API-Zielbild für spätere Loyalty-Basis dokumentiert.
- Geplante Tabellenstruktur für spätere Umsetzung dokumentiert.
- Harte Punktehoheit aus STEP194 bestätigt.
- Keine Code-/API-/DB-Änderung.

## 2026-05-08

### STEP200.1 - TTS Documentation Sync

- Zentrale Projekt-Dokus nach STEP200 synchronisiert.
- Dokumentiert:
  - TTS-Texte liegen jetzt in `module_text_variants` mit `module_name = 'tts'`.
  - `config/tts_messages.json` bleibt Seed/Fallback.
  - Neue TTS-Textvarianten-Routen `/api/tts/admin/texts`.
  - Dashboard-Tab `Texte` im TTS-Modul.
  - Offene TTS-Folgepunkte nach STEP200.
- Keine Code-/API-/DB-Aenderung.

### STEP200 - TTS Text Variants

- TTS-Chat-/Systemtexte an das globale DB-basierte Textvarianten-System angeschlossen.
- `backend/modules/tts_system.js` nutzt `backend/modules/helpers/helper_texts.js`.
- Neue Routen:
  - `GET /api/tts/admin/texts`
  - `POST /api/tts/admin/texts`
- Dashboard-Tab `Texte` im TTS-Modul ergaenzt.
- Mehrere aktive Varianten pro Text-Key moeglich.
- Backend waehlt zufaellig eine aktive Variante.
- `config/tts_messages.json` bleibt Seed/Fallback.
- Kein Entfernen bestehender TTS-Texte.

## 2026-05-07

### STEP194 - StreamElements Loyalty Migration Architecture

- Architekturstandard fuer die spaetere Migration von StreamElements Loyalty, Stream Store, Giveaways und Chat-Games dokumentiert.
- Harte Punktehoheit festgelegt.
- Keine Code-/API-/DB-Aenderung.
